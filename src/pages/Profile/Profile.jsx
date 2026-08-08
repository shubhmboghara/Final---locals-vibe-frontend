import React, { useState, useEffect } from "react";
import { PostCard } from "../../components/PostCard/PostCard";
import { Link, useNavigate } from "react-router-dom";
import {
  FiEdit3,
  FiMapPin,
  FiGlobe,
  FiCheckCircle,
} from "react-icons/fi";
import { getProfileMe, getCurrentUser } from "../../api/userApi";
import { getMyPosts, deletePost, normalizePost } from "../../api/postApi";
import { getMyEvents } from "../../api/eventApi";
import { getFollowCounts } from "../../api/followApi";
import FollowListModal from "../../components/FollowListModal/FollowListModal";

const Profile = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Posts");
  const [userData, setUserData] = useState(null);
  const [myPostsList, setMyPostsList] = useState([]);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Modal state for followers/following
  const [modalConfig, setModalConfig] = useState({ isOpen: false, title: "", type: "followers" });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      // getProfileMe returns { user } directly after apiClient unwrap
      const resMe = await getProfileMe().catch(() => null);
      // getCurrentUser returns user object directly
      const userObj = resMe?.user || resMe || (await getCurrentUser().catch(() => null));
      if (userObj && (userObj._id || userObj.id)) {
        setUserData(userObj);

        // Fetch live follow counts
        const uId = userObj._id || userObj.id;
        if (uId) {
          const counts = await getFollowCounts(uId).catch(() => null);
          if (counts) {
            setFollowerCount(typeof counts.followerCount === "number" ? counts.followerCount : 0);
            setFollowingCount(typeof counts.followingCount === "number" ? counts.followingCount : 0);
          }
        }
      }

      // Load my posts and events
      const [myPostsRes, myEventsRes] = await Promise.allSettled([
        getMyPosts({ page: 1, limit: 20 }),
        getMyEvents(1, 20)
      ]);

      let combined = [];

      if (myPostsRes.status === "fulfilled" && myPostsRes.value) {
        const posts = Array.isArray(myPostsRes.value.posts)
          ? myPostsRes.value.posts
          : Array.isArray(myPostsRes.value)
          ? myPostsRes.value
          : [];
        combined = [...combined, ...posts.map(normalizePost).filter(Boolean)];
      }

      if (myEventsRes.status === "fulfilled" && myEventsRes.value) {
        const events = Array.isArray(myEventsRes.value.events)
          ? myEventsRes.value.events
          : Array.isArray(myEventsRes.value)
          ? myEventsRes.value
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
      }

      combined.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      setMyPostsList(combined);
    } catch (err) {
      console.warn("Could not load profile or posts:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const openFollowModal = (type) => {
    setModalConfig({
      isOpen: type === "followers" ? "Followers" : "Following",
      title: type === "followers" ? "Followers" : "Following",
      type,
      isOpen: true,
    });
  };

  const closeFollowModal = () => {
    setModalConfig((prev) => ({ ...prev, isOpen: false }));
  };

  const handleDeletePost = async (postId) => {
    try {
      await deletePost(postId);
      setMyPostsList((prev) => prev.filter((p) => p.id !== postId && p._id !== postId));
    } catch (err) {
      alert(err.message || "Failed to delete post");
    }
  };

  const handleEditPost = (post) => {
    navigate("/post", { state: { postType: "post", editingPost: post.rawPost || post } });
  };

  const postsToDisplay = myPostsList;

  const filteredPosts = postsToDisplay.filter((p) => {
    if (activeTab === "Events") return p.type === "event";
    if (activeTab === "Polls") return p.type === "poll";
    return p.type !== "event" && p.type !== "poll";
  });
  const userPosts = filteredPosts;

  const user = {
    name: userData?.name || "",
    username: userData?.email ? `@${userData.email.split("@")[0]}` : "",
    bio: userData?.bio || "",
    profile: userData?.avatar || "",
    cover: userData?.banner || "",
    state: userData?.state || "",
    city: userData?.city || "",
    neighborhood: userData?.neighborhood || "",
    followers: followerCount,
    following: followingCount,
  };

  return (
    <div className="min-h-screen py-8 px-5">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Cover */}
        <div className="bg-white dark:bg-neutral-800 rounded-3xl overflow-hidden border border-slate-200 dark:border-neutral-700 shadow">
          <div className="relative h-64">
            {user.cover ? (
              <img src={user.cover} className="w-full h-full object-cover" alt="Cover Banner" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#006A40] to-[#0F172A]" />
            )}
            <div className="absolute -bottom-16 left-8">
              {user.profile ? (
                <img src={user.profile} alt="Avatar" className="w-36 h-36 rounded-full border-4 border-white dark:border-neutral-800 object-cover shadow-xl" />
              ) : (
                <div className="w-36 h-36 rounded-full border-4 border-white dark:border-neutral-800 bg-[#006A40] shadow-xl flex items-center justify-center text-white text-4xl font-bold">
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
              )}
            </div>
          </div>

          <div className="pt-20 pb-8 px-8">
            <div className="flex flex-col lg:flex-row justify-between gap-5">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-bold text-neutral-800 dark:text-neutral-100">
                    {user.name}
                  </h1>
                  <FiCheckCircle className="text-[#006A40]" />
                </div>
                
                <div className="flex items-center gap-6 mt-3 text-[#0F172A] dark:text-white text-[15px]">
                  <button
                    onClick={() => openFollowModal("followers")}
                    className="hover:opacity-80 transition cursor-pointer text-left"
                  >
                    <span className="font-bold">{user.followers}</span> <span className="text-slate-600 dark:text-neutral-400">Followers</span>
                  </button>
                  <button
                    onClick={() => openFollowModal("following")}
                    className="hover:opacity-80 transition cursor-pointer text-left"
                  >
                    <span className="font-bold">{user.following}</span> <span className="text-slate-600 dark:text-neutral-400">Following</span>
                  </button>
                </div>

                <p className="mt-4 max-w-3xl text-[#334155] dark:text-neutral-300 leading-relaxed">
                  {user.bio}
                </p>

                <div className="flex flex-wrap gap-4 mt-5 text-sm text-slate-600 dark:text-neutral-400 font-medium">
                  <span className="flex items-center gap-1.5">
                    <FiMapPin className="text-[#006A40]" />
                    {user.city}, {user.state}
                  </span>
                  <span className="flex items-center gap-1.5 bg-[#F1F5F9] dark:bg-neutral-800 px-3 py-1 rounded-full text-[#334155] dark:text-neutral-300">
                    <FiGlobe className="text-[#006A40]" />
                    {user.neighborhood}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 h-10 mt-4 lg:mt-0">
                <Link to="/setting" className="px-6 py-2 rounded-lg bg-[#006A40] text-white hover:bg-[#005234] font-semibold transition-colors flex items-center justify-center gap-2">
                  <FiEdit3 />
                  Edit Profile
                </Link>
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
                className={`flex-1 py-4 text-sm font-semibold transition duration-300 ${activeTab === tab ? "text-[#006A40] border-b-2 border-[#006A40]" : "text-[#64748B] dark:text-neutral-400 hover:bg-slate-50 dark:hover:bg-neutral-700"}`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="p-4 sm:p-6 bg-[#F8FAFC] dark:bg-neutral-900/50">
            {userPosts.map((post) => (
              <PostCard
                key={post.id || post._id}
                post={post}
                isOwnPost={true}
                onDelete={() => handleDeletePost(post.id || post._id)}
                onEdit={() => handleEditPost(post)}
              />
            ))}
            {userPosts.length === 0 && (
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
        userId={userData?._id || userData?.id}
        type={modalConfig.type}
      />
    </div>
  );
};

export default Profile;
