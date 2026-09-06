import { copyFile } from 'node:fs/promises'

await copyFile(new URL('../dist-public/index.html', import.meta.url), new URL('../dist-public/404.html', import.meta.url))
console.log('Created GitHub Pages SPA fallback: dist-public/404.html')
