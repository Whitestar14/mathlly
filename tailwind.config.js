import preset from './tailwind.preset.js'

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./public/**/*.html', './src/**/*.{vue,js,ts,css,jsx,tsx}'],
  presets: [preset],
  plugins: []
}
