import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from '@tailwindcss/vite';
import fs from 'fs';

// Configuración HTTPS + soporte React + Tailwind
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()  // ✅ Tailwind se gestiona directamente por Vite
  ],
  // ❌ ELIMINA toda la sección css.postcss - ya no es necesaria
  server: {
    host: "0.0.0.0",
    port: 5173,
    https: {
      key: fs.readFileSync("/certs/localhost+1-key.pem"),
      cert: fs.readFileSync("/certs/localhost+1.pem"),
    },
    watch: {
      usePolling: true, // útil en Docker
    },
  },
});