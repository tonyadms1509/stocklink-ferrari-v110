/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backdropBlur: {
        "2xl": "40px", // ✅ extend backdrop blur scale
      },
    },
  },
  plugins: [],
};
