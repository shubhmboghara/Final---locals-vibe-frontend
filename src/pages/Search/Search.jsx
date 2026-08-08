import React, { useState, useEffect } from "react";
import { FiSearch, FiX, FiInbox } from "react-icons/fi";
import { PostCard, SkeletonPost } from "../../components/PostCard/PostCard";
import { useLocation, useNavigate } from "react-router-dom";
import { getFeed, normalizePost } from "../../api/postApi";
import { getEventsFeed } from "../../api/eventApi";

export default function Search() {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedPosts, setFeedPosts] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const [postRes, eventRes] = await Promise.allSettled([
          getFeed({ page: 1, limit: 100 }),
          getEventsFeed(1, 100)
        ]);
        
        let combined = [];
        if (postRes.status === "fulfilled" && postRes.value && Array.isArray(postRes.value.posts)) {
          combined = [...combined, ...postRes.value.posts.map(normalizePost)];
        }
        
        if (eventRes.status === "fulfilled" && eventRes.value && Array.isArray(eventRes.value.events)) {
          const normalizedEvents = eventRes.value.events.map(event => ({
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
        }
        
        combined.sort((a, b) => new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now()));
        setFeedPosts(combined);
      } catch (err) {
        console.warn("Could not load feed from server for search:", err.message || err);
      }
    };
    fetchPosts();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get("q");
    if (q) {
      setSearch(q);
    }
  }, [location]);

  useEffect(() => {
    if (search) {
      setLoading(true);
      const t = setTimeout(() => setLoading(false), 600);
      return () => clearTimeout(t);
    }
  }, [search]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/search?q=${encodeURIComponent(search.trim())}`);
    } else {
      navigate(`/search`);
    }
  };

  const filteredPosts = feedPosts.filter((p) => {
    const searchLower = search.toLowerCase();
    const matchesSearch =
      !search.trim() ||
      (p.text || "").toLowerCase().includes(searchLower) ||
      (p.title || "").toLowerCase().includes(searchLower) ||
      (p.question || "").toLowerCase().includes(searchLower) ||
      (p.user || "").toLowerCase().includes(searchLower) ||
      (p.username || "").toLowerCase().includes(searchLower) ||
      (p.location || "").toLowerCase().includes(searchLower) ||
      (p.tags && p.tags.some(tag => tag.toLowerCase().includes(searchLower)));

    return matchesSearch;
  });

  return (
    <div className="w-full">
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-8 py-10 flex flex-col gap-8">
        
        {/* Search Header */}
        <div className="bg-white dark:bg-neutral-800 rounded-[20px] border border-[#E2E8F0] dark:border-neutral-700 p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-[#0F172A] dark:text-white mb-6">Search</h1>
          <form onSubmit={handleSearchSubmit} className="relative group">
            <FiSearch size={22} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8] dark:text-neutral-500 group-focus-within:text-[#006A40] transition-colors z-10" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search posts, events, polls, tags, users..."
              className="w-full pl-12 pr-12 py-4 border border-[#E2E8F0] dark:border-neutral-700 bg-[#F8FAFC] dark:bg-neutral-900 rounded-2xl text-base font-medium outline-none transition-all duration-300 focus:border-[#006A40] focus:ring-4 focus:ring-[#006A40]/10 shadow-sm"
              autoFocus
            />
            {search && (
              <button type="button" onClick={() => { setSearch(""); navigate('/search'); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8] dark:text-neutral-500 hover:text-[#0F172A] dark:text-white p-2 z-10 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors">
                <FiX size={20} />
              </button>
            )}
          </form>
        </div>

        {/* Search Results */}
        <div>
          {search.trim() && (
            <h2 className="text-lg font-semibold text-[#0F172A] dark:text-white mb-6">
              Search Results for <span className="text-[#006A40]">"{search}"</span>
            </h2>
          )}

          {loading ? (
            <>
              <SkeletonPost /><SkeletonPost /><SkeletonPost />
            </>
          ) : filteredPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center bg-white dark:bg-neutral-800 rounded-[20px] border border-[#E2E8F0] dark:border-neutral-700 py-16 px-6">
              <div className="w-16 h-16 rounded-full bg-[#006A40]/10 flex items-center justify-center text-[#006A40] mb-4">
                <FiInbox size={26} />
              </div>
              <h3 className="text-lg font-semibold text-[#0F172A] dark:text-white">No results found</h3>
              <p className="text-sm text-[#64748B] dark:text-neutral-400 mt-1 mb-5">We couldn't find any posts matching your search.</p>
              <button onClick={() => { setSearch(""); navigate('/search'); }} className="px-6 py-2.5 rounded-full bg-[#006A40] text-white text-sm font-semibold transition duration-300 hover:bg-[#00532f]">
                Clear Search
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {filteredPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
