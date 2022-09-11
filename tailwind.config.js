/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      zinc: {
        850: "#1B222A",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
