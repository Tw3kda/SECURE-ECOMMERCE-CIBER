// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    // Asegúrate de incluir todas las rutas
  ],
 theme: {
     extend: {
    animation: {
      fadeIn: "fadeIn 0.3s ease-out",
    },
    keyframes: { 
      fadeIn: {
        "0%": { opacity: "0" },
        "100%": { opacity: "1" },
      },
    },
  },
},  plugins: [],
}