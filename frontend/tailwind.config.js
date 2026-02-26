/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brandRed: '#ed1c24',
        brandBlack: '#1a1a1a',
      },
      fontFamily: {
        sans: ['Shurjo', 'sans-serif'], // ডিফল্ট সব টেক্সট Shurjo হবে
      },
    },
  },
  plugins: [],
}