/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f4ff',
          100: '#e5edff',
          200: '#d1dfff',
          300: '#aec5ff',
          400: '#819bff',
          500: '#5b77ff',
          600: '#3b54ff',
          700: '#2d3feb',
          800: '#2535be',
          900: '#263494',
        },
      },
    },
  },
  plugins: [],
}

