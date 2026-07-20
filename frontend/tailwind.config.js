/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        darkBg: '#090b16',
        darkCard: '#111326',
        darkBorder: '#232644',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        code: ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
