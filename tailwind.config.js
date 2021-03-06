const colors = require('tailwindcss/colors');
module.exports = {
  purge: ['./public/**/*.html', './src/**/*.vue'],
  important: true,
  darkMode: false, // or 'media' or 'class'
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      black: colors.black,
      white: colors.white,
      gray: colors.gray,
      indigo: colors.indigo,
      red: colors.rose,
      yellow: colors.amber,
      pink: colors.pink,
      green: colors.green,
    },
    extend: {
      gridTemplateColumns: {
        'feature-four-column': 'repeat(4, minmax(270px, max-content))',
      },
    },
  },
  variants: {
    extend: {
      padding: ['responsive', 'first', 'last'],
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
