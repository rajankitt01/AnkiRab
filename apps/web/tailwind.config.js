/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../../packages/shared/src/**/*.{js,ts,jsx,tsx}"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ankirab: {
          darkest: '#080A0F',
          dark: '#0D1117',
          surface: '#161B26',
          card: '#1F2432',
          cardHover: '#2A3144',
          border: '#2E384D',
          borderLight: '#3F4D69',
          purple: {
            DEFAULT: '#8B5CF6',
            hover: '#7C3AED',
            light: '#A78BFA',
            dark: '#6D28D9'
          },
          cyan: {
            DEFAULT: '#06B6D4',
            hover: '#0891B2',
            light: '#22D3EE'
          },
          accent: '#38BDF8',
          text: '#F3F4F6',
          muted: '#94A3B8'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif']
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      }
    },
  },
  plugins: [],
}
