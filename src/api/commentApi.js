import { apiRequest, parseErrorMessage } from "./apiClient";

export const addComment = async (postId, content) => {
  try {
    
    return await apiRequest(`/api/social/comment/${postId}`, { method: "POST", data: { content } });
  } catch (error) {
    throw new Error(parseErrorMessage(error));
  }
};

export const getComments = async (postId, page = 1, limit = 20) => {
  try {
    
    return await apiRequest(`/api/social/comments/${postId}?page=${page}&limit=${limit}`, { method: "GET" });
  } catch (error) {
    throw new Error(parseErrorMessage(error));
  }
};

export const deleteComment = async (commentId) => {
  try {
    
    return await apiRequest(`/api/social/comment/${commentId}`, { method: "DELETE" });
  } catch (error) {
    throw new Error(parseErrorMessage(error));
  }
};
