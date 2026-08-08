import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { PostCard } from "../PostCard/PostCard";
import {
  FiMapPin,
  FiGlobe,
  FiUserPlus,
  FiUserCheck,
  FiCheckCircle,
  FiEdit3,
} from "react-icons/fi";
import { getProfileByUserId, getProfileMe, getCurrentUser } from "../../api/userApi";
import { followUser, unfollowUser, getFollowCounts, getFollowers } from "../../api/followApi";
import { getUserPosts, normalizePost } from "../../api/postApi";
import { getUserEvents } from "../../api/eventApi";
import FollowListModal from "../FollowListModal/FollowListModal";

const ProfileView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("Posts");
  const [targetUser, setTargetUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [postsList, setPostsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmittingFollow, setIsSubmittingFollow] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState({ text: "", isError: false });

  // Modal state for followers/following
  const [modalConfig, setModalConfig] = useState({ isOpen: false, title: "", type: "followers" });

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setFeedbackMsg({ text: "", isError: false });

    const loadData = async () => {
      try {
        // 1. Get current user
        const meRes = await getProfileMe().catch(() => null);
        const meObj = meRes?.user || (await getCurrentUser().catch(() => null));
        if (isMounted) setCurrentUser(meObj);

        const currentUserId = meObj?._id || meObj?.id;

        // 2. Get target user
        let targetObj = null;
        if (id) {
          const profileRes = await getProfileByUserId(id).catch(() => null);
          targetObj = profileRes?.user || profileRes;
        }

        // Fallback to current user if id matches or profile not found by ID
        if (!targetObj && meObj) {
          targetObj = meObj;
        }

        if (isMounted) setTargetUser(targetObj);

        const targetUserId = targetObj?._id || targetObj?.id || id;

        if (targetUserId) {
          // 3. Get follow counts and posts
          const [counts, followersRes, userPostsRes, userEventsRes] = await Promise.allSettled([
            getFollowCounts(targetUserId),
            currentUserId && currentUserId !== targetUserId ? getFollowers(targetUserId, 1, 100) : Promise.resolve(null),
            getUserPosts(targetUserId, { page: 1, limit: 20 }),
            getUserEvents(targetUserId, 1, 20)
          ]);

          if (isMounted) {
            if (counts.status === "fulfilled" && counts.value) {
              setFollowerCount(typeof counts.value.followerCount === "number" ? counts.value.followerCount : 0);
              setFollowingCount(typeof counts.value.followingCount === "number" ? counts.value.followingCount : 0);
            }

            if (followersRes.status === "fulfilled" && followersRes.value && Array.isArray(followersRes.value.followers)) {
              const followingCheck = followersRes.value.followers.some(
                (f) => (f._id || f.id) === currentUserId
              );
              setIsFollowing(followingCheck);
            }

            // Combine posts and events
            let combined = [];
            if (userPostsRes.status === "fulfilled" && userPostsRes.value && Array.isArray(userPostsRes.value.posts)) {
              combined = [...combined, ...userPostsRes.value.posts.map(normalizePost)];
            }

            if (userEventsRes.status === "fulfilled" && userEventsRes.value && Array.isArray(userEventsRes.value.events)) {
              const normalizedEvents = userEventsRes.value.events.map(event => ({
                ...event,
                id: event._id,
                type: "event",
                eventTitle: event.title,
                eventDate: event.date,
                eventTime: event.startTime + (event.endTime ? ` - ${event.endTime}` : ''),
                organizer: event.organizer || (event.author && event.author.name) || "Unknown",
                text: event.description,
                userObj: event.author || {},
                user: event.author?.name || "Unknown",
                username: "user",
                profile: event.author?.avatar,
                createdAt: event.createdAt
              }));
              combined = [...combined, ...normalizedEvents];
            }

            combined.sort((a, b) => new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now()));
            setPostsList(combined);
          }
        }
      } catch (err) {
        console.warn("Error loading ProfileView data:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const targetUserId = targetUser?._id || targetUser?.id || id;
  const currentUserId = currentUser?._id || currentUser?.id;
  const isOwnProfile = currentUserId && targetUserId && currentUserId === targetUserId;

  const handleFollowToggle = async () => {
    if (!targetUserId || isSubmittingFollow) return;

    setIsSubmittingFollow(true);
    setFeedbackMsg({ text: "", isError: false });

    try {
      if (isFollowing) {
        await unfollowUser(targetUserId);
        setIsFollowing(false);
        setFollowerCount((prev) => Math.max(0, prev - 1));
        setFeedbackMsg({ text: "Unfollowed successfully", isError: false });
      } else {
        await followUser(targetUserId);
        setIsFollowing(true);
        setFollowerCount((prev) => prev + 1);
        setFeedbackMsg({ text: "Followed successfully!", isError: false });
      }
    } catch (err) {
      setFeedbackMsg({
        text: err.message || "Action failed. Please try again.",
        isError: true,
      });
    } finally {
      setIsSubmittingFollow(false);
      setTimeout(() => setFeedbackMsg({ text: "", isError: false }), 3500);
    }
  };

  const openFollowModal = (type) => {
    setModalConfig({
      isOpen: true,
      title: type === "followers" ? "Followers" : "Following",
      type,
    });
  };

  const closeFollowModal = () => {
    setModalConfig((prev) => ({ ...prev, isOpen: false }));
  };

  const name = targetUser?.name || "";
  const bio = targetUser?.bio || "";
  const profileImg = targetUser?.avatar || targetUser?.profile || "";
  const coverImg = targetUser?.banner || targetUser?.cover || "";
  const city = targetUser?.city || "";
  const state = targetUser?.state || "";
  const neighborhood = targetUser?.neighborhood || "";

  const filteredPosts = postsList.filter((p) => {
    if (activeTab === "Events") return p.type === "event";
    if (activeTab === "Polls") return p.type === "poll";
    return p.type !== "event" && p.type !== "poll";
  });

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-[#006A40] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-sm font-medium text-[#64748B] dark:text-neutral-400">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-5">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Feedback Alert */}
        {feedbackMsg.text && (
          <div
            className={`p-4 rounded-2xl text-sm font-medium border ${
              feedbackMsg.isError
                ? "bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400"
                : "bg-[#006A40]/10 border-[#006A40]/30 text-[#006A40] dark:text-emerald-400"
            }`}
          >
            {feedbackMsg.text}
          </div>
        )}

        {/* Cover & Profile Header */}
        <div className="bg-white dark:bg-neutral-800 rounded-3xl overflow-hidden border border-slate-200 dark:border-neutral-700 shadow">
          <div className="relative h-64">
            {coverImg ? (
              <img src={coverImg} className="w-full h-full object-cover" alt="Cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#006A40] to-[#0F172A]" />
            )}
            <div className="absolute -bottom-16 left-8">
              {profileImg ? (
                <img
                  src={profileImg}
                  alt={name}
                  className="w-36 h-36 rounded-full border-4 border-white dark:border-neutral-800 object-cover shadow-xl"
                />
              ) : (
                <div className="w-36 h-36 rounded-full border-4 border-white dark:border-neutral-800 bg-[#006A40] shadow-xl flex items-center justify-center text-white text-4xl font-bold">
                  {name ? name.charAt(0).toUpperCase() : "U"}
                </div>
              )}
            </div>
          </div>

          <div className="pt-20 pb-8 px-8">
            <div className="flex flex-col lg:flex-row justify-between gap-5">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-bold text-neutral-800 dark:text-neutral-100">
                    {name}
                  </h1>
                  <FiCheckCircle className="text-[#006A40]" />
                </div>
                
                <div className="flex items-center gap-6 mt-3 text-[#0F172A] dark:text-white text-[15px]">
                  <button
                    onClick={() => openFollowModal("followers")}
                    className="hover:opacity-80 transition cursor-pointer text-left"
                  >
                    <span className="font-bold">{followerCount}</span>{" "}
                    <span className="text-slate-600 dark:text-neutral-400">Followers</span>
                  </button>
                  <button
                    onClick={() => openFollowModal("following")}
                    className="hover:opacity-80 transition cursor-pointer text-left"
                  >
                    <span className="font-bold">{followingCount}</span>{" "}
                    <span className="text-slate-600 dark:text-neutral-400">Following</span>
                  </button>
                </div>

                <p className="mt-4 max-w-3xl text-[#334155] dark:text-neutral-300 leading-relaxed">
                  {bio}
                </p>

                <div className="flex flex-wrap gap-4 mt-5 text-sm text-slate-600 dark:text-neutral-400 font-medium">
                  <span className="flex items-center gap-1.5">
                    <FiMapPin className="text-[#006A40]" />
                    {city}, {state}
                  </span>
                  <span className="flex items-center gap-1.5 bg-[#F1F5F9] dark:bg-neutral-800 px-3 py-1 rounded-full text-[#334155] dark:text-neutral-300">
                    <FiGlobe className="text-[#006A40]" />
                    {neighborhood}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 h-10 mt-4 lg:mt-0">
                {isOwnProfile ? (
                  <Link
                    to="/setting"
                    className="px-6 py-2 rounded-lg bg-[#006A40] text-white hover:bg-[#005234] font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <FiEdit3 />
                    Edit Profile
                  </Link>
                ) : (
                  <button
                    disabled={isSubmittingFollow}
                    onClick={handleFollowToggle}
                    className={`px-6 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
                      isFollowing
                        ? "bg-slate-200 dark:bg-neutral-700 text-[#0F172A] dark:text-white hover:bg-slate-300 dark:hover:bg-neutral-600"
                        : "bg-[#006A40] text-white hover:bg-[#005234]"
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <FiUserCheck />
                        Following
                      </>
                    ) : (
                      <>
                        <FiUserPlus />
                        Follow
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* User Posts/Events/Polls */}
        <section className="bg-white dark:bg-neutral-800 rounded-2xl border border-[#E2E8F0] dark:border-neutral-700 shadow-[0_8px_24px_rgba(15,23,42,0.04)] overflow-hidden mt-6 mb-6">
          <div className="flex border-b border-[#E2E8F0] dark:border-neutral-700">
            {["Posts", "Events", "Polls"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 text-sm font-semibold transition duration-300 ${
                  activeTab === tab
                    ? "text-[#006A40] border-b-2 border-[#006A40]"
                    : "text-[#64748B] dark:text-neutral-400 hover:bg-slate-50 dark:hover:bg-neutral-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="p-4 sm:p-6 bg-[#F8FAFC] dark:bg-neutral-900/50">
            {filteredPosts.map((post) => (
              <PostCard
                key={post.id || post._id}
                post={{ ...post, user: name, username: `@${name.toLowerCase().replace(/\s+/g, "")}` }}
              />
            ))}
            {filteredPosts.length === 0 && (
              <div className="text-center py-10 text-[#64748B] dark:text-neutral-400">
                <p>No {activeTab.toLowerCase()} found.</p>
              </div>
            )}
          </div>
        </section>

      </div>

      <FollowListModal
        isOpen={modalConfig.isOpen}
        onClose={closeFollowModal}
        title={modalConfig.title}
        userId={targetUserId}
        type={modalConfig.type}
      />
    </div>
  );
};

export default ProfileView;
