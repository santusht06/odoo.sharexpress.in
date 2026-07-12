import axios from "axios";

export const API = (import.meta.env.VITE_API_URL || "http://localhost:8001").replace(/\/$/, "");

export const api = axios.create({
  baseURL: API,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Standard error response handling
    const message = error.response?.data?.detail || error.message || "An error occurred";
    return Promise.reject(message);
  }
);
