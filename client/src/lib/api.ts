// client/src/lib/api.ts
import axios from "axios";

const api = axios.create({
  // Use the environment variable if it exists, otherwise fall back to the local proxy
  baseURL: import.meta.env.VITE_API_URL || "/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("nexora_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;