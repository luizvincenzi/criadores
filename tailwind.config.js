/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Material Design 3 Color System
        primary: {
          DEFAULT: '#1a73e8',
          container: '#d2e3fc',
        },
        secondary: {
          DEFAULT: '#137333',
          container: '#e6f4ea',
        },
        tertiary: {
          DEFAULT: '#d93025',
          container: '#fce8e6',
        },
        error: {
          DEFAULT: '#d93025',
          container: '#fce8e6',
        },
        surface: {
          DEFAULT: '#ffffff',
          dim: '#f5f5f5',
          bright: '#ffffff',
          container: {
            lowest: '#ffffff',
            low: '#f8f9fa',
            DEFAULT: '#f1f3f4',
            high: '#e8eaed',
            highest: '#dadce0',
          },
          variant: '#f8f9fa',
        },
        outline: {
          DEFAULT: '#dadce0',
          variant: '#e8eaed',
        },
        // Text colors
        'on-primary': '#ffffff',
        'on-primary-container': '#001d35',
        'on-secondary': '#ffffff',
        'on-secondary-container': '#0d652d',
        'on-tertiary': '#ffffff',
        'on-tertiary-container': '#410002',
        'on-surface': '#202124',
        'on-surface-variant': '#5f6368',
        'on-error': '#ffffff',
        'on-error-container': '#410002',
      },
      fontFamily: {
        sans: ['Google Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
