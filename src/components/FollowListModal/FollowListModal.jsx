import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiX, FiUser } from "react-icons/fi";
import { getFollowers, getFollowing } from "../../api/followApi";

export const FollowListModal = ({ isOpen, onClose, title, userId, type }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen || !userId) return;

    let isMounted = true;
    setLoading(true);
    setError("");

    const fetchList = async () => {
      try {
        let res;
        if (type === "followers") {
          res = await getFollowers(userId);
          if (isMounted) setUsers(res.followers || []);
        } else {
          res = await getFollowing(userId);
          if (isMounted) setUsers(res.following || []);
        }
      } catch (err) {
        if (isMounted) setError(err.message || "Failed to load list");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchList();

    return () => {
      isMounted = false;
    };
  }, [isOpen, userId, type]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-neutral-800 border border-[#E2E8F0] dark:border-neutral-700 shadow-xl overflow-hidden flex flex-col max-h-[80vh]">
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] dark:border-neutral-700">
          <h2 className="text-lg font-bold text-[#0F172A] dark:text-white">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#64748B] dark:text-neutral-400 hover:text-[#0F172A] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-700 transition"
          >
            <FiX size={20} />
          </button>
        </div>

        
        <div className="p-4 overflow-y-auto flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="w-8 h-8 border-3 border-[#006A40] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs text-[#64748B] dark:text-neutral-400">Loading {title.toLowerCase()}...</p>
            </div>
          ) : error ? (
            <div className="p-4 text-center text-sm text-red-500">{error}</div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-[#64748B] dark:text-neutral-400">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-neutral-700/50 flex items-center justify-center mb-3">
                <FiUser size={24} />
              </div>
              <p className="text-sm font-medium">
                {type === "followers" ? "No followers yet" : "Not following anyone yet"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#E2E8F0] dark:divide-neutral-700/50">
              {users.map((user) => {
                const uId = user._id || user.id;
                const avatar = user.avatar || user.profile;
                const name = user.name || user.email?.split("@")[0] || "Neighbor";

                return (
                  <div key={uId} className="flex items-center justify-between py-3 px-2 hover:bg-slate-50 dark:hover:bg-neutral-700/30 rounded-xl transition">
                    <Link
                      to={`/Profile-View/${uId}`}
                      onClick={onClose}
                      className="flex items-center gap-3 flex-1 min-w-0"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#006A40] to-[#0F172A] flex items-center justify-center text-white font-bold shrink-0 overflow-hidden">
                        {avatar ? (
                          <img src={avatar} alt={name} className="w-full h-full object-cover" />
                        ) : (
                          name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="truncate">
                        <p className="text-sm font-bold text-[#0F172A] dark:text-white truncate">{name}</p>
                        {user.email && (
                          <p className="text-xs text-[#64748B] dark:text-neutral-400 truncate">@{user.email.split("@")[0]}</p>
                        )}
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FollowListModal;
