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
          50: '#f5f7fa',
          100: '#e4e8f0',
          200: '#cdd5e4',
          300: '#a7b6d1',
          400: '#7a91b8',
          500: '#536d9c',
          600: '#435783',
          700: '#38466b',
          800: '#2b3452',
          900: '#1d2338',
          950: '#0f121d',
        },
        accent: {
          emerald: '#10b981',
          teal: '#0d9488',
          indigo: '#6366f1',
          violet: '#8b5cf6',
          rose: '#f43f5e',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'premium': '0 4px 20px -2px rgba(17, 24, 39, 0.05), 0 2px 10px -1px rgba(17, 24, 39, 0.02)',
        'premium-hover': '0 10px 30px -4px rgba(17, 24, 39, 0.08), 0 4px 15px -2px rgba(17, 24, 39, 0.04)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [],
}
