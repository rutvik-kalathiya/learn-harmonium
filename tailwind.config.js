/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#0b0d12',
          900: '#0f1218',
          800: '#161a23',
          700: '#1f2532',
          600: '#2a3142',
          500: '#3b4458',
        },
        accent: {
          400: '#7dd3fc',
          500: '#38bdf8',
          600: '#0ea5e9',
        },
        warm: {
          400: '#fbbf24',
          500: '#f59e0b',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}
