import { apiRequest, parseErrorMessage } from "./apiClient";

export const createPost = async ({ content, mediaFiles = [] }) => {
  try {
    const formData = new FormData();
    if (content !== undefined && content !== null) {
      formData.append("content", content);
    }
    if (Array.isArray(mediaFiles)) {
      mediaFiles.forEach((item) => {
        const file = item instanceof File ? item : item?.file || item;
        if (file instanceof File) {
          formData.append("media", file);
        }
      });
    }
    return await apiRequest("/api/post/create", {
      method: "POST",
      data: formData,
      headers: { "Content-Type": "multipart/form-data" },
    });
  } catch (error) {
    throw new Error(parseErrorMessage(error));
  }
};

export const deletePost = async (postId) => {
  try {
    return await apiRequest(`/api/post/delete/${postId}`, { method: "DELETE" });
  } catch (error) {
    throw new Error(parseErrorMessage(error));
  }
};

export const updatePost = async (postId, { content, mediaToRemove = [], newMediaFiles = [] }) => {
  try {
    const formData = new FormData();
    if (content !== undefined && content !== null) {
      formData.append("content", content);
    }
    if (Array.isArray(mediaToRemove)) {
      mediaToRemove.forEach((url) => {
        if (url) formData.append("mediaToRemove", url);
      });
    }
    if (Array.isArray(newMediaFiles)) {
      newMediaFiles.forEach((item) => {
        const file = item instanceof File ? item : item?.file || item;
        if (file instanceof File) {
          formData.append("media", file);
        }
      });
    }
    return await apiRequest(`/api/post/${postId}`, {
      method: "PUT",
      data: formData,
      headers: { "Content-Type": "multipart/form-data" },
    });
  } catch (error) {
    throw new Error(parseErrorMessage(error));
  }
};

export const getFeed = async ({ page = 1, limit = 20 } = {}) => {
  try {
    return await apiRequest(`/api/post/feed?page=${page}&limit=${limit}`, { method: "GET" });
  } catch (error) {
    throw new Error(parseErrorMessage(error));
  }
};

export const getUserPosts = async (userId, { page = 1, limit = 20 } = {}) => {
  try {
    return await apiRequest(`/api/post/user/${userId}?page=${page}&limit=${limit}`, { method: "GET" });
  } catch (error) {
    throw new Error(parseErrorMessage(error));
  }
};

export const getMyPosts = async ({ page = 1, limit = 20 } = {}) => {
  try {
    return await apiRequest(`/api/post/my-posts?page=${page}&limit=${limit}`, { method: "GET" });
  } catch (error) {
    throw new Error(parseErrorMessage(error));
  }
};

// Backend returns posts with "author" field (populated user object)
export const normalizePost = (p) => {
  if (!p) return null;
  const id = p._id || p.id;
  const content = p.content || p.text || "";
  const mediaList = Array.isArray(p.media) ? p.media : (Array.isArray(p.images) ? p.images : []);

  // Backend uses "author" field, frontend was expecting "user"
  const authorObj = p.author || p.user || {};
  let userName = "Neighbor";
  let userAvatar = "";
  let userHandle = "";
  let userId = "";

  if (authorObj && typeof authorObj === "object") {
    userName = authorObj.name || authorObj.email?.split("@")[0] || "Neighbor";
    userAvatar = authorObj.avatar || "";
    userHandle = authorObj.email ? authorObj.email.split("@")[0] : (authorObj._id || "user");
    userId = authorObj._id || authorObj.id || "";
  } else if (typeof authorObj === "string") {
    userId = authorObj;
  }

  const formattedMedia = mediaList.map((item) => {
    const url = typeof item === "string" ? item : (item.url || item.previewUrl || "");
    const isVideo =
      url.toLowerCase().endsWith(".mp4") ||
      url.toLowerCase().endsWith(".webm") ||
      url.toLowerCase().endsWith(".mov");
    return { previewUrl: url, type: isVideo ? "video" : "image" };
  });

  return {
    id,
    _id: id,
    rawPost: p,
    type: p.type || (formattedMedia.some((m) => m.type === "video") ? "video" : formattedMedia.length > 0 ? "photo" : "post"),
    user: userName,
    username: userHandle,
    userId,
    userAvatar,
    verified: p.verified || false,
    member: p.member !== undefined ? p.member : true,
    location: p.location || authorObj?.neighborhood || p.neighborhood || "",
    time: p.createdAt
      ? new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
      : p.time || "Recently",
    text: content,
    mediaFiles: formattedMedia,
    images: formattedMedia.length,
    likes: p.likesCount || (Array.isArray(p.likes) ? p.likes.length : p.likes || 0),
    comments: p.commentsCount || (Array.isArray(p.comments) ? p.comments.length : p.comments || 0),
    shares: p.shares || 0,
    topComments: p.topComments || [],
    allComments: p.allComments || [],
    tags: p.tags || [],
    createdAt: p.createdAt,
  };
};
