module.exports = {
  mode: "jit",
  purge: ["./app/**/*.{ts,tsx}"],
  darkMode: true,
  theme: {
    extend: {
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme('colors.white'),
            h1: {
              color: theme('colors.green.100'),
            },
            h2: {
              color: theme('colors.green.100'),
            },
            h3: {
              color: theme('colors.green.100'),
            },
            h4: {
              color: theme('colors.green.100'),
            },
            h5: {
              color: theme('colors.green.100'),
            },
            h6: {
              color: theme('colors.green.100'),
            },
            p: {
              color: theme('colors.white'),
            },
            thead: {
              color: theme('colors.green.100'),
            },
            code: {
              color: theme('colors.green.400'),
            },
            a: {
              color: theme('colors.green.400'),
              '&:hover': {
                color: theme('colors.green.600'),
              },
            },
          },
        },
      }),
    },
    textColor: {
      'primary': '#ffffff',
      'secondary': '#ffeedd',
      'highlight': '#00ffff',
      'danger': '#e3342f',
    }
  },
  variants: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
