import { PostCard, SkeletonPost } from "../../components/PostCard/PostCard";
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getFeed, deletePost, normalizePost } from "../../api/postApi";
import { getEventsFeed } from "../../api/eventApi";
import { getProfileMe } from "../../api/userApi";
import {
  FiSearch, FiMoreHorizontal, FiHeart, FiMessageCircle, FiBookmark,
  FiMapPin, FiClock, FiFlag, FiCalendar, FiPlus, FiImage, FiVideo, FiHelpCircle,
  FiBarChart2, FiAlertTriangle, FiCheckCircle, FiEdit3, FiX, FiInbox, FiPlay, FiStar, FiGlobe,
} from "react-icons/fi";

const TAG_STYLES = {
  Event: "#2563EB", Traffic: "#D97706", Emergency: "#EF4444", Volunteer: "#7C3AED",
  Marketplace: "#D97706", Sports: "#0891B2", Education: "#059669", Technology: "#475569", Health: "#DC2626",
};





const postTypes = [
  { label: 'Post', icon: FiEdit3 },
  { label: 'Event', icon: FiCalendar },
  { label: 'Poll', icon: FiBarChart2 },
];

const Home = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Post");
  const [loading, setLoading] = useState(true);
  const [fabOpen, setFabOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [feedPosts, setFeedPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const toastId = useRef(0);

  const fetchPosts = async (p = 1) => {
    setLoading(true);
    try {
      const [postRes, eventRes] = await Promise.allSettled([
        getFeed({ page: p, limit: 20 }),
        getEventsFeed(p, 20)
      ]);

      let combined = [];
      let maxTotalPosts = 0;

      if (postRes.status === "fulfilled" && postRes.value) {
        const posts = Array.isArray(postRes.value.posts)
          ? postRes.value.posts
          : Array.isArray(postRes.value)
          ? postRes.value
          : [];
        combined = [...combined, ...posts.map(normalizePost).filter(Boolean)];
        maxTotalPosts = Math.max(maxTotalPosts, postRes.value.totalposts || postRes.value.total || posts.length);
      }

      if (eventRes.status === "fulfilled" && eventRes.value) {
        const events = Array.isArray(eventRes.value.events)
          ? eventRes.value.events
          : Array.isArray(eventRes.value)
          ? eventRes.value
          : [];
        const normalizedEvents = events.map(event => ({
          ...event,
          id: event._id,
          type: "event",
          eventTitle: event.title,
          eventDate: event.date,
          eventTime: event.startTime + (event.endTime ? ` - ${event.endTime}` : ''),
          organizer: event.organizer || (event.author && event.author.name) || "",
          text: event.description,
          userObj: event.author || {},
          user: event.author?.name || "",
          username: event.author?.email?.split("@")[0] || "",
          userAvatar: event.author?.avatar || "",
          createdAt: event.createdAt
        }));
        combined = [...combined, ...normalizedEvents];
        maxTotalPosts = Math.max(maxTotalPosts, eventRes.value.pagination?.total || events.length);
      }

      combined.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      setFeedPosts(combined);
      setTotalPosts(maxTotalPosts);
    } catch (err) {
      console.warn("Could not load feed from server:", err.message || err);
      setFeedPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getProfileMe();
        setCurrentUser(res?.user || res?.data?.user || res?.data || res);
      } catch (err) {}
    };
    if (!currentUser) fetchUser();
    fetchPosts(page);
  }, [page, currentUser]);

  const showToast = (msg) => {
    const id = ++toastId.current;
    setToasts((prev) => [...prev, { id, msg }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 2200);
  };

  const handleDeletePost = async (postId) => {
    try {
      await deletePost(postId);
      setFeedPosts((prev) => prev.filter((p) => p.id !== postId && p._id !== postId));
      showToast("Post deleted");
    } catch (err) {
      showToast(err.message || "Failed to delete post");
    }
  };

  const handleEditPost = (post) => {
    navigate('/post', { state: { postType: 'post', editingPost: post.rawPost || post } });
  };

  const displayList = feedPosts;

  const filteredPosts = displayList.filter((p) => {
    const searchLower = search.toLowerCase();
    const matchesSearch =
      !search.trim() ||
      (p.text || "").toLowerCase().includes(searchLower) ||
      (p.title || "").toLowerCase().includes(searchLower) ||
      (p.question || "").toLowerCase().includes(searchLower) ||
      (p.user || "").toLowerCase().includes(searchLower) ||
      (p.username || "").toLowerCase().includes(searchLower) ||
      (p.location || "").toLowerCase().includes(searchLower) ||
      (p.tags && p.tags.some((tag) => tag.toLowerCase().includes(searchLower)));

    if (!matchesSearch) return false;

    if (filter === "All") return true;
    if (filter === "Event") return p.type === "event";
    if (filter === "Poll") return p.type === "poll";
    if (filter === "Post") return ["photo", "video", "post"].includes(p.type);

    return p.tags && p.tags.includes(filter);
  });

  const handlePostTypeClick = (typeLabel) => {
    const typeId = typeLabel.toLowerCase();
    navigate('/post', { state: { postType: typeId } });
  };

  return (
    <div className="w-full">
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; scroll-behavior: smooth; }
      `}</style>

      <div className="max-w-6xl mx-auto w-full px-4 sm:px-8 py-10 flex flex-col gap-10">
        <main className="w-full rounded-2xl pb-8">
          <div className="pt-4 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 mb-4">
            <form onSubmit={(e) => {
              e.preventDefault();
              if (search.trim()) {
                navigate(`/search?q=${encodeURIComponent(search.trim())}`);
              }
            }} className="relative group">
              <FiSearch size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8] dark:text-neutral-500 group-focus-within:text-[#006A40] transition-colors z-10" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search posts, events, polls, tags, users..."
                className="w-full pl-12 pr-12 py-3 border border-[#E2E8F0] dark:border-neutral-700 bg-white dark:bg-neutral-800 rounded-full text-sm font-medium outline-none transition-all duration-300 focus:border-[#006A40] focus:ring-4 focus:ring-[#006A40]/10 shadow-sm"
              />
              {search && (
                <button type="button" onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8] dark:text-neutral-500 hover:text-[#0F172A] dark:text-white p-1 z-10">
                  <FiX size={18} />
                </button>
              )}
            </form>
          </div>

          <div className="bg-white dark:bg-neutral-800/60 rounded-[16px] sm:rounded-[24px] border border-[#E2E8F0] dark:border-neutral-700 p-2 sm:p-4 mb-6 sm:mb-8 shadow-sm">
            <div className="flex items-center justify-between gap-1 sm:gap-2">
              {postTypes.map(({ label, icon: Icon }) => (
                <button
                  key={label}
                  onClick={() => setFilter(filter === label ? "All" : label)}
                  className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-3 rounded-lg sm:rounded-xl text-[13px] sm:text-sm font-semibold transition duration-300 ${
                    filter === label
                      ? "bg-[#006A40] text-white"
                      : "text-[#64748B] dark:text-neutral-400 bg-transparent hover:bg-[#F8FAFC] dark:hover:bg-neutral-800 hover:text-[#006A40] dark:hover:text-[#4ade80]"
                  }`}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <>
              <SkeletonPost /><SkeletonPost /><SkeletonPost />
            </>
          ) : filteredPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center bg-white dark:bg-neutral-800 rounded-[20px] border border-[#E2E8F0] dark:border-neutral-700 py-16 px-6">
              <div className="w-16 h-16 rounded-full bg-[#006A40]/10 flex items-center justify-center text-[#006A40] mb-4">
                <FiInbox size={26} />
              </div>
              <h3 className="text-lg font-semibold text-[#0F172A] dark:text-white">
                {filter === "Event" ? "No events yet" : "No community posts available."}
              </h3>
              <p className="text-sm text-[#64748B] dark:text-neutral-400 mt-1 mb-5">Try a different filter or check back soon.</p>
              <button onClick={() => setFilter("All")} className="px-6 py-2.5 rounded-full bg-[#006A40] text-white text-sm font-semibold transition duration-300 hover:bg-[#00532f]">
                Explore Community
              </button>
            </div>
          ) : (
            <>
              {filteredPosts.map((post) => (
                <PostCard
                  key={post.id || post._id}
                  post={post}
                  showToast={showToast}
                  isOwnPost={currentUser && (post.userId === currentUser._id || post.userId === currentUser.id)}
                  onDelete={() => handleDeletePost(post.id || post._id)}
                  onEdit={() => handleEditPost(post)}
                />
              ))}

              {totalPosts > 20 && (
                <div className="flex items-center justify-between pt-4 border-t border-[#E2E8F0] dark:border-neutral-700 mt-6">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="px-4 py-2 rounded-xl text-sm font-semibold border border-[#E2E8F0] dark:border-neutral-700 disabled:opacity-40 hover:bg-[#F8FAFC] dark:hover:bg-neutral-800 transition"
                  >
                    Previous
                  </button>
                  <span className="text-xs font-semibold text-[#64748B] dark:text-neutral-400">
                    Page {page} of {Math.ceil(totalPosts / 20)}
                  </span>
                  <button
                    disabled={page >= Math.ceil(totalPosts / 20)}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-4 py-2 rounded-xl text-sm font-semibold border border-[#E2E8F0] dark:border-neutral-700 disabled:opacity-40 hover:bg-[#F8FAFC] dark:hover:bg-neutral-800 transition"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      <div className="fixed bottom-6 right-6 flex flex-col items-end gap-3 z-30">
        {fabOpen && (
          <div className="flex flex-col gap-2 items-end mb-1">
            {[
              { label: "Create Post", labelName: 'Post', icon: FiEdit3, linkToPage: "/post" },
              { label: "Create Poll", labelName: 'Poll', icon: FiBarChart2, linkToPage: "/poll" },
              { label: "Add Event", labelName: 'Event', icon: FiCalendar, linkToPage: "/event" }
            ].map(({ label, labelName, icon: Icon }) => (
              <button
                key={label}
                onClick={() => {
                  showToast(label);
                  setFabOpen(false);
                  handlePostTypeClick(labelName);
                }}
                className="flex items-center gap-2 pl-4 pr-3 py-2.5 rounded-full bg-white dark:bg-neutral-800 border border-[#E2E8F0] dark:border-neutral-700 shadow-lg text-sm font-semibold text-[#0F172A] dark:text-white transition duration-300 hover:-translate-x-1"
              >
                {label}
                <span className="w-7 h-7 rounded-full bg-[#006A40]/10 flex items-center justify-center text-[#006A40]">
                  <Icon size={13} />
                </span>
              </button>
            ))}
          </div>
        )}
        <button
          onClick={() => setFabOpen(!fabOpen)}
          className="w-14 h-14 rounded-full bg-[#006A40] text-white flex items-center justify-center transition duration-300 hover:bg-[#00532f] hover:scale-105 active:scale-95"
        >
          {fabOpen ? <FiX size={22} /> : <FiPlus size={22} />}
        </button>
      </div>

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex flex-col gap-2 z-40 items-center">
        {toasts.map((t) => (
          <div key={t.id} className="flex items-center gap-2 bg-[#0F172A] text-white text-xs font-medium px-4 py-2.5 rounded-full shadow-lg animate-[fadeIn_0.2s_ease]">
            <FiCheckCircle size={13} className="text-[#22C55E]" /> {t.msg}
          </div>
        ))}
      </div>

    </div>
  );
};

export default Home;