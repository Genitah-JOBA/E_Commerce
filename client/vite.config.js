import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Force un nouveau hash
        entryFileNames: `assets/[name]-[hash]-new.js`,
        chunkFileNames: `assets/[name]-[hash]-new.js`,
        assetFileNames: `assets/[name]-[hash]-new.[ext]`
      }
    }
  }
})
