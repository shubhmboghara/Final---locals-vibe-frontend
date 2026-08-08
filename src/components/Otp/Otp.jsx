import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { verifyOtp, resendOtp } from "../../api/authApi";

const Otp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || "");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    if (otp.length < 6) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }

    setError("");
    setMessage("");
    setLoading(true);
    try {
      const response = await verifyOtp({ email, otp });
      if (response && response.user) {
        localStorage.setItem("user", JSON.stringify(response.user));
      }
      navigate("/login");
    } catch (err) {
      setError(err.message || "OTP verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError("Please enter your email address to resend OTP.");
      return;
    }
    setError("");
    setMessage("");
    setLoading(true);
    try {
      await resendOtp({ email });
      setMessage("A new OTP has been sent to your email.");
    } catch (err) {
      setError(err.message || "Failed to resend OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex justify-center items-center p-5">
      <div className="w-full max-w-[450px] bg-white dark:bg-neutral-800 p-10 sm:p-10 max-[500px]:p-[30px_20px] rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.1)]">
        
        <h1 className="text-center text-[#006a40] dark:text-[#4ade80] text-[32px] max-[500px]:text-[28px] mb-2 font-bold">
          Verify OTP
        </h1>
        <p className="text-center text-[#666] dark:text-neutral-400 mb-6 text-[15px] max-[500px]:text-sm">
          Enter your email and the 6-digit OTP sent to your account.
        </p>

        {error && (
          <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm mb-4 text-center">
            {error}
          </div>
        )}

        {message && (
          <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-sm mb-4 text-center">
            {message}
          </div>
        )}

        <form onSubmit={handleVerify} className="flex flex-col gap-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email Address"
            className="w-full px-4 py-3 border border-[#d8d8d8] dark:border-neutral-700 rounded-[10px] outline-none transition duration-300 focus:border-[#006a40] focus:shadow-[0_0_0_4px_rgba(0,106,64,0.15)] dark:bg-neutral-900 dark:text-white"
            required
          />

          <input
            type="text"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter 6-digit OTP"
            className="w-full px-4 py-3.5 text-center tracking-[10px] text-xl font-semibold border border-[#d8d8d8] dark:border-neutral-700 rounded-[10px] outline-none transition duration-300 focus:border-[#006a40] focus:shadow-[0_0_0_4px_rgba(0,106,64,0.15)] dark:bg-neutral-900 dark:text-white"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-[10px] bg-[#006a40] text-white text-base font-semibold transition duration-300 hover:bg-[#005132] hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-2"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>

          <p className="text-center text-[#555] dark:text-neutral-400 text-sm mt-2">
            Didn't receive the OTP?{" "}
            <button
              type="button"
              onClick={handleResend}
              disabled={loading}
              className="text-[#006a40] dark:text-[#4ade80] font-semibold hover:underline disabled:opacity-50"
            >
              Resend OTP
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Otp;
