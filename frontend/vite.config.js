import react from "@vitejs/plugin-react";
import { defineConfig } from 'vite';

// Ensure VITE_API_URL is set in the environment file (.env)
export default defineConfig({
  plugins: [react()],
  
  server: {
    port: 5173, // React app running on port 5173 (default for Vite)
    proxy: {
     
    },
  },
});
