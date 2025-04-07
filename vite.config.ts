import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      external: [
        'react-dom/client',
        'react-dom',
        'react',
        'mobx-react-lite'
      ]
    }
  },
  resolve: {
    alias: {
      // Define path aliases for more robust imports
      '@': path.resolve(__dirname, './src'),
      'react': path.resolve(__dirname, './node_modules/react'),
      'react-dom': path.resolve(__dirname, './node_modules/react-dom')
    }
  },
  // Ensure proper handling of environment variables
  define: {
    'process.env': process.env
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'mobx-react-lite']
  }
});