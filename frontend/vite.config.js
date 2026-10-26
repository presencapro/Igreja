import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api-cancaonova": {
        target: "https://santo.cancaonova.com",
        changeOrigin: true,
        secure: false,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Referer: "https://santo.cancaonova.com/",
        },
        rewrite: (path) => path.replace(/^\/api-cancaonova/, ""),
      },
      "/api-ftdv": {
        target: "https://www.ftdv.app",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-ftdv/, ""),
      },
      "/api-santo": {
        target: "https://api-liturgia-diaria.vercel.app",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-santo/, ""),
      },
    },
  },
});
