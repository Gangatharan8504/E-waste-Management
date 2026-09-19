import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.DEV ? "http://localhost:8081/api" : "https://e-waste-backend-ruby.vercel.app/api");

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // 15 seconds timeout
});

export const getFileUrl = (filename) => {
  if (!filename) return "";
  if (
    filename.startsWith("http://") || 
    filename.startsWith("https://") || 
    filename.startsWith("data:") || 
    filename.startsWith("blob:")
  ) {
    return filename;
  }
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

// Automatic 1-time retry on transient network errors or cold starts
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    if (!config || config._retryCount >= 1) {
      return Promise.reject(error);
    }

    // Only retry on Network Error or ERR_CONNECTION_RESET
    if (!error.response && error.code !== "ERR_CANCELED") {
      config._retryCount = (config._retryCount || 0) + 1;
      await new Promise((resolve) => setTimeout(resolve, 800));
      return api(config);
    }

    return Promise.reject(error);
  }
);

export default api;
