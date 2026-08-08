import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { forgotPasswordRequest, forgotPasswordConfirm } from "../../api/userApi";

const ForgetPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    setError("");
    setMessage("");
    setLoading(true);
    try {
      await forgotPasswordRequest({ email });
      setOtpSent(true);
      setMessage("OTP has been sent to your email address.");
    } catch (err) {
      setError(err.message || "Failed to send OTP. Please check your email address.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp || !newPassword) {
      setError("Please fill in both OTP and your new password.");
      return;
    }

    setError("");
    setMessage("");
    setLoading(true);
    try {
      await forgotPasswordConfirm({ email, otp, newPassword });
      setMessage("Password reset successfully! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      setError(err.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white dark:bg-neutral-800 rounded-3xl shadow-2xl p-8 border border-gray-100 dark:border-neutral-700">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto rounded-full bg-[#006A40]/10 flex items-center justify-center mb-4">
            <svg
              className="w-10 h-10 text-[#006A40]"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-5a2 2 0 00-2-2h-1V9a5 5 0 00-10 0v3H6a2 2 0 00-2 2v5a2 2 0 002 2z"
              />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Forgot Password?
          </h1>

          <p className="text-gray-500 dark:text-neutral-400 mt-2 text-sm">
            Enter your registered email to receive an OTP and create a new password.
          </p>
        </div>

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

        {/* Form */}
        {!otpSent ? (
          <form onSubmit={handleSendOtp} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-neutral-300 mb-2">
                Email Address
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full border border-gray-300 dark:border-neutral-700 rounded-xl px-4 py-3 outline-none focus:border-[#006A40] focus:ring-2 focus:ring-[#006A40]/20 transition dark:bg-neutral-900 dark:text-white"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#006A40] hover:bg-[#005233] text-white py-3 rounded-xl font-semibold transition duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-neutral-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full border border-gray-200 dark:border-neutral-700 rounded-xl px-4 py-3 bg-gray-50 dark:bg-neutral-900/50 text-gray-500 dark:text-neutral-400 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-neutral-300 mb-2">
                OTP
              </label>

              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit OTP"
                className="w-full border border-gray-300 dark:border-neutral-700 rounded-xl px-4 py-3 outline-none focus:border-[#006A40] focus:ring-2 focus:ring-[#006A40]/20 transition dark:bg-neutral-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-neutral-300 mb-2">
                New Password
              </label>

              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full border border-gray-300 dark:border-neutral-700 rounded-xl px-4 py-3 outline-none focus:border-[#006A40] focus:ring-2 focus:ring-[#006A40]/20 transition dark:bg-neutral-900 dark:text-white"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#006A40] to-[#008751] text-white py-3 rounded-xl font-semibold hover:shadow-lg transition duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>

            <button
              type="button"
              onClick={() => {
                setOtpSent(false);
                setError("");
                setMessage("");
              }}
              className="w-full text-xs text-[#006A40] font-semibold text-center hover:underline mt-2"
            >
              Use a different email
            </button>
          </form>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500 dark:text-neutral-400">
          Remember your password?{" "}
          <Link
            to="/login"
            className="text-[#006A40] font-semibold hover:underline"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgetPassword;
