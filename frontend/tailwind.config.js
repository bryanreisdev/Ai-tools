/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'Inter', 'system-ui', 'ui-sans-serif', 'Arial', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'ui-sans-serif', 'Arial', 'sans-serif'],
      },
      colors: {
        neon: {
          blue: '#00F5FF',
          purple: '#7C3AED',
          pink: '#FF2D95',
        },
      },
      dropShadow: {
        neon: '0 0 10px rgba(0,245,255,0.6)',
      },
    },
  },
  plugins: [],
}
