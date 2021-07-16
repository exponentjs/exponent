module.exports = {
  theme: {
    extend: {
      flex: {},
      flexGrow: {},
      flexShrink: {},
      colors: {},
      margin: {},
      padding: {},
      inset: {},
      width: {},
      height: {},
      borderRadius: {},
      borderWidth: {},
      opacity: {},
      zIndex: {},
      boxShadow: {},
      fontFamily: {},
      fontSize: {
        // eg:  xs: [12, { lineHeight: 1 }],
      },
      aspectRatio: {},
      lineHeight: {},
      letterSpacing: {},
      translate: {},
      rotate: {
        // 0: "0deg",
      },
      scale: {
        // 0: 0,
      },
      skew: {
        // 0: "0deg",
      },
      // platformColors: ({ color }) => ({
      //   blue: {
      //     ios: "systemBlue",
      //     android: "?attr/systemBlue",
      //     default: color("blue-500"),
      //   },
      // }),
      textShadow: {
        // DEFAULT: [1, 3, 1, "rgb(0,0,0)"],
      },
    },
  },

  purge: {
    whitelist: [],
    files: `**/*.{ts,tsx,js,jsx}`,
  },
};
