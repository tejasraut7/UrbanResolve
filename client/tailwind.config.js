/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        authority: {
          DEFAULT: "#4f46e5",
          muted: "#6366f1",
          fg: "#eef2ff",
        },
      },
    },
  },
  plugins: [],
};
