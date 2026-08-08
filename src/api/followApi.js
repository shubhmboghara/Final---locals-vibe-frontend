import { apiRequest, parseErrorMessage } from "./apiClient";

export const followUser = async (userId) => {
  try {
    return await apiRequest(`/api/follow/${userId}`, { method: "POST" });
  } catch (error) {
    throw new Error(parseErrorMessage(error));
  }
};

export const unfollowUser = async (userId) => {
  try {
    return await apiRequest(`/api/follow/${userId}`, { method: "DELETE" });
  } catch (error) {
    throw new Error(parseErrorMessage(error));
  }
};

export const getFollowers = async (userId, page = 1, limit = 20) => {
  try {
    return await apiRequest(`/api/follow/followers/${userId}?page=${page}&limit=${limit}`, { method: "GET" });
  } catch (error) {
    throw new Error(parseErrorMessage(error));
  }
};

export const getFollowing = async (userId, page = 1, limit = 20) => {
  try {
    return await apiRequest(`/api/follow/following/${userId}?page=${page}&limit=${limit}`, { method: "GET" });
  } catch (error) {
    throw new Error(parseErrorMessage(error));
  }
};

export const getFollowCounts = async (userId) => {
  try {
    return await apiRequest(`/api/follow/counts/${userId}`, { method: "GET" });
  } catch (error) {
    throw new Error(parseErrorMessage(error));
  }
};
