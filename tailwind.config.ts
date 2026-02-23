/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",  // Tailwind scans TS/TSX files
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
