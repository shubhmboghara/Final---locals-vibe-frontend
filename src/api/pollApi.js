import { apiRequest, parseErrorMessage } from "./apiClient";

export const createPoll = async (pollData) => {
  try {
    return await apiRequest("/api/poll/create", {
      method: "POST",
      data: pollData,
    });
  } catch (error) {
    throw new Error(parseErrorMessage(error));
  }
};

export const getPollsFeed = async ({ page = 1, limit = 20 } = {}) => {
  try {
    return await apiRequest(`/api/poll/feed?page=${page}&limit=${limit}`, { method: "GET" });
  } catch (error) {
    throw new Error(parseErrorMessage(error));
  }
};

export const getPollById = async (pollId) => {
  try {
    return await apiRequest(`/api/poll/${pollId}`, { method: "GET" });
  } catch (error) {
    throw new Error(parseErrorMessage(error));
  }
};

export const votePoll = async (pollId, optionIndex) => {
  try {
    return await apiRequest(`/api/poll/vote/${pollId}`, {
      method: "POST",
      data: { optionIndex },
    });
  } catch (error) {
    throw new Error(parseErrorMessage(error));
  }
};
