import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({ baseURL: API });

api.interceptors.request.use((cfg) => {
  const t = localStorage.getItem("cf_token");
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("cf_token");
      if (window.location.pathname !== "/login") window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export const authRegister = (data) => api.post("/auth/register", data).then((r) => r.data);
export const authLogin = (data) => api.post("/auth/login", data).then((r) => r.data);
export const authMe = () => api.get("/auth/me").then((r) => r.data);

export const getSummary = (month) => api.get(`/summary/${month}`).then((r) => r.data);
export const setSalary = (month, amount) => api.put(`/salary/${month}`, { amount }).then((r) => r.data);
export const addFixedExpense = (data) => api.post(`/fixed-expenses`, data).then((r) => r.data);
export const deleteFixedExpense = (id) => api.delete(`/fixed-expenses/${id}`).then((r) => r.data);
export const addExtraExpense = (data) => api.post(`/extra-expenses`, data).then((r) => r.data);
export const deleteExtraExpense = (id) => api.delete(`/extra-expenses/${id}`).then((r) => r.data);
export const addInvestment = (data) => api.post(`/investments`, data).then((r) => r.data);
export const deleteInvestment = (id) => api.delete(`/investments/${id}`).then((r) => r.data);
export const getPortfolio = () => api.get(`/portfolio`).then((r) => r.data);
export const getYtd = (year) => api.get(`/ytd/${year}`).then((r) => r.data);
