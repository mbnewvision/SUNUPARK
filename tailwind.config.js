/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'dakar-green': '#00843D',
        'dakar-yellow': '#F2C300',
        'dakar-gray': '#F7F7F7',
        'dakar-dark': '#1A1A1A',
      },
    },
  },
  plugins: [],
}
