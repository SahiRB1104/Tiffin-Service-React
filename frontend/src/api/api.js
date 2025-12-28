import axios from "axios";

export const API_BASE_URL = "http://localhost:8000";

const instance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/* Attach JWT token */
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* Handle auth expiry globally */
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.dispatchEvent(new CustomEvent("auth-error"));
    }
    return Promise.reject(error);
  }
);

export const api = {
  get: async (endpoint) => {
    try {
      const res = await instance.get(endpoint);
      return res.data;
    } catch (err) {
      throw new Error(
        err.response?.data?.detail ||
        err.message ||
        "Request failed"
      );
    }
  },

  post: async (endpoint, body = {}) => {
    try {
      const res = await instance.post(endpoint, body);
      return res.data;
    } catch (err) {
      throw new Error(
        err.response?.data?.detail ||
        err.message ||
        "Request failed"
      );
    }
  },

  put: async (endpoint, body = {}) => {
    try {
      const res = await instance.put(endpoint, body);
      return res.data;
    } catch (err) {
      throw new Error(
        err.response?.data?.detail ||
        err.message ||
        "Request failed"
      );
    }
  },

  delete: async (endpoint) => {
    try {
      const res = await instance.delete(endpoint);
      return res.data;
    } catch (err) {
      throw new Error(
        err.response?.data?.detail ||
        err.message ||
        "Request failed"
      );
    }
  },
};
