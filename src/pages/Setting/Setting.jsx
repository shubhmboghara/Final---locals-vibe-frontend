import React, { useState, useEffect } from "react";
import "./Setting.css";
import {
  FiUser,
  FiShield,
  FiLock,
  FiMoon,
  FiSun,
  FiUpload,
  FiTrash2,
  FiPhone,
  FiMail,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme, setTheme } from "../../features/themeSlice";
import {
  getCurrentUser,
  getProfileMe,
  updateProfile,
  uploadAvatar,
  deleteAvatar,
  uploadBanner,
  deleteBanner,
  getPhone,
  savePhone,
  deletePhone,
  requestChangeEmail,
  confirmChangeEmail,
} from "../../api/userApi";

const Card = ({ title, subtitle, children, className = "" }) => (
  <div className={`bg-white dark:bg-neutral-800 rounded-2xl border border-[#E2E8F0] dark:border-neutral-700 shadow-[0_8px_24px_rgba(15,23,42,0.04)] p-6 ${className}`}>
    {title && (
      <div className="mb-4">
        <h3 className="text-[#0F172A] dark:text-white text-base font-semibold">{title}</h3>
        {subtitle && <p className="text-[#64748B] dark:text-neutral-400 text-xs mt-1">{subtitle}</p>}
      </div>
    )}
    {children}
  </div>
);

