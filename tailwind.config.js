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
        primary: {
          DEFAULT: '#6366f1',
          dark: '#4f46e5',
          light: '#818cf8',
          hover: '#4f46e5',
        },
        secondary: {
          DEFAULT: '#7c3aed',
          dark: '#6d28d9',
          light: '#a78bfa',
        },
        success: '#10b981',
        warning: '#f59e0b',
        error: '#f43f5e',
        darkBg: '#0f0f13',
        lightBg: '#f8f9ff',
        darkSurface: '#1a1a2e',
        lightSurface: '#ffffff',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      perspective: {
        '1000': '1000px',
      }
    },
  },
  plugins: [],
}
