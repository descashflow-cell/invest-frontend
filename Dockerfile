# --- Build stage ---
FROM node:20-alpine AS builder

WORKDIR /app

# Build-time arg for backend URL (baked into the static bundle)
ARG REACT_APP_BACKEND_URL=http://localhost:8001
ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --network-timeout 600000

COPY . .

# Avoid CI=true treating warnings as errors during craco build
ENV CI=false
RUN yarn build

# --- Runtime stage (nginx) ---
FROM nginx:1.27-alpine

COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=15s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost/ >/dev/null 2>&1 || exit 1

CMD ["nginx", "-g", "daemon off;"]
