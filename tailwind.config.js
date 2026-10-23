/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        charred: '#14100D',
        plank: '#2A211B',
        plankLight: '#392C24',
        plankDark: '#1E1712',
        iron: '#5A4A3C',
        ironDark: '#3A2E24',
        ironHighlight: '#7A6856',
        parchment: '#F1E3C6',
        parchmentDark: '#D8C39F',
        torch: '#FF7A1A',
        ember: '#FFB347',
        hpGreen: '#4CAF50',
        hpYellow: '#F2C230',
        hpRed: '#D93025',
      },
      fontFamily: {
        heading: ['"Cinzel"', 'serif'],
        sans: ['"Alegreya Sans"', 'sans-serif'],
      },
      boxShadow: {
        'solid-panel': '4px 4px 0px #100C09',
        'solid-ticket': '2.5px 2.5px 0px #100C09',
        'solid-ticket-active': '1px 1px 0px #100C09',
        'solid-badge': '3px 3px 0px #100C09',
        'solid-board': '4px 4px 0px #100C09',
      }
    },
  },
  plugins: [],
}
