/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        moss: {
          50: '#f4f6f3',
          100: '#e6ebe2',
          200: '#ccd8c5',
          300: '#a6be9c',
          400: '#7fa174',
          500: '#618455',
          600: '#4c6942',
          700: '#3c5335',
          800: '#32432d',
          900: '#2a3826',
          950: '#141c12',
        },
        stonecard: '#e2e6dc',
        darkmoss: '#161b17',
        darksurface: '#1b221d',
        cyber: {
          bg: '#141815',
          card: '#1b221d',
          surface: '#222b24',
          border: 'rgba(255, 255, 255, 0.08)',
          cyan: '#4ade80',
          green: '#22c55e',
          amber: '#f59e0b',
          red: '#f43f5e',
          orange: '#ea580c',
          purple: '#a855f7',
          muted: '#9ba399',
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'Fira Code', 'monospace'],
        display: ['"Outfit"', '"Plus Jakarta Sans"', 'sans-serif'],
        sans: ['"Outfit"', '"Plus Jakarta Sans"', '"DM Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'neon-cyan': '0 0 15px rgba(0, 242, 254, 0.4), 0 0 30px rgba(0, 242, 254, 0.2)',
        'neon-green': '0 0 15px rgba(0, 245, 155, 0.4), 0 0 30px rgba(0, 245, 155, 0.2)',
        'neon-red': '0 0 15px rgba(255, 0, 85, 0.5), 0 0 35px rgba(255, 0, 85, 0.3)',
        'neon-amber': '0 0 15px rgba(255, 183, 3, 0.4), 0 0 30px rgba(255, 183, 3, 0.2)',
      },
      animation: {
        'pulse-glow': 'pulseGlow 2.5s infinite ease-in-out',
        'radar-sweep': 'radarSweep 4s linear infinite',
        'line-flow': 'lineFlow 2s linear infinite',
        'beacon': 'beacon 1.5s cubic-bezier(0, 0.2, 0.8, 1) infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.6', filter: 'drop-shadow(0 0 8px rgba(0, 242, 254, 0.4))' },
          '50%': { opacity: '1', filter: 'drop-shadow(0 0 18px rgba(0, 242, 254, 0.8))' },
        },
        radarSweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        lineFlow: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '200% 50%' },
        },
        beacon: {
          '0%': { transform: 'scale(0.95)', opacity: '1' },
          '100%': { transform: 'scale(2.2)', opacity: '0' },
        }
      }
    },
  },
  plugins: [],
}
