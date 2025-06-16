import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react({
      // Avoid SWC for better Vercel compatibility
      jsxRuntime: 'automatic',
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Optimize for production builds
  build: {
    minify: 'esbuild', // Use esbuild instead of terser for faster builds
    rollupOptions: {
      external: [], // Don't externalize any dependencies
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-accordion', '@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          map: ['mapbox-gl']
        }
      }
    },
    target: 'es2020', // Support BigInt literals and modern JS features
    chunkSizeWarningLimit: 1024, // Suppress chunk size warnings
  },
}));
