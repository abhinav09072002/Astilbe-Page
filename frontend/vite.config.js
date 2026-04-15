import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  plugins: [react()],

  build: {
    rollupOptions: {
      output: {
        manualChunks: { vendor: ['react', 'react-dom'] },
      },
    },
    minify: 'terser',
    sourcemap: false,
  },

  server: {
    port: 5173,           // FIX: was 3000 — now matches what FRONTEND_URL in backend .env expects
    strictPort: false,    // don't crash if port is busy, pick next available
    proxy: {
      // Dev proxy: all /api requests are forwarded to the backend.
      // This means VITE_API_URL should be empty ("") in development
      // so the frontend calls /api/... and the proxy rewrites to http://localhost:5000/api/...
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        // Uncomment below if your backend routes DON'T start with /api
        // rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
}))
