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
        target: 'https://stockpiece.onrender.com',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})


