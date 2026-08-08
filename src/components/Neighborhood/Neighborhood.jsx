import React, { useState } from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa6";
import { Link } from "react-router-dom";
import locationData from "../../data/locationData.json";

const Neighborhood = () => {
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedNeighborhood, setSelectedNeighborhood] = useState("");

  const states = Object.keys(locationData);
  const cities = selectedState && locationData[selectedState] ? Object.keys(locationData[selectedState]) : [];
  const neighborhoods = selectedState && selectedCity && locationData[selectedState][selectedCity] ? locationData[selectedState][selectedCity] : [];

  const handleStateChange = (e) => {
    setSelectedState(e.target.value);
    setSelectedCity("");
    setSelectedNeighborhood("");
  };

  const handleCityChange = (e) => {
    setSelectedCity(e.target.value);
    setSelectedNeighborhood("");
  };

  return (
    <div className="w-full min-h-screen flex justify-center items-center p-5">
      <div className="w-full max-w-[600px] bg-white dark:bg-neutral-800 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.1)] p-10 max-[500px]:p-6">
        {/* Heading */}
        <h1 className="text-3xl max-[500px]:text-2xl font-bold text-center text-[#006a40] dark:text-[#4ade80] mb-2">
          Neighborhood
        </h1>

        <p className="text-center text-gray-500 dark:text-neutral-400 mb-8">
          Select your location to continue.
        </p>

        {/* Form */}
        <div className="flex flex-col gap-6">
          {/* State */}
          <div>
            <label className="block text-[#006a40] dark:text-[#4ade80] font-semibold mb-2">
              Select your State
            </label>

            <select
              value={selectedState}
              onChange={handleStateChange}
              className="w-full px-4 py-3 border border-gray-300 dark:border-neutral-700 rounded-lg outline-none bg-white dark:bg-neutral-900 dark:text-white transition-all duration-300 focus:border-[#006a40] focus:shadow-[0_0_0_4px_rgba(0,106,64,0.15)]"
            >
              <option value="">Select State</option>
              {states.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* City */}
          <div>
            <label className="block text-[#006a40] dark:text-[#4ade80] font-semibold mb-2">
              Select your City
            </label>

            <select
              value={selectedCity}
              onChange={handleCityChange}
              disabled={!selectedState}
              className="w-full px-4 py-3 border border-gray-300 dark:border-neutral-700 rounded-lg outline-none bg-white dark:bg-neutral-900 dark:text-white transition-all duration-300 focus:border-[#006a40] focus:shadow-[0_0_0_4px_rgba(0,106,64,0.15)] disabled:opacity-50"
            >
              <option value="">Select City</option>
              {cities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Neighborhood */}
          <div>
            <label className="block text-[#006a40] dark:text-[#4ade80] font-semibold mb-2">
              Select your Neighborhood
            </label>

            <select
              value={selectedNeighborhood}
              onChange={(e) => setSelectedNeighborhood(e.target.value)}
              disabled={!selectedCity}
              className="w-full px-4 py-3 border border-gray-300 dark:border-neutral-700 rounded-lg outline-none bg-white dark:bg-neutral-900 dark:text-white transition-all duration-300 focus:border-[#006a40] focus:shadow-[0_0_0_4px_rgba(0,106,64,0.15)] disabled:opacity-50"
            >
              <option value="">Select Neighborhood</option>
              {neighborhoods.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-between items-center mt-10">
          <Link
            to="/login"
            className="flex items-center gap-2 text-[#006a40] dark:text-[#4ade80] font-semibold hover:text-[#005132] transition"
          >
            <FaArrowLeft />
            Back
          </Link>

          <Link
            to="/home"
            className="flex items-center gap-2 bg-[#006a40] text-white px-6 py-3 rounded-lg font-semibold transition duration-300 hover:bg-[#005132] hover:-translate-y-0.5 active:scale-95"
          >
            Continue
            <FaArrowRight />
          </Link>

        </div>
      </div>
    </div>
  );
};

export default Neighborhood;