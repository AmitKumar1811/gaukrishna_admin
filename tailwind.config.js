import typography from '@tailwindcss/typography';

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
          50: '#f3f8f2',
          100: '#e4efe2',
          200: '#c9dfc6',
          300: '#a2c89d',
          400: '#74ac6d',
          500: '#4e8f47',
          600: '#3a6b35',   // Primary — Logo forest green
          700: '#2d5a27',   // Darker forest green
          800: '#264a23',
          900: '#1f3d1d',
          950: '#0f2210',
        },
        gold: {
          50: '#fdf9ec',
          100: '#faf0cb',
          200: '#f5de94',
          300: '#f0c95c',
          400: '#ebb836',
          500: '#c5a030',   // Primary Gold — Logo golden
          600: '#b79b44',   // Logo accent gold
          700: '#966f23',
          800: '#7c5a22',
          900: '#684a20',
          950: '#3c270e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'card': '0 10px 30px -5px rgba(0, 0, 0, 0.05), 0 4px 10px -5px rgba(0, 0, 0, 0.02)',
        'glass': '0 4px 30px rgba(0, 0, 0, 0.1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [
    typography,
  ],
};
