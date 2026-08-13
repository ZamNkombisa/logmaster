/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        graphite: {
          DEFAULT: "#1F2329",
          card: "#262A31",
          input: "#1B1E24",
          border: "#363B44",
        },
        lime: "#B6FF2E",
        raspberry: "#C2185B",
        violation: { bg: "#3A1F26", text: "#E24B4A" },
        warning: { bg: "#3A2E10", text: "#D68910" },
        compliant: { bg: "#1E3323", text: "#8FD14F" },
        info: "#5B7A8C",
      },
    },
  },
  plugins: [],
};