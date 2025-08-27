/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff8ff',
          100: '#daeeff',
          200: '#bde1ff',
          300: '#90cfff',
          400: '#5bb4fd',
          500: '#3693fa',
          600: '#2276ef',
          700: '#1a60db',
          800: '#1c4fb1',
          900: '#0B2447',
          950: '#152e4d',
        },
        coral: {
          50: '#fff4f1',
          100: '#ffe6dd',
          200: '#ffd1bb',
          300: '#ffb38a',
          400: '#ff8d58',
          500: '#FF6B35',
          600: '#f04814',
          700: '#c6320a',
          800: '#9d2a0e',
          900: '#7e2610',
        },
        seafoam: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#4ECDC4',
        },
        surface: '#F7F9FC',
        danger: '#FF4757',
        warning: '#FFB84D',
        success: '#4ECDC4',
      },
      fontFamily: {
        'display': ['Poppins', 'system-ui', 'sans-serif'],
        'body': ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0, 0, 0, 0.1)',
        'elevated': '0 4px 16px rgba(0, 0, 0, 0.15)',
      },
      animation: {
        'wave': 'wave 2s ease-in-out infinite',
        'bounce-gentle': 'bounce-gentle 1s ease-in-out',
        'confetti': 'confetti 0.8s ease-out',
      },
      keyframes: {
        wave: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        'bounce-gentle': {
          '0%, 20%, 53%, 80%, 100%': { transform: 'translateY(0)' },
          '40%, 43%': { transform: 'translateY(-8px)' },
          '70%': { transform: 'translateY(-4px)' },
          '90%': { transform: 'translateY(-2px)' }
        },
        confetti: {
          '0%': { transform: 'scale(0) rotate(0deg)', opacity: '1' },
          '50%': { transform: 'scale(1.2) rotate(180deg)', opacity: '0.8' },
          '100%': { transform: 'scale(0) rotate(360deg)', opacity: '0' }
        }
      }
    },
  },
  plugins: [],
}