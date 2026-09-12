import axios from "axios";

const api = axios.create({
  baseURL: "https://taskflow-a0bm.onrender.com/api",
});

console.log("API URL:", "https://taskflow-a0bm.onrender.com/api");

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;