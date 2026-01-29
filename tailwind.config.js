
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb', // Blue-600
        secondary: '#10b981', // Emerald-500
        accent: '#f59e0b', // Amber-500
        'text-main': '#1f2937', // Gray-800
        'text-dim': '#6b7280', // Gray-500
        'base-100': '#f3f4f6', // Gray-100
        'base-200': '#ffffff', // White
        'base-300': '#e2e8f0', // Gray-200
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in-scale': 'fade-in-scale 0.2s ease-out forwards',
        'fade-in-right': 'fade-in-right 0.3s ease-out forwards',
        'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
      },
      keyframes: {
        'fade-in-scale': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'fade-in-right': {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
