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
export const addIncome = (month, data) => api.post(`/incomes/${month}`, data).then((r) => r.data);
export const updateIncome = (id, data) => api.put(`/incomes/${id}`, data).then((r) => r.data);
export const deleteIncome = (id) => api.delete(`/incomes/${id}`).then((r) => r.data);
export const addFixedExpense = (month, data) => api.post(`/fixed-expenses/${month}`, data).then((r) => r.data);
export const deleteFixedExpense = (id) => api.delete(`/fixed-expenses/${id}`).then((r) => r.data);
export const updateFixedExpense = (id, data) => api.put(`/fixed-expenses/${id}`, data).then((r) => r.data);
export const addExtraExpense = (data) => api.post(`/extra-expenses`, data).then((r) => r.data);
export const deleteExtraExpense = (id) => api.delete(`/extra-expenses/${id}`).then((r) => r.data);
export const addInvestment = (data) => api.post(`/investments`, data).then((r) => r.data);
export const deleteInvestment = (id) => api.delete(`/investments/${id}`).then((r) => r.data);
export const getPortfolio = () => api.get(`/portfolio`).then((r) => r.data);
export const getMonthlyPortfolio = (month) => api.get(`/portfolio/${month}`).then((r) => r.data);
export const getYtd = (year) => api.get(`/ytd/${year}`).then((r) => r.data);
export const getInvestmentsList = () => api.get(`/investments-list`).then((r) => r.data);
export const copyFixedExpense = (month) => api.post(`/fixed-expenses/copy/${month}`).then((r) => r.data);
