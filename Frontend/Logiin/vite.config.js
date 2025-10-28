import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";

// Enable HTTPS using your local certs
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    https: {
      key: fs.readFileSync("/certs/localhost+1-key.pem"),
      cert: fs.readFileSync("/certs/localhost+1.pem"),
    },
    watch: {
      usePolling: true,
    },
  },
});
