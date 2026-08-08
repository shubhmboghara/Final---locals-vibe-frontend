import React, { useState } from "react";
import { FaEye, FaEyeSlash, FaLock } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { changePassword } from "../../api/userApi";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const passwordStrength = () => {
    if (form.newPassword.length >= 8) return "Strong";
    if (form.newPassword.length >= 5) return "Medium";
    if (form.newPassword.length > 0) return "Weak";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!form.oldPassword || !form.newPassword || !form.confirmPassword) {
      setError("Please fill all fields.");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await changePassword({
        oldPassword: form.oldPassword,
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword,
      });
      setMessage("Password changed successfully!");
      setForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (err) {
      setError(err.message || "Failed to change password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F6FBF4] to-[#E6F5EC] p-5 dark:from-neutral-900 dark:to-neutral-800">
      <div className="w-full max-w-md bg-white dark:bg-neutral-800 rounded-2xl shadow-xl p-8">
        <div className="flex justify-center mb-5">
          <div className="w-16 h-16 rounded-full bg-[#006A40] flex items-center justify-center">
            <FaLock className="text-white text-2xl" />
          </div>
        </div>

        <h2 className="text-3xl font-bold text-center text-[#006A40] dark:text-[#4ade80]">
          Change Password
        </h2>

        <p className="text-center text-gray-500 dark:text-neutral-400 mt-2 mb-6 text-sm">
          Create a strong password to keep your account secure.
        </p>

        {error && (
          <div className="p-3 mb-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-xl text-sm text-center font-medium">
            {error}
          </div>
        )}

        {message && (
          <div className="p-3 mb-4 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-xl text-sm text-center font-medium">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Old Password */}
          <div className="relative">
            <input
              type={showOld ? "text" : "password"}
              name="oldPassword"
              placeholder="Old Password"
              value={form.oldPassword}
              onChange={handleChange}
              className="w-full border border-gray-300 dark:border-neutral-700 rounded-lg px-4 py-3 outline-none focus:border-[#006A40] focus:ring-2 focus:ring-[#006A40]/20 dark:bg-neutral-900 dark:text-white"
              required
            />

            <button
              type="button"
              onClick={() => setShowOld(!showOld)}
              className="absolute right-4 top-4 text-gray-500 dark:text-neutral-400"
            >
              {showOld ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {/* New Password */}
          <div className="relative">
            <input
              type={showNew ? "text" : "password"}
              name="newPassword"
              placeholder="New Password"
              value={form.newPassword}
              onChange={handleChange}
              className="w-full border border-gray-300 dark:border-neutral-700 rounded-lg px-4 py-3 outline-none focus:border-[#006A40] focus:ring-2 focus:ring-[#006A40]/20 dark:bg-neutral-900 dark:text-white"
              required
            />

            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-4 top-4 text-gray-500 dark:text-neutral-400"
            >
              {showNew ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {/* Strength */}
          {passwordStrength() && (
            <p
              className={`text-sm font-medium ${
                passwordStrength() === "Strong"
                  ? "text-green-600"
                  : passwordStrength() === "Medium"
                  ? "text-yellow-500"
                  : "text-red-500"
              }`}
            >
              Password Strength: {passwordStrength()}
            </p>
          )}

          {/* Confirm Password */}
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password"
              value={form.confirmPassword}
              onChange={handleChange}
              className="w-full border border-gray-300 dark:border-neutral-700 rounded-lg px-4 py-3 outline-none focus:border-[#006A40] focus:ring-2 focus:ring-[#006A40]/20 dark:bg-neutral-900 dark:text-white"
              required
            />

            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-4 top-4 text-gray-500 dark:text-neutral-400"
            >
              {showConfirm ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {form.confirmPassword &&
            form.newPassword !== form.confirmPassword && (
              <p className="text-red-500 text-sm">
                Passwords do not match.
              </p>
            )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#006A40] text-white py-3 rounded-lg font-semibold hover:bg-[#005132] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Updating..." : "Reset Password"}
          </button>
          <Link to="/forget-password">
            <p className="text-center text-[#006A40] dark:text-[#4ade80] font-semibold hover:underline mt-2 text-sm">
              Forgot your password?
            </p>
          </Link>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
