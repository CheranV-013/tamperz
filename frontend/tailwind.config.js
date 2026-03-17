/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Space Grotesk", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 8px 20px rgba(15, 23, 42, 0.08)",
      },
    },
  },
  plugins: [],
};
