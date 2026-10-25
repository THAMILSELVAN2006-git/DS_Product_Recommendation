import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// Attach JWT from localStorage on every request
// NOTE: localStorage is used for simplicity in this demo project.
// In production, prefer httpOnly cookies to mitigate XSS token theft.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
