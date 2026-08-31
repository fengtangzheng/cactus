import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const publicRoot = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  root: publicRoot,
  base: '/cactus/',
  plugins: [react()],
  build: {
    outDir: fileURLToPath(new URL('../../dist-public', import.meta.url)),
    emptyOutDir: true,
  },
})
