/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Requested Design System Tokens
        'primary-purple': '#6C3BDB',
        'dark-purple': '#4C1D95',
        'light-purple': '#F3EEFF',
        'soft-lavender': '#E9DFFF',
        'main-bg': '#FAF9FF',
        'primary-text': '#211A33',
        'secondary-text': '#77718A',
        'border-lavender': '#E8E2F0',
        
        // Brand palette mapping
        brand: {
          50: '#F3EEFF',
          100: '#E9DFFF',
          200: '#D4C2FE',
          300: '#BA9FFE',
          400: '#9C78F7',
          500: '#8054EC',
          600: '#6C3BDB', // Primary Purple
          700: '#5B2EC4', // Darker on hover
          800: '#4C1D95', // Dark Purple
          900: '#371370',
        },
        accent: {
          50: '#FAF9FF',
          100: '#F3EEFF',
          200: '#E9DFFF',
          500: '#8b5cf6',
          600: '#6C3BDB',
          700: '#4C1D95',
        },
        success: '#16A34A',
        warning: '#F59E0B',
        error: '#DC2626',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
