/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink:     '#0E0D0C',
        ink2:    '#2C2A28',
        mid:     '#6B6560',
        muted:   '#A89E97',
        rule:    '#DDD8D2',
        rule2:   '#EDE9E4',
        bg:      '#FDFCFA',
        bg2:     '#F5F1EC',
        bg3:     '#EDE9E4',
        accent:  '#D44B0A',
        accent2: '#FF6B2B',
        ap:      '#FDF0E8',
        ap2:     '#FAE0CC',
        green:   '#1A6E42',
        gbg:     '#E8F5EE',
        red:     '#B93424',
        rbg:     '#FDECEA',
        gold:    '#92600A',
        goldbg:  '#FEF3C7',
        blue:    '#1A4ED8',
        bluebg:  '#EFF6FF',
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        sans:    ['Instrument Sans', 'sans-serif'],
      },
      borderRadius: {
        sm:  '8px',
        md:  '14px',
        lg:  '20px',
      },
    },
  },
  plugins: [],
}
