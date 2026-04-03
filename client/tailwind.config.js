/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        saffron: {
          DEFAULT: '#FF6B00',
          light: '#FF8C3A',
        },
        dark: {
          DEFAULT: '#0F0D0A',
          surface: '#1A1713',
          card: '#221F1A',
        }
      }
    },
  },
  plugins: [],
}
