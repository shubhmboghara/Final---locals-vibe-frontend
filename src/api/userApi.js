import { apiRequest, parseErrorMessage } from "./apiClient";

export const getCurrentUser = async () => {
  try {
    return await apiRequest("/api/users/current-user", { method: "GET" });
  } catch (error) {
    throw new Error(parseErrorMessage(error));
  }
};

export const getProfileMe = async () => {
  try {
    return await apiRequest("/api/users/profile/me", { method: "GET" });
  } catch (error) {
    throw new Error(parseErrorMessage(error));
  }
};

export const getUserById = async (userId) => {
  try {
    return await apiRequest(`/api/users/profile/${userId}`, { method: "GET" });
  } catch (error) {
    throw new Error(parseErrorMessage(error));
  }
};

export const updateProfile = async (data) => {
  try {
    return await apiRequest("/api/users/profile", { method: "PUT", data });
  } catch (error) {
    throw new Error(parseErrorMessage(error));
  }
};

export const uploadAvatar = async (data) => {
  try {
    return await apiRequest("/api/users/upload-avatar", { method: "POST", data, headers: { "Content-Type": "multipart/form-data" } });
  } catch (error) {
    throw new Error(parseErrorMessage(error));
  }
};

export const deleteAvatar = async () => {
  try {
    return await apiRequest("/api/users/delete-avatar", { method: "DELETE" });
  } catch (error) {
    throw new Error(parseErrorMessage(error));
  }
};

export const uploadBanner = async (data) => {
  try {
    return await apiRequest("/api/users/upload-banner", { method: "POST", data, headers: { "Content-Type": "multipart/form-data" } });
  } catch (error) {
    throw new Error(parseErrorMessage(error));
  }
};

export const deleteBanner = async () => {
  try {
    return await apiRequest("/api/users/delete-banner", { method: "DELETE" });
  } catch (error) {
    throw new Error(parseErrorMessage(error));
  }
};

export const getPhone = async () => {
  try {
    return await apiRequest("/api/users/phone", { method: "GET" });
  } catch (error) {
    throw new Error(parseErrorMessage(error));
  }
};

export const savePhone = async (data) => {
  try {
    return await apiRequest("/api/users/phone", { method: "POST", data });
  } catch (error) {
    throw new Error(parseErrorMessage(error));
  }
};

export const deletePhone = async () => {
  try {
    return await apiRequest("/api/users/phone", { method: "DELETE" });
  } catch (error) {
    throw new Error(parseErrorMessage(error));
  }
};

export const requestChangeEmail = async (data) => {
  try {
    return await apiRequest("/api/users/change-email-request", { method: "POST", data });
  } catch (error) {
    throw new Error(parseErrorMessage(error));
  }
};

export const confirmChangeEmail = async (data) => {
  try {
    return await apiRequest("/api/users/change-email-confirm", { method: "POST", data });
  } catch (error) {
    throw new Error(parseErrorMessage(error));
  }
};

export const changePassword = async (data) => {
  try {
    return await apiRequest("/api/users/change-password", { method: "PUT", data });
  } catch (error) {
    throw new Error(parseErrorMessage(error));
  }
};

export const forgotPasswordRequest = async (data) => {
  try {
    return await apiRequest("/api/users/forgot-password-request", { method: "POST", data });
  } catch (error) {
    throw new Error(parseErrorMessage(error));
  }
};

export const forgotPasswordConfirm = async (data) => {
  try {
    return await apiRequest("/api/users/forgot-password-confirm", { method: "POST", data });
  } catch (error) {
    throw new Error(parseErrorMessage(error));
  }
};

export const getProfileByUserId = async (userId) => {
  try {
    return await apiRequest(`/api/users/profile/${userId}`, { method: "GET" });
  } catch (error) {
    throw new Error(parseErrorMessage(error));
  }
};
