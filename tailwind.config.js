/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        arabic: ["'IBM Plex Sans Arabic'", "'IBM Plex Sans'", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
