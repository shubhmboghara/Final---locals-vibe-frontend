export default {
  darkMode: "class", // ✅ CRITICAL: Must be "class"
  
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],

  theme: {
    extend: {
      colors: {
        slate: {
          50: "#f8fafc",
          950: "#0f172a",
        },
      },
    },
  },

  plugins: [],
};