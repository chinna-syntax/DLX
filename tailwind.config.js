/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        green: {
          50: '#f0faf4',
          100: '#dcf5e7',
          200: '#baebd0',
          300: '#8adab5',
          400: '#54c292',
          500: '#2fa870',
          600: '#1e8a58',
          700: '#176d47',
          800: '#14563a',
          900: '#104730',
          950: '#082a1c',
        },
        neutral: {
          0: '#ffffff',
          50: '#fafafa',
          100: '#f5f5f5',
          150: '#eeeeee',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0a0a0a',
        },
        amber: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0,0,0,0.08), 0 1px 2px -1px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px 0 rgba(0,0,0,0.10), 0 2px 4px -1px rgba(0,0,0,0.06)',
        'dropdown': '0 8px 24px rgba(0,0,0,0.12)',
      },
      borderRadius: {
        DEFAULT: '6px',
        'md': '8px',
        'lg': '10px',
        'xl': '12px',
        '2xl': '16px',
      },
    },
  },
  plugins: [],
}
