/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      fontSize: {
        // Type Scale with proper line heights
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1.1' }],
        '6xl': ['3.75rem', { lineHeight: '1.1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        // Semantic sizes
        'display': ['4rem', { lineHeight: '1', letterSpacing: '-0.02em', fontWeight: '800' }],
        'heading': ['2rem', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '700' }],
        'subheading': ['1.25rem', { lineHeight: '1.4', fontWeight: '600' }],
        'body': ['1rem', { lineHeight: '1.6' }],
        'caption': ['0.75rem', { lineHeight: '1.4' }],
      },
      spacing: {
        // 4px base grid system
        '0.5': '0.125rem',  // 2px
        '1': '0.25rem',     // 4px
        '1.5': '0.375rem',  // 6px
        '2': '0.5rem',      // 8px
        '2.5': '0.625rem',  // 10px
        '3': '0.75rem',     // 12px
        '3.5': '0.875rem',  // 14px
        '4': '1rem',        // 16px
        '5': '1.25rem',     // 20px
        '6': '1.5rem',      // 24px
        '7': '1.75rem',     // 28px
        '8': '2rem',        // 32px
        '9': '2.25rem',     // 36px
        '10': '2.5rem',     // 40px
        '11': '2.75rem',    // 44px
        '12': '3rem',       // 48px
        '14': '3.5rem',     // 56px
        '16': '4rem',       // 64px
        '18': '4.5rem',     // 72px
        '20': '5rem',       // 80px
        '24': '6rem',       // 96px
        '28': '7rem',       // 112px
        '32': '8rem',       // 128px
      },
      colors: {
        // FlowPay Brand Colors
        flowpay: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6', // Primary
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        // Accent - Purple (for AI/Gemini features)
        accent: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7', // Accent
          600: '#9333ea',
          700: '#7c3aed',
          800: '#6b21a8',
          900: '#581c87',
        },
        // Semantic Colors
        success: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981', // Success
          600: '#059669',
          700: '#047857',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b', // Warning
          600: '#d97706',
          700: '#b45309',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444', // Error
          600: '#dc2626',
          700: '#b91c1c',
        },
        // Dark Mode Surface Colors
        surface: {
          50: '#f8fafc',   // Light mode background
          100: '#f1f5f9',
          200: '#e2e8f0',
          700: '#1e293b',  // Cards on dark
          800: '#0f172a',  // Elevated surfaces
          900: '#0b0f1a',  // Base dark background
          950: '#050810',  // Deepest dark
        },
      },
      boxShadow: {
        glow: '0 0 20px rgba(59, 130, 246, 0.35), 0 0 40px rgba(168, 85, 247, 0.25)',
        'glow-success': '0 0 15px rgba(16, 185, 129, 0.4)',
        'glow-error': '0 0 15px rgba(239, 68, 68, 0.4)',
        'glow-accent': '0 0 20px rgba(168, 85, 247, 0.4)',
        'glow-sm': '0 0 10px rgba(59, 130, 246, 0.2)',
        'glow-lg': '0 0 40px rgba(59, 130, 246, 0.4), 0 0 60px rgba(168, 85, 247, 0.3)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.2)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -4px rgba(0, 0, 0, 0.3)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glass-sm': '0 4px 16px 0 rgba(0, 0, 0, 0.25)',
        'inner-glow': 'inset 0 0 20px rgba(59, 130, 246, 0.1)',
        'border-glow': '0 0 0 1px rgba(59, 130, 246, 0.3), 0 0 15px rgba(59, 130, 246, 0.15)',
      },
      backgroundImage: {
        grid: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.06) 1px, transparent 0)',
        // FlowPay Brand Gradients
        'flowpay-gradient': 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #a855f7 100%)',
        'flowpay-subtle': 'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(168,85,247,0.1) 100%)',
        'hero': 'conic-gradient(from 180deg at 50% 50%, #3b82f6, #8b5cf6, #a855f7, #3b82f6)',
        'mesh': 'radial-gradient(at 40% 20%, rgba(59,130,246,0.15) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(168,85,247,0.12) 0px, transparent 50%), radial-gradient(at 0% 50%, rgba(59,130,246,0.08) 0px, transparent 50%)',
        // Status Gradients
        'success-gradient': 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        'warning-gradient': 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        'error-gradient': 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        // Stream Animation Gradient
        'stream-flow': 'linear-gradient(90deg, transparent, rgba(59,130,246,0.5), transparent)',
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        pulseGlow: 'pulseGlow 3s ease-in-out infinite',
        shimmer: 'shimmer 2s linear infinite',
        'stream-flow': 'stream-flow 1.5s ease-in-out infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'border-flow': 'borderFlow 3s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 rgba(59, 130, 246, 0)' },
          '50%': { boxShadow: '0 0 32px rgba(59, 130, 246, 0.35)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(200%)' },
        },
        'stream-flow': {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '50%': { opacity: '1' },
          '100%': { transform: 'translateX(100%)', opacity: '0' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.2)' },
          '50%': { boxShadow: '0 0 40px rgba(59, 130, 246, 0.4), 0 0 60px rgba(168, 85, 247, 0.2)' },
        },
        borderFlow: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
}
