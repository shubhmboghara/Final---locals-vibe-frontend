import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import initialLocationData from "../../data/locationData.json";
import { registerUser, verifyOtp, resendOtp } from "../../api/authApi";

const Register = () => {
  const navigate = useNavigate();
  
  // Step 1: Registration Form
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    state: "",
    city: "",
    neighborhood: ""
  });
  
  const [locationData] = useState(initialLocationData);
  
  // Dropdown options
  const states = locationData ? Object.keys(locationData) : [];
  const cities = (locationData && formData.state && locationData[formData.state]) ? Object.keys(locationData[formData.state]) : [];
  const neighborhoods = (locationData && formData.state && formData.city && locationData[formData.state][formData.city]) ? locationData[formData.state][formData.city] : [];
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Step 2: OTP
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [resendCooldown, setResendCooldown] = useState(60);

  useEffect(() => {
    let timer;
    if (step === 2 && resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, resendCooldown]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      if (name === "state") {
        newData.city = "";
        newData.neighborhood = "";
      } else if (name === "city") {
        newData.neighborhood = "";
      }
      return newData;
    });
    setError("");
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    // Basic validation
    if (!formData.name.trim()) return setError("Name is required");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return setError("Valid email is required");
    if (formData.password.length < 8) return setError("Password must be at least 8 characters");
    if (formData.password !== formData.confirmPassword) return setError("Passwords do not match");
    if (!formData.state || !formData.city || !formData.neighborhood) return setError("Please select a full location");

    setLoading(true);
    try {
      await registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        state: formData.state,
        city: formData.city,
        neighborhood: formData.neighborhood
      });
      setStep(2);
      setResendCooldown(60);
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) value = value.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`otp-input-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-input-${index - 1}`)?.focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpValue = otp.join("");
    if (otpValue.length < 6) return setError("Please enter full 6-digit OTP");
    
    setError("");
    setLoading(true);
    try {
      const response = await verifyOtp({
        email: formData.email,
        otp: otpValue
      });
      if (response && response.user) {
        localStorage.setItem("user", JSON.stringify(response.user));
      } else {
        localStorage.setItem("user", JSON.stringify({
          name: formData.name,
          email: formData.email,
          state: formData.state,
          city: formData.city,
          neighborhood: formData.neighborhood
        }));
      }
      navigate("/login");
    } catch (err) {
      setError(err.message || "OTP Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setError("");
    setLoading(true);
    try {
      await resendOtp({ email: formData.email });
      setResendCooldown(60);
    } catch (err) {
      setError(err.message || "Failed to resend OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex justify-center items-center p-5 font-[Poppins,sans-serif]">
      <div className="w-full max-w-[500px] bg-white dark:bg-neutral-800 p-8 sm:p-10 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.1)] flex flex-col gap-4">
        
        <h1 className="text-[#006A40] dark:text-[#4ade80] text-center text-3xl sm:text-[28px] font-bold">
          {step === 1 ? "Create Account" : "Verify Email"}
        </h1>

        <p className="text-center text-gray-500 dark:text-neutral-400 text-[15px] sm:text-sm mb-2">
          {step === 1 ? "Join us and start your journey today." : `We've sent a code to ${formData.email}`}
        </p>

        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm mb-2 text-center">
            {error}
          </div>
        )}

        {step === 1 && (
          <form className="flex flex-col gap-[18px]" onSubmit={handleRegisterSubmit}>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Full Name"
              className="w-full px-4 py-3.5 sm:py-3 border border-gray-300 rounded-[10px] text-[15px] outline-none transition duration-300 focus:border-[#006A40] focus:shadow-[0_0_0_4px_rgba(0,106,64,0.15)] dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
              required
            />

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email Address"
              className="w-full px-4 py-3.5 sm:py-3 border border-gray-300 rounded-[10px] text-[15px] outline-none transition duration-300 focus:border-[#006A40] focus:shadow-[0_0_0_4px_rgba(0,106,64,0.15)] dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
              required
            />

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                className="w-full px-4 py-3.5 sm:py-3 border border-gray-300 rounded-[10px] text-[15px] outline-none transition duration-300 focus:border-[#006A40] focus:shadow-[0_0_0_4px_rgba(0,106,64,0.15)] dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
                required
                minLength={8}
              />
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm Password"
                className="w-full px-4 py-3.5 sm:py-3 border border-gray-300 rounded-[10px] text-[15px] outline-none transition duration-300 focus:border-[#006A40] focus:shadow-[0_0_0_4px_rgba(0,106,64,0.15)] dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
                required
              />
            </div>

            <select
              name="state"
              value={formData.state}
              onChange={handleChange}
              className={`w-full px-4 py-3.5 sm:py-3 border border-gray-300 rounded-[10px] text-[15px] outline-none transition duration-300 focus:border-[#006A40] focus:shadow-[0_0_0_4px_rgba(0,106,64,0.15)] dark:bg-neutral-900 dark:border-neutral-700 ${formData.state ? 'text-black dark:text-white' : 'text-gray-400 dark:text-neutral-400'}`}
              required
            >
              <option value="" disabled>Select State</option>
              {states.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>

            <select
              name="city"
              value={formData.city}
              onChange={handleChange}
              disabled={!formData.state}
              className={`w-full px-4 py-3.5 sm:py-3 border border-gray-300 rounded-[10px] text-[15px] outline-none transition duration-300 focus:border-[#006A40] focus:shadow-[0_0_0_4px_rgba(0,106,64,0.15)] dark:bg-neutral-900 dark:border-neutral-700 ${formData.city ? 'text-black dark:text-white' : 'text-gray-400 dark:text-neutral-400'} disabled:bg-gray-100 dark:disabled:bg-neutral-800`}
              required
            >
              <option value="" disabled>Select City</option>
              {cities.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>

            <select
              name="neighborhood"
              value={formData.neighborhood}
              onChange={handleChange}
              disabled={!formData.city}
              className={`w-full px-4 py-3.5 sm:py-3 border border-gray-300 rounded-[10px] text-[15px] outline-none transition duration-300 focus:border-[#006A40] focus:shadow-[0_0_0_4px_rgba(0,106,64,0.15)] dark:bg-neutral-900 dark:border-neutral-700 ${formData.neighborhood ? 'text-black dark:text-white' : 'text-gray-400 dark:text-neutral-400'} disabled:bg-gray-100 dark:disabled:bg-neutral-800`}
              required
            >
              <option value="" disabled>Select Neighborhood</option>
              {neighborhoods.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>

            <button
              type="submit"
              disabled={loading || !locationData}
              className="w-full mt-2 py-3.5 bg-[#006A40] text-white border-none rounded-[10px] text-base font-semibold cursor-pointer transition duration-300 hover:bg-[#005132] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Processing..." : "Register"}
            </button>

            <h4 className="text-center text-sm text-[#006A40] dark:text-[#4ade80] mt-2 font-medium">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-[#006A40] dark:text-[#4ade80] cursor-pointer font-semibold hover:underline"
              >
                Login
              </Link>
            </h4>
          </form>
        )}

        {step === 2 && (
          <form className="flex flex-col gap-6" onSubmit={handleVerifyOtp}>
            <div className="flex justify-between gap-2">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  id={`otp-input-${i}`}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  className="w-12 h-14 sm:w-14 sm:h-16 text-center text-xl font-semibold border border-gray-300 rounded-[10px] outline-none transition duration-300 focus:border-[#006A40] focus:shadow-[0_0_0_4px_rgba(0,106,64,0.15)] dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#006A40] text-white border-none rounded-[10px] text-base font-semibold cursor-pointer transition duration-300 hover:bg-[#005132] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Verifying..." : "Verify & Complete Registration"}
            </button>

            <div className="text-center text-sm text-gray-500 dark:text-neutral-400">
              Didn't receive the code?{" "}
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendCooldown > 0 || loading}
                className="text-[#006A40] dark:text-[#4ade80] font-semibold hover:underline disabled:opacity-50 disabled:no-underline disabled:cursor-not-allowed ml-1"
              >
                Resend OTP {resendCooldown > 0 && `(${resendCooldown}s)`}
              </button>
            </div>
            
            <button 
              type="button" 
              onClick={() => setStep(1)} 
              className="text-center text-sm text-[#006A40] dark:text-[#4ade80] hover:underline"
            >
              Back to Registration
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Register;