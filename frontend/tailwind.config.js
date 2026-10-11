/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#0b0e11',
          800: '#12161c',
          700: '#1a1f27',
          600: '#242b36',
        },
        accent: {
          DEFAULT: '#00e676',
          dim: '#00c853',
          glow: '#69f0ae',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'flip': 'flip 2.8s ease-in-out forwards',
        'pulse-glow': 'pulse-glow 2s infinite',
      },
      keyframes: {
        flip: {
          '0%': { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(1800deg)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 8px #00e67655' },
          '50%': { boxShadow: '0 0 20px #00e676aa' },
        }
      }
    },
  },
  plugins: [],
}
