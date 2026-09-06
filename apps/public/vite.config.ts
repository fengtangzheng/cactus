import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const publicRoot = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  root: publicRoot,
  base: '/cactus/',
  publicDir: fileURLToPath(new URL('../../public-assets', import.meta.url)),
  plugins: [react()],
  build: {
    outDir: fileURLToPath(new URL('../../dist-public', import.meta.url)),
    emptyOutDir: true,
  },
})
