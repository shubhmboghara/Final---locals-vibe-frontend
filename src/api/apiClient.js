import axios from "axios";
import { API_BASE_URL } from "../config/api";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export const apiRequest = async (url, options = {}) => {
  const method = options.method || "GET";
  const data = options.data || undefined;
  const headers = options.headers || {};

  if (!headers["Content-Type"] && !(data instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  try {
    const response = await axiosInstance({ url, method, data, headers });
    // Auto-unwrap: backend wraps everything in { statusCode, data, message }
    // Return response.data.data if it exists, otherwise response.data
    const body = response.data;
    return body?.data !== undefined ? body.data : body;
  } catch (error) {
    if (url === "/api/auth/refresh-token" || url.includes("/api/auth/login")) {
      throw error;
    }

    if (error.response?.status === 401) {
      if (isRefreshing) {
        try {
          const token = await new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          });
          headers.Authorization = `Bearer ${token}`;
          const retryResponse = await axiosInstance({ url, method, data, headers });
          const retryBody = retryResponse.data;
          return retryBody?.data !== undefined ? retryBody.data : retryBody;
        } catch (err) {
          throw err;
        }
      }

      isRefreshing = true;
      let newToken = null;
      try {
        const res = await axios.post(`${API_BASE_URL}/api/auth/refresh-token`, {}, {
          withCredentials: true,
        });
        newToken = res.data?.data?.accessToken || res.data?.accessToken || res.data?.token;
        if (newToken) {
          localStorage.setItem("accessToken", newToken);
        }
        processQueue(null, newToken);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("token");
        window.location.href = "/login";
        throw refreshError;
      } finally {
        isRefreshing = false;
      }

      headers.Authorization = `Bearer ${newToken}`;
      const retryResponse = await axiosInstance({ url, method, data, headers });
      const retryBody = retryResponse.data;
      return retryBody?.data !== undefined ? retryBody.data : retryBody;
    }

    throw error;
  }
};

export const parseErrorMessage = (error) => {
  // Try to get message from backend response body
  const data = error.response?.data;
  if (data) {
    // Our error middleware sends: { statusCode, success, message, errors }
    if (typeof data.message === "string" && data.message.trim() !== "") {
      return data.message;
    }
    if (typeof data.error === "string" && data.error.trim() !== "") {
      return data.error;
    }
    if (Array.isArray(data.errors) && data.errors.length > 0) {
      return data.errors[0];
    }
  }
  // Fallback: strip the ugly axios default message
  const msg = error.message || "";
  if (msg.includes("status code")) {
    return `Server error (${error.response?.status || "unknown"}). Please try again.`;
  }
  return msg || "An unexpected error occurred. Please try again.";
};
