/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['"Bebas Neue"', 'cursive'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        brand: {
          50: '#e2e2ff',
          100: '#eaddff',
          200: '#ffc0c0',
          300: '#c294ff',
          400: '#9000ff',
          500: '#5701ed',
          600: '#5700ed',
          700: '#5012fc',
          800: '#a50000',
          900: '#3b0088',
          950: '#23004b',
        },
        darkmode: {
          100: '#16161f'
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease forwards',
        'slide-up': 'slideUp 0.4s ease forwards',
        'star-fill': 'starFill 0.2s ease forwards',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        starFill: { from: { transform: 'scale(1)' }, to: { transform: 'scale(1.3)' } },
      },
    },
  },
  plugins: [],
}
