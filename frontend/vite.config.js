import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Enable production optimizations
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console logs in production
      },
    },
    // Code splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': [
            'react',
            'react-dom',
            'react-router-dom',
            '@tanstack/react-query',
            'socket.io-client'
          ],
          'maps': [
            '@react-leaflet/core',
            'react-leaflet',
            'leaflet',
            '@googlemaps/js-api-loader'
          ],
          'charts': ['recharts'],
          'ui': [
            'lucide-react',
            'react-hot-toast',
            'framer-motion',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu'
          ]
        }
      }
    },
    // Increase chunk size warning threshold for large bundle
    chunkSizeWarningLimit: 1000,
    // Better source maps for debugging production issues
    sourcemap: false,
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        rewrite: (path) => path
      }
    }
  }
})
