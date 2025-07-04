import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",

      // 🔗 Include essential assets from public/
      includeAssets: [
        "favicon.ico",
        "apple-touch-icon.png",
        "favicon-16x16.png",
        "favicon-32x32.png",
        "robots.txt",
      ],

      // 📱 Manifest for Add to Home Screen and PWA support
      manifest: {
        name: "Notopia",
        short_name: "Notopia",
        description: "Your personal note sanctuary",
        start_url: "/",
        scope: "/",
        display: "standalone",
        background_color: "#141414",
        theme_color: "#141414",
        orientation: "portrait",
        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      // 🔧 Optional: Dev-mode PWA enhancements
      devOptions: {
        enabled: true,
      },
    }),
  ],
});
