import { apiRequest, parseErrorMessage } from "./apiClient";

export const toggleLike = async (postId) => {
  try {
    return await apiRequest(`/api/social/like/${postId}`, { method: "POST" });
  } catch (error) {
    throw new Error(parseErrorMessage(error));
  }
};

export const getLikeCount = async (postId) => {
  try {
    return await apiRequest(`/api/social/like/${postId}/count`, { method: "GET" });
  } catch (error) {
    throw new Error(parseErrorMessage(error));
  }
};

export const checkUserLiked = async (postId) => {
  try {
    return await apiRequest(`/api/social/like/${postId}/status`, { method: "GET" });
  } catch (error) {
    throw new Error(parseErrorMessage(error));
  }
};
