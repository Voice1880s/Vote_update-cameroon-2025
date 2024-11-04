import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { splitVendorChunkPlugin } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    splitVendorChunkPlugin()
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Create more granular chunks for better caching
          if (id.includes('node_modules/')) {
            // React core
            if (id.includes('react/') || id.includes('react-dom/')) {
              return 'vendor-react';
            }
            
            // UI related
            if (id.includes('@radix-ui/')) {
              return 'vendor-radix';
            }
            if (id.includes('@/components/ui/')) {
              return 'vendor-shadcn';
            }
            
            // Charts and visualization
            if (id.includes('recharts')) {
              return 'vendor-recharts';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            
            // State management
            if (id.includes('zustand') || id.includes('redux') || id.includes('recoil')) {
              return 'vendor-state';
            }
            
            // Forms and validation
            if (id.includes('@hookform/') || 
                id.includes('react-hook-form') || 
                id.includes('zod')) {
              return 'vendor-forms';
            }
            
            // Common utilities
            if (id.includes('lodash') || 
                id.includes('ramda') || 
                id.includes('date-fns')) {
              return 'vendor-utils';
            }

            // Animation libraries
            if (id.includes('framer-motion') || 
                id.includes('react-spring')) {
              return 'vendor-animations';
            }

            // Remaining node_modules
            return 'vendor-misc';
          }
        }
      }
    },
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false,
    chunkSizeWarningLimit: 600,
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})