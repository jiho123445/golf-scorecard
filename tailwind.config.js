/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#14532d',
          light: '#166534',
          dark: '#0f3d22',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Apple SD Gothic Neo"', '"Noto Sans KR"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
