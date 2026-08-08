import { apiRequest, parseErrorMessage } from "./apiClient";
import axios from "axios";
import { API_BASE_URL } from "../config/api";

export const registerUser = async (userData) => {
  try {
    return await apiRequest("/api/auth/register", { method: "POST", data: userData });
  } catch (error) {
    throw new Error(parseErrorMessage(error));
  }
};

export const verifyOtp = async ({ email, otp }) => {
  try {
    return await apiRequest("/api/auth/verify-otp", { method: "POST", data: { email, otp } });
  } catch (error) {
    throw new Error(parseErrorMessage(error));
  }
};

export const resendOtp = async ({ email }) => {
  try {
    return await apiRequest("/api/auth/resend-otp", { method: "POST", data: { email } });
  } catch (error) {
    throw new Error(parseErrorMessage(error));
  }
};

export const loginUser = async ({ email, password }) => {
  try {
    
    const response = await axios.post(`${API_BASE_URL}/api/auth/login`, { email, password }, { withCredentials: true });
    const body = response.data;
    
    const data = body?.data || body;
    return data; 
  } catch (error) {
    throw new Error(parseErrorMessage(error));
  }
};

export const logoutUser = async () => {
  try {
    return await apiRequest("/api/auth/logout", { method: "POST" });
  } catch (error) {
    throw new Error(parseErrorMessage(error));
  }
};

export const refreshAccessToken = async (data = {}) => {
  try {
    return await apiRequest("/api/auth/refresh-token", { method: "POST", data });
  } catch (error) {
    throw new Error(parseErrorMessage(error));
  }
};
