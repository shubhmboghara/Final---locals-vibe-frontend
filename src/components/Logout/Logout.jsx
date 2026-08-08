import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";
import { logoutUser } from "../../api/authApi";

const Logout = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logoutUser();
    } catch (err) {
      console.warn("Logout request completed with notice:", err.message);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setLoading(false);
      navigate("/login");
    }
  };

  return (
    <div className="w-full min-h-screen flex justify-center items-center p-5">
      <div className="w-full max-w-[420px] bg-white dark:bg-neutral-800 p-10 sm:p-10 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.1)] flex flex-col gap-4 text-center">
        {/* Icon */}
        <div className="w-24 h-24 mx-auto rounded-full bg-[#006A40]/10 flex items-center justify-center">
          <FiLogOut className="text-[#006A40] text-5xl" />
        </div>

        {/* Heading */}
        <h1 className="text-[#006A40] text-center text-3xl sm:text-[28px] font-bold">
          Logout
        </h1>

        {/* Description */}
        <p className="text-center text-gray-500 dark:text-neutral-400 text-[15px] sm:text-sm mb-2 leading-relaxed">
          Are you sure you want to logout from your account?
          <br />
          You can login again anytime.
        </p>

        {/* Buttons */}
        <div className="flex gap-[18px] mt-2">
          <button
            onClick={() => navigate(-1)}
            disabled={loading}
            className="w-1/2 py-3.5 sm:py-3 border border-gray-300 dark:border-neutral-700 rounded-[10px] text-[15px] font-semibold cursor-pointer transition duration-300 hover:bg-gray-100 dark:hover:bg-neutral-800"
          >
            Cancel
          </button>

          <button
            onClick={handleLogout}
            disabled={loading}
            className="w-1/2 py-3.5 bg-[#006A40] text-white border-none rounded-[10px] text-base font-semibold cursor-pointer transition duration-300 hover:bg-[#005132] hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Logging out..." : "Logout"}
          </button>
        </div>

        {/* Footer */}
        <p className="text-sm text-gray-400 dark:text-neutral-500 mt-4">
          Thank you for using{" "}
          <span className="font-semibold text-[#006A40]">LocalVibe</span>.
        </p>
      </div>
    </div>
  );
};

export default Logout;
