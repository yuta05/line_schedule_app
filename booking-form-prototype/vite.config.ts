import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5173,
    proxy: {
      '/api/gas': {
        target: 'https://script.google.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/gas/, '/macros/s/AKfycbwuRvsTr8NVHbJ16xXay7CbMvs2-X4wYjdOmGGhS0CavLd3xJpAnnqnzHtf3yJeqjru/exec')
      }
    }
  }
})
