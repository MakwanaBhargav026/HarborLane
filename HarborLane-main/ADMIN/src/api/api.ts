import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Handle token authorization automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle API errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data?.message || error.message);
    return Promise.reject(error);
  }
);

export default api;
