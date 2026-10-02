/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0A0B0D",
          900: "#101214",
          850: "#14171A",
          800: "#1A1E22",
          700: "#242A30",
          600: "#333C44",
        },
        bone: {
          100: "#F4F1E8",
          200: "#E9E4D4",
          300: "#D5CDB4",
          400: "#B3A888",
        },
        brass: {
          300: "#EBCB8B",
          400: "#DFAF5E",
          500: "#D19A3F",
          600: "#A9762C",
        },
        moss: {
          400: "#7FB685",
          500: "#4E9A5F",
        },
        clay: {
          400: "#D97B5F",
          500: "#C05B3F",
        },
      },
      fontFamily: {
        display: ['"Instrument Serif"', "Georgia", "serif"],
        sans: ['"Inter"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      letterSpacing: {
        widest2: "0.22em",
      },
    },
  },
  plugins: [],
};
