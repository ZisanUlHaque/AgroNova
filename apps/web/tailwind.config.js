/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        agrogreen: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        nasablue: {
          500: '#0284c7',
          600: '#0369a1',
          700: '#075985',
        },
        deltaamber: {
          500: '#d97706',
          600: '#b45309',
        }
      },
      fontFamily: {
        bengali: ['Noto Sans Bengali', 'SolaimanLipi', 'Hind Siliguri', 'sans-serif'],
      },
      minHeight: {
        'touch': '48px',
      },
      minWidth: {
        'touch': '48px',
      }
    },
  },
  plugins: [],
};
