/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        forest: {
          50: '#f0f9f4',
          100: '#dbf0e4',
          200: '#b9e2ce',
          300: '#89ceb0',
          400: '#53b38d',
          500: '#2e966e',
          600: '#1e7956',
          700: '#144e35',
          800: '#0f3d2a',
          900: '#0a2a1d',
          950: '#051810',
        },
        donezo: {
          canvas: '#F4F5F7',
          card: '#FFFFFF',
          border: '#E5E7EB',
          dark: '#144E35',
          text: '#111827',
          muted: '#6B7280',
          hover: '#F9FAFB',
        },
        dark: {
          bg: '#080c14',
          surface: '#0d1322',
          card: '#111827',
          border: '#1e293b',
        },
        brand: {
          50: '#f0f9f4',
          100: '#dbf0e4',
          200: '#b9e2ce',
          300: '#89ceb0',
          400: '#53b38d',
          500: '#2e966e',
          600: '#1e7956',
          700: '#144e35',
          800: '#0f3d2a',
          900: '#0a2a1d',
          950: '#051810',
        },
        accent: {
          cyan: '#06b6d4',
          emerald: '#10b981',
          amber: '#f59e0b',
          rose: '#f43f5e',
          violet: '#8b5cf6',
          indigo: '#6366f1',
        },
        stitch: {
          primary: '#00361c',
          'primary-container': '#134e2f',
          'on-primary': '#ffffff',
          'on-primary-container': '#84be97',
          secondary: '#006d3d',
          'secondary-container': '#97f3b5',
          'on-secondary-container': '#047240',
          tertiary: '#03361d',
          'tertiary-container': '#1f4d32',
          surface: '#f7faf7',
          'surface-low': '#f1f4f1',
          'surface-card': '#ffffff',
          'surface-high': '#e6e9e6',
          outline: '#717971',
          'outline-variant': '#c0c9bf',
          text: '#181c1b',
          'text-muted': '#404942',
        }
      },
      boxShadow: {
        'donezo-card': '0 2px 10px rgba(0, 0, 0, 0.03), 0 1px 2px rgba(0, 0, 0, 0.02)',
        'donezo-hover': '0 12px 28px -6px rgba(0, 0, 0, 0.08), 0 4px 10px -2px rgba(0, 0, 0, 0.03)',
        'forest-glow': '0 10px 25px -5px rgba(20, 78, 53, 0.35)',
        'glass-card': '0 10px 30px -10px rgba(0, 0, 0, 0.08)',
        'glass-hover': '0 20px 40px -15px rgba(20, 78, 53, 0.2)',
        'soft-shadow': '0 16px 48px -12px rgba(19, 78, 47, 0.08)',
        'card-shadow': '0 4px 20px -2px rgba(19, 78, 47, 0.04)',
        'hero-card-shadow': '0 20px 40px -8px rgba(19, 78, 47, 0.12)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'slide-up': 'slideUp 0.4s ease-out forwards',
        'pulse-glow': 'pulseGlow 4s ease-in-out infinite',
        'float': 'float 5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.6', filter: 'blur(20px)' },
          '50%': { opacity: '1', filter: 'blur(28px)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        }
      }
    },
  },
  plugins: [],
}
