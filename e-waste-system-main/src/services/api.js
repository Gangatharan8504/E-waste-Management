import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8081/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const getFileUrl = (filename) => {
  if (!filename) return "";
  return `${API_BASE_URL}/files/${filename}`;
};

// Attach JWT automatically
api.interceptors.request.use(
  (config) => {

    const token = localStorage.getItem("token");

    if (token) {
      config.headers["Authorization"] = "Bearer " + token;
    }

    return config;

  },
  (error) => Promise.reject(error)
);

export default api;
