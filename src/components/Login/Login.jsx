import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { loginUser } from "../../api/authApi";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }
    setLoading(true);
    try {
      const response = await loginUser({ email, password });
      
      // Store token & user data if returned
      if (response.accessToken) {
        localStorage.setItem("accessToken", response.accessToken);
      }
      if (response.user) {
        localStorage.setItem("user", JSON.stringify(response.user));
      }
      
      // Navigate to the requested path or home
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex justify-center items-center p-5">
      <div className="w-full max-w-[420px] bg-white dark:bg-neutral-800 p-10 sm:p-10 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.1)] flex flex-col gap-4">
        <h1 className="text-[#006A40] dark:text-[#4ade80] text-center text-3xl sm:text-[28px] font-bold">
          Welcome Back
        </h1>
        <p className="text-center text-gray-500 dark:text-neutral-400 text-[15px] sm:text-sm mb-2">
          Sign in to keep the vibe going.
        </p>
        
        {error && (
          <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-[18px]">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email Address"
            className="w-full px-4 py-3.5 sm:py-3 border border-gray-300 dark:border-neutral-700 rounded-[10px] text-[15px] outline-none transition duration-300 focus:border-[#006A40] focus:shadow-[0_0_0_4px_rgba(0,106,64,0.15)] dark:bg-neutral-900 dark:text-white"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-4 py-3.5 sm:py-3 border border-gray-300 dark:border-neutral-700 rounded-[10px] text-[15px] outline-none transition duration-300 focus:border-[#006A40] focus:shadow-[0_0_0_4px_rgba(0,106,64,0.15)] dark:bg-neutral-900 dark:text-white"
            required
          />

          <div className="text-right text-sm">
            <Link
              to="/forget-password"
              className="text-[#006A40] dark:text-[#4ade80] no-underline hover:underline">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#006A40] text-white border-none rounded-[10px] text-base font-semibold cursor-pointer transition duration-300 hover:bg-[#005132] hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <h4 className="text-center text-sm text-[#006A40] dark:text-[#4ade80] font-medium">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-[#006A40] dark:text-[#4ade80] cursor-pointer font-semibold hover:underline"
            >
              Register
            </Link>
          </h4>
        </form>
      </div>
    </div>
  );
};

export default Login;
