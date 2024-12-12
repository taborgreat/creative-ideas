
import react from "@vitejs/plugin-react";

import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,  // React app running on port 5173
    proxy: {
      '/api': {
        target: 'http://localhost:3000',  // Proxy requests to the backend on localhost:3000
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),  // Remove /api prefix in the request to the backend
      },
    },
  },
});
