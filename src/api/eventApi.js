import { apiRequest, parseErrorMessage } from "./apiClient";

export const createEvent = async (formData) => {
  try {
    return await apiRequest("/api/events/create", {
      method: "POST",
      data: formData,
      headers: { "Content-Type": "multipart/form-data" },
    });
  } catch (error) {
    throw new Error(parseErrorMessage(error));
  }
};

export const updateEvent = async (eventId, formData) => {
  try {
    return await apiRequest(`/api/events/update/${eventId}`, {
      method: "PUT",
      data: formData,
      headers: { "Content-Type": "multipart/form-data" },
    });
  } catch (error) {
    throw new Error(parseErrorMessage(error));
  }
};

export const deleteEvent = async (eventId) => {
  try {
    return await apiRequest(`/api/events/delete/${eventId}`, { method: "DELETE" });
  } catch (error) {
    throw new Error(parseErrorMessage(error));
  }
};

export const getEventById = async (eventId) => {
  try {
    return await apiRequest(`/api/events/${eventId}`, { method: "GET" });
  } catch (error) {
    throw new Error(parseErrorMessage(error));
  }
};

export const getEventsFeed = async (page = 1, limit = 20) => {
  try {
    return await apiRequest(`/api/events/feed?page=${page}&limit=${limit}`, { method: "GET" });
  } catch (error) {
    throw new Error(parseErrorMessage(error));
  }
};

export const getUserEvents = async (userId, page = 1, limit = 20) => {
  try {
    return await apiRequest(`/api/events/user/${userId}?page=${page}&limit=${limit}`, { method: "GET" });
  } catch (error) {
    throw new Error(parseErrorMessage(error));
  }
};

export const getMyEvents = async (page = 1, limit = 20) => {
  try {
    return await apiRequest(`/api/events/my-events?page=${page}&limit=${limit}`, { method: "GET" });
  } catch (error) {
    throw new Error(parseErrorMessage(error));
  }
};
