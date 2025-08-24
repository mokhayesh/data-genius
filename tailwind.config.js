/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#2563eb', // primary 600
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          foreground: '#ffffff',
        },
        accent: {
          DEFAULT: '#10b981', // emerald
          foreground: '#06281f',
        },
        surface: {
          soft: '#f8fafc',   // slate-50
          card: '#ffffff',
          ring: '#e2e8f0',
        },
      },
      boxShadow: {
        soft: '0 8px 30px rgba(2,8,23,0.08)',
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
