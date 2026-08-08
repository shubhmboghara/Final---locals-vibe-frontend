import { apiRequest } from "./apiClient";
import { parseErrorMessage } from "./apiClient";

/**
 * Searches for content across posts, events, and polls
 * @param {Object} params - Search parameters
 * @param {string} params.q - Search query string
 * @param {string} [params.type='posts'] - Type of content to search for ('posts', 'events', 'polls')
 * @param {number} [params.page=1] - Page number for pagination
 * @param {number} [params.limit=20] - Number of items per page
 * @returns {Promise<Object>} Search results with pagination data
 */
export const searchItems = async ({ q, type = "posts", page = 1, limit = 20 }) => {
  if (!q) throw new Error("Search query is required");

  try {
    const response = await apiRequest(
      `/api/search?q=${encodeURIComponent(q)}&type=${encodeURIComponent(type)}&page=${page}&limit=${limit}`,
      { method: "GET" }
    );
    return response;
  } catch (error) {
    throw new Error(parseErrorMessage(error));
  }
};
