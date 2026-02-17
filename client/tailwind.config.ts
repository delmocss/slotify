import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ash: "#3B3C36",
        copper: "#D99058",
        ashSoft: "#4A4B45",
        ashLight: "#2F302C",
        surface: "#2A2B27",
      },
    },

  },
  plugins: [],
} satisfies Config
