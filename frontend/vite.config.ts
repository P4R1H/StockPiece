import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'


export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  server: {
    host: '0.0.0.0',
    port: 5173, 
    proxy: {
      '/api': {
        target: 'http://localhost:8000', // Your backend server URL
        changeOrigin: true,
        secure: false,
      }
    }
  }
})


