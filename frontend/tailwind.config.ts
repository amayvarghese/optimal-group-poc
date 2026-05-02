import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          black: '#0b0b0b',
          yellow: '#f9be01',
        },
      },
      boxShadow: {
        soft: '0 20px 40px rgba(0, 0, 0, 0.35)',
      },
    },
  },
  plugins: [],
} satisfies Config
