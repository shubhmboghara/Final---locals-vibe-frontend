import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FiHeart, FiMessageCircle, FiBookmark,
  FiMapPin, FiClock, FiCalendar, FiPlay, FiCheckCircle, FiUsers, FiAlertTriangle, FiXCircle,
  FiImage, FiFlag, FiMoreHorizontal, FiEdit2, FiTrash2, FiTrash
} from "react-icons/fi";
import { toggleLike, getLikeCount, checkUserLiked } from "../../api/likeApi";
import { addComment, getComments, deleteComment } from "../../api/commentApi";
import { getCurrentUser } from "../../api/userApi";

const TAG_STYLES = {
  Event: "#2563EB", Traffic: "#D97706", Emergency: "#EF4444", Volunteer: "#7C3AED",
  Marketplace: "#D97706", Sports: "#0891B2", Education: "#059669", Technology: "#475569", Health: "#DC2626",
};


const Tag = ({ label }) => (
  <span
    className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
    style={{ backgroundColor: (TAG_STYLES[label] || "#006A40") + "1A", color: TAG_STYLES[label] || "#006A40" }}
  >
    {label}
  </span>
);

export const SkeletonPost = () => (
  <div className="bg-white dark:bg-neutral-800 rounded-[20px] border border-[#E2E8F0] dark:border-neutral-700 p-5 animate-pulse mb-4">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-11 h-11 rounded-full bg-[#E2E8F0]" />
      <div className="flex-1">
        <div className="h-3 w-32 bg-[#E2E8F0] rounded mb-2" />
        <div className="h-2.5 w-20 bg-[#E2E8F0] rounded" />
      </div>
    </div>
    <div className="h-3 w-full bg-[#E2E8F0] rounded mb-2" />
    <div className="h-3 w-2/3 bg-[#E2E8F0] rounded mb-4" />
    <div className="h-40 w-full bg-[#E2E8F0] rounded-2xl" />
  </div>
);

const PostHeader = ({ post, isOwnPost, onDelete, onEdit }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = React.useRef(null);

  React.useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex items-start justify-between mb-3 relative">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#006A40] to-[#0F172A] flex items-center justify-center text-white text-base font-bold shrink-0 overflow-hidden">
          <Link to={`/Profile-View/${post.username}`} className="flex items-center justify-center w-full h-full">
            {post.userAvatar ? (
              <img src={post.userAvatar} alt={post.user} className="w-full h-full object-cover" />
            ) : (
              (post.user || "U").split(" ").map((w) => w[0]).slice(0, 2).join("")
            )}
          </Link>
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <p className="text-base font-semibold text-[#0F172A] dark:text-white">{post.user}</p>
            {post.verified && <FiCheckCircle size={13} className="text-[#006A40]" />}
            {post.member && <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-[#F59E0B]/10 text-[#F59E0B]">Member</span>}
          </div>
          <p className="text-sm text-[#64748B] dark:text-neutral-400 flex items-center gap-1.5 mt-0.5">
            @{post.username} &middot; <FiMapPin size={11} /> {post.location} &middot; {post.time}
          </p>
        </div>
      </div>
      
      {isOwnPost && (
        <div className="relative" ref={menuRef}>
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="text-[#64748B] dark:text-neutral-400 hover:text-[#0F172A] dark:text-white transition p-1 cursor-pointer"
          >
            <FiMoreHorizontal size={20} />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-neutral-800 border border-[#E2E8F0] dark:border-neutral-700 rounded-xl shadow-lg z-10 overflow-hidden">
              <button 
                onClick={() => { setShowMenu(false); onEdit?.(); }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[#64748B] dark:text-neutral-300 hover:bg-[#F8FAFC] dark:hover:bg-neutral-700/50 hover:text-[#0F172A] dark:hover:text-white transition-colors cursor-pointer"
              >
                <FiEdit2 size={14} /> Edit
              </button>
              <button 
                onClick={() => { setShowMenu(false); onDelete?.(); }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
              >
                <FiTrash2 size={14} /> Delete
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const PostActions = ({ post, liked, likeCount, onLike, onToggleComments }) => (
  <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#E2E8F0] dark:border-neutral-700">
    <div className="flex items-center gap-1">
      <button
        onClick={onLike}
        className={"flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition duration-300 cursor-pointer " + (liked ? "text-[#EF4444] bg-[#EF4444]/10" : "text-[#64748B] dark:text-neutral-400 hover:bg-[#F8FAFC] dark:hover:bg-neutral-800")}
      >
        <FiHeart size={18} fill={liked ? "#EF4444" : "none"} className={liked ? "scale-110 transition-transform" : "transition-transform"} />
        {likeCount}
      </button>
      <button
        onClick={onToggleComments}
        className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-[#64748B] dark:text-neutral-400 hover:bg-[#F8FAFC] dark:hover:bg-neutral-800 transition duration-300 cursor-pointer">
        <FiMessageCircle size={18} /> {post.comments}
      </button>
    </div>
  </div>
);

const CommentsPreview = ({ post, showToast }) => {
  const [comments, setComments] = useState([]);
  const [totalComments, setTotalComments] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const postId = post._id || post.id;
  const postAuthorId = post.userId; // Provided by normalizePost

  useEffect(() => {
    let isMounted = true;
    const fetchUser = async () => {
      try {
        const user = await getCurrentUser();
        if (isMounted) setCurrentUser(user);
      } catch (err) {}
    };
    fetchUser();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (!postId) return;
    const fetchComments = async () => {
      setLoading(true);
      try {
        const res = await getComments(postId, page, 20);
        if (page === 1) {
          setComments(res.comments || []);
        } else {
          setComments((prev) => [...prev, ...(res.comments || [])]);
        }
        setTotalComments(res.pagination?.total || 0);
        setTotalPages(res.pagination?.totalPages || 1);
      } catch (err) {
        showToast(err.message || "Failed to load comments");
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, [postId, page]);

  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    if (newComment.length > 100) {
      showToast("Comment cannot exceed 100 characters");
      return;
    }
    
    setIsPosting(true);
    try {
      const res = await addComment(postId, newComment.trim());
      setComments((prev) => [res, ...prev]);
      setTotalComments((c) => c + 1);
      setNewComment("");
      showToast("Comment added");
    } catch (err) {
      showToast(err.message || "Failed to add comment");
    } finally {
      setIsPosting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c._id !== commentId && c.id !== commentId));
      setTotalComments((c) => Math.max(0, c - 1));
      showToast("Comment deleted");
    } catch (err) {
      showToast(err.message || "Failed to delete comment");
    }
  };

  const canDelete = (comment) => {
    if (!currentUser) return false;
    const currentUserId = currentUser._id || currentUser.id;
    const commentAuthorId = comment.author?._id || comment.author?.id || comment.author;
    return currentUserId === commentAuthorId || currentUserId === postAuthorId;
  };

  return (
    <div className="mt-3 pt-3 border-t border-[#E2E8F0] dark:border-neutral-700 flex flex-col gap-2">
      {comments.length === 0 && !loading && (
        <p className="text-sm text-[#64748B] dark:text-neutral-400 text-center py-2">
          No comments yet — be the first to comment
        </p>
      )}

      {comments.map((c) => {
        const cId = c._id || c.id;
        const authorName = c.author?.name || c.user || "Neighbor";
        const authorAvatar = c.author?.avatar || c.profile || "";
        const time = c.createdAt ? new Date(c.createdAt).toLocaleDateString() : c.time || "";

        return (
          <div key={cId} className="flex items-start gap-2 group relative">
            {authorAvatar ? (
              <img
                src={authorAvatar}
                alt={authorName}
                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#006A40] flex items-center justify-center text-white text-xs font-bold shrink-0">
                {authorName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[#1E293B] dark:text-neutral-100 leading-relaxed break-words">
                <span className="font-semibold inline-flex items-center gap-0.5 mr-1">
                  {authorName}
                </span>
                <span className="text-[#64748B] dark:text-neutral-400">{c.content || c.text}</span>
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-[#64748B] dark:text-neutral-400">{time}</span>
                {canDelete(c) && (
                  <button
                    onClick={() => handleDeleteComment(cId)}
                    className="text-xs text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete comment"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {loading && <p className="text-xs text-[#64748B] dark:text-neutral-400 text-center">Loading comments...</p>}

      {page < totalPages && (
        <button
          className="self-start mt-1 cursor-pointer text-xs sm:text-sm font-medium text-[#006A40] hover:text-[#005633] transition-colors duration-300"
          onClick={() => setPage(p => p + 1)}
        >
          View older comments
        </button>
      )}

      <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex w-full items-center rounded-full border border-[#E2E8F0] dark:border-neutral-700 bg-white dark:bg-neutral-800 px-2 py-2 transition-all duration-300 focus-within:border-[#006A40] focus-within:shadow-sm">
          <input
            type="text"
            placeholder="Write a comment..."
            className="flex-1 bg-transparent px-3 text-sm text-[#0F172A] dark:text-white placeholder:text-[#94A3B8] dark:text-neutral-500 outline-none"
            value={newComment}
            onChange={(e) => {
              if (e.target.value.length <= 100) {
                setNewComment(e.target.value);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handlePostComment();
              }
            }}
            maxLength={100}
            disabled={isPosting}
          />
          <div className="flex items-center gap-2 mr-2">
            <span className={`text-xs ${newComment.length === 100 ? 'text-red-500' : 'text-[#64748B] dark:text-neutral-500'}`}>
              {newComment.length}/100
            </span>
            <button
              onClick={handlePostComment}
              disabled={isPosting || !newComment.trim() || newComment.length > 100}
              className="shrink-0 rounded-full bg-[#006A40] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#005633] disabled:opacity-50 transition-all duration-300"
            >
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const MediaPost = ({ post, showToast = () => {} }) => {
  const mediaCount = post.mediaFiles?.length || post.images || (post.type === "video" ? 1 : 0);
  if (!mediaCount) return null;
  
  return (
    <div
      className={`grid gap-1 mb-4 overflow-hidden rounded-2xl ${
        mediaCount === 1 ? "grid-cols-1" :
        mediaCount === 2 ? "grid-cols-2 h-64" :
        mediaCount === 3 ? "grid-cols-2 grid-rows-2 h-80" :
        "grid-cols-2 grid-rows-2 h-80"
      }`}
    >
      {Array.from({ length: Math.min(mediaCount, 4) }).map((_, i) => (
        <div
          key={i}
          className={`group relative overflow-hidden bg-gradient-to-br from-[#006A40]/15 via-[#EAF7F1] to-[#0F172A]/10 cursor-pointer w-full h-full ${
            mediaCount === 3 && i === 0 ? "row-span-2" : ""
          }`}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            {post.mediaFiles && post.mediaFiles[i] ? (
              post.mediaFiles[i].type === "video" ? (
                <video src={post.mediaFiles[i].previewUrl} className="w-full h-full object-cover transition duration-300 group-hover:scale-105" muted playsInline />
              ) : (
                <img src={post.mediaFiles[i].previewUrl} alt="" className="w-full h-full object-cover transition duration-300 group-hover:scale-105" />
              )
            ) : post.type === "video" || (post.mediaTypes && post.mediaTypes[i] === "video") ? (
               <FiPlay size={42} className="text-[#006A40]/40 transition duration-300 group-hover:scale-110" />
            ) : (
               <FiImage size={42} className="text-[#006A40]/40 transition duration-300 group-hover:scale-110" />
            )}
          </div>
          {/* Show remaining media count */}
          {i === 3 && mediaCount > 4 && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-white text-2xl font-bold">
                +{mediaCount - 4}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export const EventPost = ({ post, showToast = () => {} }) => {
  const [joined, setJoined] = useState(false);
  const [interested, setInterested] = useState(false);
  return (
    <div className="rounded-2xl border border-[#E2E8F0] dark:border-neutral-700 overflow-hidden mb-3">
      {post.banner ? (
        <img src={post.banner.previewUrl || post.banner} alt="Event Banner" className="h-28 w-full object-cover" />
      ) : (
        <div className="h-28 bg-gradient-to-br from-[#006A40] to-[#0F172A]" />
      )}
      <div className="p-4">
        <p className="text-sm font-semibold text-[#0F172A] dark:text-white">{post.eventTitle}</p>
        {post.category && (
          <div className="mt-1 mb-2">
            <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-[#006A40]/10 text-[#006A40]">
              {post.category}
            </span>
          </div>
        )}
        <p className="text-sm text-[#64748B] dark:text-neutral-400 mt-1 flex flex-wrap items-center gap-x-3">
          <span className="flex items-center gap-1"><FiCalendar size={12} /> {post.eventDate}</span>
          <span className="flex items-center gap-1"><FiClock size={12} /> {post.eventTime}</span>
        </p>
        <p className="text-[11px] text-[#94A3B8] dark:text-neutral-500 mt-1">By {post.organizer}</p>
        <div className="flex gap-2 mt-3">
          <button onClick={() => { setJoined(!joined); showToast(joined ? "Left event" : "Joined event"); }} className={"px-5 py-2 rounded-full text-sm font-semibold transition duration-300 " + (joined ? "bg-[#006A40]/10 text-[#006A40]" : "bg-[#006A40] text-white hover:bg-[#00532f]")}>
            {joined ? "Joined" : "Join"}
          </button>
          <button onClick={() => setInterested(!interested)} className={"px-5 py-2 rounded-full text-sm font-semibold border transition duration-300 " + (interested ? "border-[#006A40] text-[#006A40]" : "border-[#E2E8F0] dark:border-neutral-700 text-[#64748B] dark:text-neutral-400")}>
            Interested
          </button>
        </div>
      </div>
    </div>
  )
}

export const PollPost = ({ post, showToast = () => {} }) => {
  const [voted, setVoted] = useState(null);

  return (

    <div className="rounded-2xl border border-[#E2E8F0] dark:border-neutral-700 p-4 mb-3">
      <p className="text-sm font-semibold text-[#0F172A] dark:text-white mb-3">{post.question}</p>
      <div className="flex flex-col gap-2">
        {post.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => setVoted(i)}
            className="relative w-full text-left px-4 py-3 rounded-xl border border-[#E2E8F0] dark:border-neutral-700 overflow-hidden text-sm font-medium text-[#1E293B] dark:text-neutral-100"
          >
            {voted !== null && (
              <div className="absolute inset-0 bg-[#006A40]/10" style={{ width: opt.pct + "%" }} />
            )}
            <span className="relative flex items-center justify-between">
              {opt.label}
              {voted !== null && <span className="text-[#006A40] font-semibold">{opt.pct}%</span>}
            </span>
          </button>
        ))}
      </div>
      <p className="text-[10px] text-[#94A3B8] dark:text-neutral-500 mt-2">{post.totalVotes} votes</p>
    </div>
  )
}


export const PostCard = ({ post, showToast = () => {}, isOwnPost = false, onDelete, onEdit }) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes || 0);
  const [showComments, setShowComments] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  const postId = post._id || post.id;

  useEffect(() => {
    let isMounted = true;
    setLikeCount(post.likes || 0);

    if (!postId) return;

    const fetchLikeData = async () => {
      try {
        const [statusRes, countRes] = await Promise.allSettled([
          checkUserLiked(postId),
          getLikeCount(postId),
        ]);

        if (isMounted) {
          if (statusRes.status === "fulfilled" && statusRes.value) {
            setLiked(Boolean(statusRes.value.liked));
          }
          if (countRes.status === "fulfilled" && countRes.value && typeof countRes.value.count === "number") {
            setLikeCount(countRes.value.count);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch like status/count:", err);
      }
    };

    fetchLikeData();

    return () => {
      isMounted = false;
    };
  }, [postId, post.likes]);

  const handleLikeToggle = async () => {
    if (isLiking) return;

    if (!postId) {
      setLiked((prev) => {
        const next = !prev;
        setLikeCount((c) => (next ? c + 1 : Math.max(0, c - 1)));
        showToast(next ? "Post liked" : "Post unliked");
        return next;
      });
      return;
    }

    setIsLiking(true);
    try {
      const res = await toggleLike(postId);
      const newLiked = Boolean(res.liked);
      setLiked(newLiked);
      setLikeCount((c) => (newLiked ? c + 1 : Math.max(0, c - 1)));
      showToast(res.message || (newLiked ? "Post liked" : "Post unliked"));
    } catch (err) {
      showToast(err.message || "Failed to update like status");
    } finally {
      setIsLiking(false);
    }
  };

  const isEmergency = post.type === "emergency";

  if (post.type === "report") return null;

  return (
    <div
      className={"rounded-3xl border p-6 sm:p-8 mb-6 sm:mb-8 transition duration-300 hover:-translate-y-0.5 shadow-sm hover:shadow-md " +
        (isEmergency ? "bg-[#EF4444]/[0.04] border-[#EF4444]/30" : "bg-white dark:bg-neutral-800 border-[#E2E8F0] dark:border-neutral-700")}
    >
      <PostHeader post={post} isOwnPost={isOwnPost} onDelete={onDelete} onEdit={onEdit} />

      {post.text && <p className="text-base text-[#1E293B] dark:text-neutral-100 leading-relaxed mb-4">{post.text}</p>}

      {(post.type === "photo" || post.type === "video" || post.type === "media" || post.type === "post") && (
        <MediaPost post={post} showToast={showToast} />
      )}

      {post.type === "event" && (
        <EventPost post={post} showToast={showToast} />
      )}

      {post.type === "poll" && (
        <PollPost post={post} showToast={showToast} />
      )}

      {post.type !== "event" && post.type !== "poll" && (
        <>
          <PostActions 
            post={post} 
            liked={liked} 
            likeCount={likeCount}
            onLike={handleLikeToggle} 
            onToggleComments={() => setShowComments(!showComments)} 
            showToast={showToast} 
          />
          {showComments && <CommentsPreview post={post} showToast={showToast} />}
        </>
      )}
    </div>
  );
};

