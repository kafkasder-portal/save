import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@ui': resolve(__dirname, './src/components/ui'),
      '@lib': resolve(__dirname, './src/lib'),
      '@components': resolve(__dirname, './src/components'),
      '@hooks': resolve(__dirname, './src/hooks'),
      '@utils': resolve(__dirname, './src/utils'),
      '@types': resolve(__dirname, './src/types'),
      '@pages': resolve(__dirname, './src/pages'),
      '@store': resolve(__dirname, './src/store'),
      '@contexts': resolve(__dirname, './src/contexts'),
      '@services': resolve(__dirname, './src/services'),
      '@constants': resolve(__dirname, './src/constants'),
      '@validators': resolve(__dirname, './src/validators'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          query: ['@tanstack/react-query'],
          supabase: ['@supabase/supabase-js'],
          ui: ['sonner', 'lucide-react'],
          pdf: ['jspdf', 'html2canvas'],
          charts: ['recharts'],
          forms: ['react-hook-form', '@hookform/resolvers'],
          validation: ['zod'],
          date: ['date-fns'],
          utils: ['clsx', 'class-variance-authority'],
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})
