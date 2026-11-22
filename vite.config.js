import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // Ağır kitabxanalar (three.js, jsPDF) artıq dinamik import olunur.
    chunkSizeWarningLimit: 900
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.js'
  }
})
