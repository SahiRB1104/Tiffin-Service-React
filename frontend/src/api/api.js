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
      // Handle different error response formats
      let errorMessage = "Request failed";
      
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        // If detail is a string, use it directly
        if (typeof detail === "string") {
          errorMessage = detail;
        }
        // If detail is an array (validation errors), format it
        else if (Array.isArray(detail)) {
          errorMessage = detail.map(e => e.msg || e.message).join(", ");
        }
        // If detail is an object, stringify it
        else if (typeof detail === "object") {
          errorMessage = JSON.stringify(detail);
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      throw new Error(errorMessage);
    }
  },

  post: async (endpoint, body = {}) => {
    try {
      const res = await instance.post(endpoint, body);
      return res.data;
    } catch (err) {
      // Handle different error response formats
      let errorMessage = "Request failed";
      
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        // If detail is a string, use it directly
        if (typeof detail === "string") {
          errorMessage = detail;
        }
        // If detail is an array (validation errors), format it
        else if (Array.isArray(detail)) {
          errorMessage = detail.map(e => e.msg || e.message).join(", ");
        }
        // If detail is an object, stringify it
        else if (typeof detail === "object") {
          errorMessage = JSON.stringify(detail);
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      throw new Error(errorMessage);
    }
  },

  put: async (endpoint, body = {}) => {
    try {
      const res = await instance.put(endpoint, body);
      return res.data;
    } catch (err) {
      // Handle different error response formats
      let errorMessage = "Request failed";
      
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        // If detail is a string, use it directly
        if (typeof detail === "string") {
          errorMessage = detail;
        }
        // If detail is an array (validation errors), format it
        else if (Array.isArray(detail)) {
          errorMessage = detail.map(e => e.msg || e.message).join(", ");
        }
        // If detail is an object, stringify it
        else if (typeof detail === "object") {
          errorMessage = JSON.stringify(detail);
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      throw new Error(errorMessage);
    }
  },

  delete: async (endpoint) => {
    try {
      const res = await instance.delete(endpoint);
      return res.data;
    } catch (err) {
      // Handle different error response formats
      let errorMessage = "Request failed";
      
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        // If detail is a string, use it directly
        if (typeof detail === "string") {
          errorMessage = detail;
        }
        // If detail is an array (validation errors), format it
        else if (Array.isArray(detail)) {
          errorMessage = detail.map(e => e.msg || e.message).join(", ");
        }
        // If detail is an object, stringify it
        else if (typeof detail === "object") {
          errorMessage = JSON.stringify(detail);
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      throw new Error(errorMessage);
    }
  },
};
