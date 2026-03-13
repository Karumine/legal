import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    open: true,
    proxy: {
      '/dbd-api': {
        target: 'https://opendata.dbd.go.th',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/dbd-api/, ''),
        secure: false,
      },
    },
  },
})
