import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 3000,
  },
  plugins: [
    react(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: [
      '@fullcalendar/core',
      '@fullcalendar/core/index.js',
      '@fullcalendar/core/internal.js',
      '@fullcalendar/core/preact.js',
      '@fullcalendar/react',
      '@fullcalendar/daygrid',
      '@fullcalendar/interaction'
    ]
  }
}));
