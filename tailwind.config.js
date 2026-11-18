/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#16a34a',
          600: '#15803d',
          700: '#166534',
          primary: '#1E3A8A', // Deep Trust Navy for Amar City
          accent: '#10B981',  // Energetic Green
        }
      }
    },
  },
  plugins: [],
}
