import { apiRequest } from "./apiClient";
import { parseErrorMessage } from "./apiClient";

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
