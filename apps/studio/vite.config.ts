import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const studioRoot = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  root: studioRoot,
  base: '/cactus/studio/',
  publicDir: false,
  plugins: [react()],
  build: {
    outDir: fileURLToPath(new URL('../../dist-public/studio', import.meta.url)),
    emptyOutDir: false,
  },
})
