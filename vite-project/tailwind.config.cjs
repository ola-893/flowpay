/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#f2f7ff',
          100: '#e6efff',
          200: '#cce0ff',
          300: '#99c2ff',
          400: '#66a3ff',
          500: '#3385ff',
          600: '#1a6aff',
          700: '#1452cc',
          800: '#0e3a99',
          900: '#092266',
        },
      },
      boxShadow: {
        glow: '0 0 20px rgba(56, 189, 248, 0.35), 0 0 40px rgba(168, 85, 247, 0.25)',
      },
      backgroundImage: {
        grid: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.08) 1px, transparent 0)',
        hero: 'conic-gradient(from 180deg at 50% 50%, #0ea5e9, #a855f7, #06b6d4, #0ea5e9)',
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        pulseGlow: 'pulseGlow 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 rgba(56, 189, 248, 0)' },
          '50%': { boxShadow: '0 0 32px rgba(56, 189, 248, 0.35)' },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
}

