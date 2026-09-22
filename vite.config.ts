import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    // Sem manualChunks: o Three.js e o Recharts entram por import() dinâmico
    // (Hero e Stack), então o Rollup já os separa sozinho — e sem ciclo.
    chunkSizeWarningLimit: 900,
  },
})
