/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Archivo', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Ink on sonagram-grey paper. The interface stays colourless, so every colour on
        // the page comes from the research itself: the spectrogram, figures and photos.
        paper: {
          DEFAULT: '#e4e6e1',
          deep: '#d8dbd5',
        },
        plate: '#ffffff',
        ink: {
          DEFAULT: '#161816',
          soft: '#2f332f',
        },
        graphite: '#4b504a',
        trace: '#a5aaa3',
      },
      maxWidth: {
        site: '87.5rem',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
