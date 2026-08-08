import React, { useState, useEffect } from "react";
import { FiSearch, FiX, FiInbox } from "react-icons/fi";
import { PostCard, SkeletonPost } from "../../components/PostCard/PostCard";
import { useLocation, useNavigate } from "react-router-dom";
import { searchItems } from "../../api/searchApi";
import { normalizePost } from "../../api/postApi";

const UserCard = ({ user }) => {
  const navigate = useNavigate();
  return (
    <div 
      onClick={() => navigate(`/Profile-View/${user.id}`)}
      className="bg-white dark:bg-neutral-800 rounded-2xl border border-[#E2E8F0] dark:border-neutral-700 p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex items-center gap-4"
    >
      <img 
        src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'U')}&background=random`} 
        alt={user.name} 
        className="w-14 h-14 rounded-full object-cover"
      />
      <div className="flex-1">
        <h3 className="text-lg font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
          {user.name}
          <span className="text-xs font-semibold px-2 py-0.5 bg-[#006A40]/10 text-[#006A40] rounded-full">User</span>
        </h3>
        <p className="text-sm text-[#64748B] dark:text-neutral-400 mt-1">{user.neighborhood}</p>
        {user.bio && <p className="text-sm text-[#334155] dark:text-neutral-300 mt-2 line-clamp-2">{user.bio}</p>}
      </div>
    </div>
  );
};

export default function Search() {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [type, setType] = useState("all"); // "all", "users", "posts", "events", "polls"
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  const location = useLocation();
  const navigate = useNavigate();

  // Parse URL query parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get("q");
    if (q) {
      setSearch(q);
    }
  }, [location.search]);

  // Fetch Search Results
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!search.trim()) {
        setResults([]);
        setTotalResults(0);
        return;
      }
      setLoading(true);
      try {
        const queryType = type === "all" ? "" : type;
        const response = await searchItems({ q: search, type: queryType, page, limit: 20 });
        
        if (response && response.results) {
          const rawResults = response.results;
          
          let normalizedResults = rawResults.map(item => {
            if (item.type === "user") {
              return { ...item, id: item._id };
            } else if (item.type === "post") {
              return normalizePost(item);
            } else if (item.type === "event") {
              return {
                ...item,
                id: item._id,
                eventTitle: item.title,
                eventDate: item.date,
                eventTime: item.startTime ? item.startTime + (item.endTime ? ` - ${item.endTime}` : '') : '',
                organizer: item.organizer || (item.author && item.author.name) || "",
                text: item.description,
                userObj: item.author || {},
                user: item.author?.name || "",
                username: item.author?.email?.split("@")[0] || "",
                userAvatar: item.author?.avatar || "",
                createdAt: item.createdAt
              };
            } else if (item.type === "poll") {
              const totalVotes = item.totalVotes || 0;
              const options = (item.options || []).map(opt => {
                const votesCount = Array.isArray(opt.votes) ? opt.votes.length : 0;
                const pct = totalVotes > 0 ? Math.round((votesCount / totalVotes) * 100) : 0;
                return { label: opt.text, pct };
              });
              return {
                ...item,
                id: item._id,
                question: item.question,
                options,
                totalVotes,
                user: item.author?.name || "",
                username: item.author?.email?.split("@")[0] || "",
                userAvatar: item.author?.avatar || "",
                createdAt: item.createdAt || item.expiresAt
              };
            }
            return item;
          });

          setResults(normalizedResults);
          setTotalPages(response.pagination?.totalPages || 1);
          setTotalResults(response.pagination?.total || 0);
        }
      } catch (err) {
        console.warn("Could not fetch search results:", err.message || err);
      } finally {
        setLoading(false);
      }
    };
    
    const timeoutId = setTimeout(() => {
      fetchSearchResults();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [search, type, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    if (search.trim()) {
      navigate(`/search?q=${encodeURIComponent(search.trim())}`);
    } else {
      navigate(`/search`);
    }
  };

  const handleTypeChange = (newType) => {
    setType(newType);
    setPage(1);
  };

  return (
    <div className="w-full">
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-8 py-10 flex flex-col gap-8">
        
        {/* Search Header */}
        <div className="bg-white dark:bg-neutral-800 rounded-[20px] border border-[#E2E8F0] dark:border-neutral-700 p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-[#0F172A] dark:text-white mb-6">Search</h1>
          
          <form onSubmit={handleSearchSubmit} className="relative group mb-6">
            <FiSearch size={22} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8] dark:text-neutral-500 group-focus-within:text-[#006A40] transition-colors z-10" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search in your neighborhood..."
              className="w-full pl-12 pr-12 py-4 border border-[#E2E8F0] dark:border-neutral-700 bg-[#F8FAFC] dark:bg-neutral-900 rounded-2xl text-base font-medium outline-none transition-all duration-300 focus:border-[#006A40] focus:ring-4 focus:ring-[#006A40]/10 shadow-sm"
              autoFocus
            />
            {search && (
              <button type="button" onClick={() => { setSearch(""); setResults([]); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8] dark:text-neutral-500 hover:text-[#0F172A] dark:text-white p-2 z-10 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors">
                <FiX size={20} />
              </button>
            )}
          </form>

          {/* Filter Buttons */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
            {["all", "users", "posts", "events", "polls"].map((t) => (
              <button
                key={t}
                onClick={() => handleTypeChange(t)}
                className={`px-6 py-2.5 rounded-full text-sm font-semibold transition duration-300 whitespace-nowrap ${
                  type === t
                    ? "bg-[#006A40] text-white"
                    : "bg-[#F8FAFC] dark:bg-neutral-900 border border-[#E2E8F0] dark:border-neutral-700 text-[#64748B] dark:text-neutral-400 hover:text-[#006A40] hover:border-[#006A40]/30"
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Search Results */}
        <div>
          {search.trim() && !loading && (
            <h2 className="text-lg font-semibold text-[#0F172A] dark:text-white mb-6">
              Search Results for <span className="text-[#006A40]">"{search}"</span> ({totalResults})
            </h2>
          )}
          
          {!search.trim() ? (
            <div className="flex flex-col items-center justify-center text-center py-16 px-6">
              <p className="text-[#64748B] dark:text-neutral-400 text-lg">Please enter a search term</p>
            </div>
          ) : loading ? (
            <>
              <SkeletonPost /><SkeletonPost /><SkeletonPost />
            </>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center bg-white dark:bg-neutral-800 rounded-[20px] border border-[#E2E8F0] dark:border-neutral-700 py-16 px-6">
              <div className="w-16 h-16 rounded-full bg-[#006A40]/10 flex items-center justify-center text-[#006A40] mb-4">
                <FiInbox size={26} />
              </div>
              <h3 className="text-lg font-semibold text-[#0F172A] dark:text-white">No results found in your neighborhood</h3>
              <p className="text-sm text-[#64748B] dark:text-neutral-400 mt-1 mb-5">We couldn't find any {type === 'all' ? 'results' : type} matching your search.</p>
              <button onClick={() => { setSearch(""); setResults([]); }} className="px-6 py-2.5 rounded-full bg-[#006A40] text-white text-sm font-semibold transition duration-300 hover:bg-[#00532f]">
                Clear Search
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {results.map((item) => (
                item.type === "user" ? (
                  <UserCard key={item.id} user={item} />
                ) : (
                  <PostCard key={item.id} post={item} />
                )
              ))}
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-[#E2E8F0] dark:border-neutral-700 mt-6">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage(p => p - 1)}
                    className="px-6 py-2 rounded-xl text-sm font-semibold border border-[#E2E8F0] dark:border-neutral-700 disabled:opacity-40 hover:bg-[#F8FAFC] dark:hover:bg-neutral-800 transition text-[#0F172A] dark:text-white"
                  >
                    Previous
                  </button>
                  <span className="text-sm font-medium text-[#64748B] dark:text-neutral-400">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage(p => p + 1)}
                    className="px-6 py-2 rounded-xl text-sm font-semibold border border-[#E2E8F0] dark:border-neutral-700 disabled:opacity-40 hover:bg-[#F8FAFC] dark:hover:bg-neutral-800 transition text-[#0F172A] dark:text-white"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
