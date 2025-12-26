export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}", // 🔥 REQUIRED
  ],
  theme: {
    extend: {
      colors: {
        primary: "#ff4757",
        secondary: "#2f3542",
      },
      fontFamily: {
        display: ["Aclonica", "sans-serif"],
        sans: ["Poppins", "sans-serif"],
      },
    },
  },
  plugins: [],
};