const AccountSection = () => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Profile state
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");
  const [banner, setBanner] = useState("");
  const [email, setEmail] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [phone, setPhoneInput] = useState("");

  // Email change state
  const [showEmailChangeModal, setShowEmailChangeModal] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailOtp, setEmailOtp] = useState("");
  const [emailStep, setEmailStep] = useState(1); // 1: request, 2: confirm

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setFetching(true);
    try {
      const resMe = await getProfileMe().catch(() => null);
      const userObj = resMe?.user || (await getCurrentUser().catch(() => null)) || {};
      
      setName(userObj.name || "");
      setBio(userObj.bio || "");
      setAvatar(userObj.avatar || "");
      setBanner(userObj.banner || "");
      setEmail(userObj.email || "");
      setState(userObj.state || "");
      setCity(userObj.city || "");
      setNeighborhood(userObj.neighborhood || "");

      // Get phone
      const phoneRes = await getPhone().catch(() => null);
      if (phoneRes && phoneRes.phoneNumber) {
        setPhoneInput(phoneRes.phoneNumber);
      } else if (userObj.phone) {
        setPhoneInput(userObj.phone);
      }
    } catch (err) {
      console.warn("Could not load user data:", err.message);
    } finally {
      setFetching(false);
    }
  };

  // Avatar Handlers
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const res = await uploadAvatar(file);
      if (res?.user?.avatar) {
        setAvatar(res.user.avatar);
      }
      setMessage("Profile avatar updated successfully.");
    } catch (err) {
      setError(err.message || "Failed to upload avatar.");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarDelete = async () => {
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const res = await deleteAvatar();
      setAvatar(res?.user?.avatar || "");
      setMessage("Profile avatar removed.");
    } catch (err) {
      setError(err.message || "Failed to delete avatar.");
    } finally {
      setLoading(false);
    }
  };

  // Banner Handlers
  const handleBannerUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const res = await uploadBanner(file);
      if (res?.user?.banner) {
        setBanner(res.user.banner);
      }
      setMessage("Cover banner updated successfully.");
    } catch (err) {
      setError(err.message || "Failed to upload banner.");
    } finally {
      setLoading(false);
    }
  };

  const handleBannerDelete = async () => {
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const res = await deleteBanner();
      setBanner(res?.user?.banner || "");
      setMessage("Cover banner removed.");
    } catch (err) {
      setError(err.message || "Failed to delete banner.");
    } finally {
      setLoading(false);
    }
  };

  // Profile Save (Name, Bio)
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const res = await updateProfile({ name, bio });
      setMessage("Profile details saved successfully.");
      if (res?.user) {
        setName(res.user.name || name);
        setBio(res.user.bio || bio);
      }
    } catch (err) {
      setError(err.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  // Phone Handlers
  const handleSavePhone = async () => {
    if (!phone || phone.trim().length < 10) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }
    setError("");
    setMessage("");
    setLoading(true);
    try {
      await savePhone({ phoneNumber: phone.trim() });
      setMessage("Phone number saved successfully.");
    } catch (err) {
      setError(err.message || "Failed to save phone number.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePhone = async () => {
    setError("");
    setMessage("");
    setLoading(true);
    try {
      await deletePhone();
      setPhoneInput("");
      setMessage("Phone number removed.");
    } catch (err) {
      setError(err.message || "Failed to delete phone number.");
    } finally {
      setLoading(false);
    }
  };

  // Email Change Handlers
  const handleRequestEmailChange = async (e) => {
    e.preventDefault();
    if (!newEmail) return setError("Please enter new email.");
    setError("");
    setMessage("");
    setLoading(true);
    try {
      await requestChangeEmail({ newEmail });
      setEmailStep(2);
      setMessage("OTP sent to your new email address.");
    } catch (err) {
      setError(err.message || "Failed to request email change.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmEmailChange = async (e) => {
    e.preventDefault();
    if (!emailOtp) return setError("Please enter OTP.");
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const res = await confirmChangeEmail({ otp: emailOtp });
      if (res?.user?.email) {
        setEmail(res.user.email);
      } else {
        setEmail(newEmail);
      }
      setMessage("Email updated successfully.");
      setShowEmailChangeModal(false);
      setEmailStep(1);
      setNewEmail("");
      setEmailOtp("");
    } catch (err) {
      setError(err.message || "Failed to confirm email change.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <Card title="Account Settings" subtitle="Loading your account details...">
        <div className="py-8 text-center text-gray-500">Loading profile data...</div>
      </Card>
    );
  }

  return (
    <Card title="Account Settings" subtitle="Update your photo and personal details.">
      {error && (
        <div className="p-3 mb-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-xl text-sm text-center">
          {error}
        </div>
      )}

      {message && (
        <div className="p-3 mb-4 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-xl text-sm text-center">
          {message}
        </div>
      )}

      {/* Cover Photo / Banner */}
      <div className="mb-6">
        <label className="text-xs font-medium text-[#64748B] dark:text-neutral-400 block mb-2">
          Cover Photo / Banner
        </label>
        <div className="relative h-32 w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-neutral-800 group border dark:border-neutral-700">
          {banner ? (
            <img src={banner} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#006A40] to-[#0F172A]" />
          )}
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <input
              type="file"
              id="banner-upload"
              className="hidden"
              accept="image/*"
              onChange={handleBannerUpload}
              disabled={loading}
            />
            <label
              htmlFor="banner-upload"
              className="cursor-pointer px-4 py-2 rounded-full bg-white/20 dark:bg-neutral-800/40 hover:bg-white/30 backdrop-blur text-white text-xs font-semibold flex items-center gap-2"
            >
              <FiUpload size={14} /> Update Banner
            </label>
            <button
              onClick={handleBannerDelete}
              disabled={loading}
              className="px-4 py-2 rounded-full bg-red-600/60 hover:bg-red-600 backdrop-blur text-white text-xs font-semibold flex items-center gap-2"
            >
              <FiTrash2 size={14} /> Remove
            </button>
          </div>
        </div>
      </div>

      {/* Profile Photo */}
      <div className="mb-6">
        <label className="text-xs font-medium text-[#64748B] dark:text-neutral-400 block mb-2">
          Profile Photo
        </label>
        <div className="flex items-center gap-4">
          {avatar ? (
            <img src={avatar} alt="Profile" className="w-20 h-20 rounded-full border-4 border-white dark:border-neutral-700 shadow-sm object-cover" />
          ) : (
            <div className="w-20 h-20 rounded-full border-4 border-white dark:border-neutral-700 bg-[#006A40] shadow-sm flex items-center justify-center text-white text-2xl font-bold">
              {name ? name.charAt(0).toUpperCase() : "U"}
            </div>
          )}
          <div className="flex gap-2">
            <input
              type="file"
              id="avatar-upload"
              className="hidden"
              accept="image/*"
              onChange={handleAvatarUpload}
              disabled={loading}
            />
            <label
              htmlFor="avatar-upload"
              className="cursor-pointer px-4 py-2 rounded-full bg-[#006A40] text-white text-xs font-semibold transition duration-[250ms] hover:bg-[#00532f] flex items-center gap-2"
            >
              <FiUpload size={14} /> Upload New
            </label>
            <button
              onClick={handleAvatarDelete}
              disabled={loading}
              className="px-4 py-2 rounded-full border border-[#E2E8F0] dark:border-neutral-700 text-[#64748B] dark:text-neutral-400 text-xs font-semibold transition duration-[250ms] hover:border-[#EF4444] hover:text-[#EF4444]"
            >
              Remove
            </button>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSaveProfile} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#64748B] dark:text-neutral-400">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 border border-[#E2E8F0] dark:border-neutral-700 dark:bg-neutral-800 rounded-xl text-sm text-[#1E293B] dark:text-neutral-100 outline-none focus:border-[#006A40] transition"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-medium text-[#64748B] dark:text-neutral-400">Email Address</label>
              <button
                type="button"
                onClick={() => {
                  setShowEmailChangeModal(true);
                  setError("");
                  setMessage("");
                }}
                className="text-xs text-[#006A40] font-semibold hover:underline"
              >
                Change Email
              </button>
            </div>
            <input
              type="email"
              value={email}
              readOnly
              className="w-full px-4 py-2.5 border border-[#E2E8F0] dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 text-[#64748B] dark:text-neutral-400 rounded-xl text-sm cursor-not-allowed outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#64748B] dark:text-neutral-400">State</label>
            <input
              type="text"
              value={state}
              readOnly
              className="w-full px-4 py-2.5 border border-[#E2E8F0] dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 text-[#64748B] dark:text-neutral-400 rounded-xl text-sm cursor-not-allowed outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#64748B] dark:text-neutral-400">City</label>
            <input
              type="text"
              value={city}
              readOnly
              className="w-full px-4 py-2.5 border border-[#E2E8F0] dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 text-[#64748B] dark:text-neutral-400 rounded-xl text-sm cursor-not-allowed outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className="text-xs font-medium text-[#64748B] dark:text-neutral-400">Neighborhood</label>
            <input
              type="text"
              value={neighborhood}
              readOnly
              className="w-full px-4 py-2.5 border border-[#E2E8F0] dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 text-[#64748B] dark:text-neutral-400 rounded-xl text-sm cursor-not-allowed outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-[#64748B] dark:text-neutral-400 block mb-1.5">Bio</label>
          <textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full px-4 py-2.5 border border-[#E2E8F0] dark:border-neutral-700 dark:bg-neutral-800 rounded-xl text-sm text-[#1E293B] dark:text-neutral-100 outline-none resize-none transition focus:border-[#006A40]"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-full bg-[#006A40] text-white text-sm font-semibold transition hover:bg-[#00532f] disabled:opacity-70"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>

      {/* Phone Number Section */}
      <div className="mt-8 pt-6 border-t border-[#E2E8F0] dark:border-neutral-700">
        <h4 className="text-sm font-semibold text-[#0F172A] dark:text-white mb-3 flex items-center gap-2">
          <FiPhone className="text-[#006A40]" /> Phone Number Settings
        </h4>
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhoneInput(e.target.value)}
            placeholder="Enter 10-digit phone number"
            className="flex-1 px-4 py-2.5 border border-[#E2E8F0] dark:border-neutral-700 dark:bg-neutral-800 rounded-xl text-sm text-[#1E293B] dark:text-neutral-100 outline-none focus:border-[#006A40]"
          />
          <button
            type="button"
            onClick={handleSavePhone}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-[#006A40] text-white text-xs font-semibold hover:bg-[#00532f] disabled:opacity-70"
          >
            Save Phone
          </button>
          <button
            type="button"
            onClick={handleDeletePhone}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl border border-red-300 text-red-600 dark:text-red-400 text-xs font-semibold hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-70"
          >
            Delete Phone
          </button>
        </div>
      </div>

      {/* Modal for Email Change */}
      {showEmailChangeModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-800 p-6 rounded-2xl max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-[#006A40] dark:text-[#4ade80]">
              Change Email Address
            </h3>

            {emailStep === 1 ? (
              <form onSubmit={handleRequestEmailChange} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-600 dark:text-neutral-400 mb-1 block">
                    New Email Address
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="Enter new email"
                    className="w-full px-4 py-2.5 border rounded-xl dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowEmailChangeModal(false)}
                    className="px-4 py-2 text-xs font-semibold border rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 text-xs font-semibold bg-[#006A40] text-white rounded-lg hover:bg-[#00532f]"
                  >
                    {loading ? "Sending..." : "Send OTP"}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleConfirmEmailChange} className="space-y-4">
                <p className="text-xs text-gray-500 dark:text-neutral-400">
                  Enter the 6-digit OTP sent to <span className="font-semibold">{newEmail}</span>
                </p>
                <div>
                  <label className="text-xs font-medium text-gray-600 dark:text-neutral-400 mb-1 block">
                    OTP Code
                  </label>
                  <input
                    type="text"
                    value={emailOtp}
                    onChange={(e) => setEmailOtp(e.target.value)}
                    placeholder="Enter OTP"
                    className="w-full px-4 py-2.5 border rounded-xl dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEmailStep(1)}
                    className="px-4 py-2 text-xs font-semibold border rounded-lg"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 text-xs font-semibold bg-[#006A40] text-white rounded-lg hover:bg-[#00532f]"
                  >
                    {loading ? "Confirming..." : "Confirm Email"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};

const SecuritySection = () => (
  <div className="flex flex-col gap-4">
    <Card title="Password & Authentication" subtitle="Manage your password settings to ensure your account remains secure.">
      <div className="flex flex-col sm:flex-row gap-4 mt-2">
        <Link to="/Reset-Password" className="flex-1 sm:flex-none">
          <button className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#006A40] text-white text-sm font-semibold transition duration-[250ms] hover:bg-[#00532f] shadow-sm hover:shadow-md">
            <FiLock size={16} /> Change Password
          </button>
        </Link>
        <Link to="/Forget-Password" className="flex-1 sm:flex-none">
          <button className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-[#E2E8F0] dark:border-neutral-700 text-[#1E293B] dark:text-neutral-100 text-sm font-semibold transition duration-[250ms] hover:border-[#006A40] dark:hover:border-[#4ade80] hover:text-[#006A40] dark:hover:text-[#4ade80] bg-white dark:bg-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-700 shadow-sm hover:shadow-md">
            <FiLock size={16} /> Forget Password
          </button>
        </Link>
      </div>
    </Card>
  </div>
);

const AppearanceSection = () => {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme.mode);

  return (
    <div className="flex flex-col gap-4">
      <Card title="Theme">
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Light", value: "light", icon: FiSun },
            { label: "Dark", value: "dark", icon: FiMoon },
          ].map(({ label, value, icon: Icon }) => (
            <label
              key={label}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-[#E2E8F0] dark:border-neutral-700 cursor-pointer text-sm text-[#1E293B] dark:text-white transition duration-[250ms] has-[:checked]:border-[#006A40] dark:has-[:checked]:border-[#006A40] has-[:checked]:bg-[#006A40]/5"
            >
              <input 
                type="radio" 
                name="theme" 
                value={value}
                checked={theme === value}
                onChange={() => dispatch(setTheme(value))}
                className="hidden" 
              />
              <Icon size={20} className="text-[#006A40]" />
              {label}
            </label>
          ))}
        </div>
      </Card>
    </div>
  );
};

const Settings = () => {
  const dispatch = useDispatch();
  const darkMode = useSelector((state) => state.theme.mode === "dark");
  const [headerUser, setHeaderUser] = React.useState(null);

  React.useEffect(() => {
    getCurrentUser().then(res => {
      setHeaderUser(res?.user || res || null);
    }).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen font-[Poppins,sans-serif] text-[#1E293B] dark:text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-[#0F172A] dark:text-white tracking-tight">Settings</h1>
            <p className="text-sm text-[#64748B] dark:text-neutral-400 mt-2">Manage your account settings and preferences.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => dispatch(toggleTheme())}
              className="w-10 h-10 flex items-center justify-center rounded-full border border-[#E2E8F0] dark:border-neutral-700 bg-white dark:bg-neutral-800 text-[#64748B] dark:text-neutral-400 transition-all duration-300 hover:border-[#006A40] dark:hover:border-[#4ade80] hover:text-[#006A40] dark:hover:text-[#4ade80] hover:scale-105"
              aria-label="Toggle Theme"
            >
              {darkMode ? <FiSun size={17} /> : <FiMoon size={17} />}
            </button>
            <Link
              to="/Profile"
              className="w-10 cursor-pointer h-10 rounded-full bg-gradient-to-br from-[#006A40] to-[#0F172A] flex items-center justify-center text-white text-sm font-bold shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              {headerUser?.avatar ? (
                <img src={headerUser.avatar} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                headerUser?.name ? headerUser.name.charAt(0).toUpperCase() : "U"
              )}
            </Link>
          </div>
        </header>

        <div className="flex flex-col gap-10">
          <section>
            <AccountSection />
          </section>

          <section>
            <SecuritySection />
          </section>

          <section>
            <AppearanceSection />
          </section>
        </div>
      </div>
    </div>
  );
};

export default Settings;
