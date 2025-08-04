
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Scribe Dash Review - Medical Notes Management',
        short_name: 'ScribeDash',
        description: 'Professional medical transcription and SOAP notes management system',
        theme_color: '#2563eb',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/lovable-uploads/df88d0f1-9e09-4f1b-86e3-b99f64568062.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/lovable-uploads/df88d0f1-9e09-4f1b-86e3-b99f64568062.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    // Ensure React is properly resolved in PWA context
    dedupe: ['react', 'react-dom'],
  },
  // Optimize dependencies for PWA
  optimizeDeps: {
    include: ['react', 'react-dom', '@radix-ui/react-tooltip'],
    dedupe: ['react', 'react-dom'],
    force: true
  },

  build: {
    // Ensure consistent React bundling
    rollupOptions: {
      external: [],
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
        }
      }
    }
  }
}));
