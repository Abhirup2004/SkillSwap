/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // Enable dark mode via class strategy
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'], // Use Poppins as default
      },
      colors: {
        background: '#0F172A',     // Dark mode background
        surface: '#1E293B',        // Surface / card color
        primary: '#0EA5E9',        // Sky blue (main highlight)
        secondary: '#6366F1',      // Indigo
        accent: '#F43F5E',         // Pink/Red for alerts or buttons
      },
      transitionProperty: {
        theme: 'background-color, border-color, color, fill, stroke',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-500% 0' },
          '100%': { backgroundPosition: '500% 0' },
        },
      },
      animation: {
        shimmer: 'shimmer 2s linear infinite',
      },
    },
  },
  plugins: [],
};
