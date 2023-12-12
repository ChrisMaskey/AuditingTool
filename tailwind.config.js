/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"], //Primary Font
      },
      colors: {
        raitonal: {
          100: "rgba(255, 255, 255, 0.87)", //Lightest
          200: "#2F68C5",
          300: "#2f68c5",
          400: "#234E94",
          500: "#183462",
          600: "#0C1A31",
          700: "#000000", //Darkest
        },
      },
    },
  },
  plugins: [],
};
