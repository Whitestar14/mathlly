/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./public/**/*.html", "./src/**/*.{vue,js,ts,css,jsx,tsx}"],
  presets: [require("./scripts/tailwind.preset.cjs")],
  plugins: [],
};
