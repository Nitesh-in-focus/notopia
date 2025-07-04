/** @type {import('tailwindcss').Config} */
import typography from "@tailwindcss/typography";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Poppins'", "sans-serif"],
      },
      colors: {
        glass: "rgba(255, 255, 255, 0.05)",
        morph: "rgba(255,255,255,0.2)",
      },
    },
  },
  plugins: [typography],
};
