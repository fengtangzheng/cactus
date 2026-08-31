import { readFile, readdir } from 'node:fs/promises'
import { extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../dist-public/', import.meta.url))
const forbidden = [
  '作者秘密',
  '仅自己',
  '白信',
  '周署长',
  '冯唐正',
  'fengtangzheng',
  '她其实是姐姐从记忆中分离出的替身',
  '白信的真正寄件人',
  '他从未离开过旧邮路',
]

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const nested = await Promise.all(entries.map((entry) => {
    const path = join(directory, entry.name)
    return entry.isDirectory() ? collectFiles(path) : [path]
  }))
  return nested.flat()
}

const files = await collectFiles(root)
const readable = files.filter((file) => ['.html', '.js', '.css', '.json'].includes(extname(file)))
const matches = []

for (const file of readable) {
  const content = await readFile(file, 'utf8')
  for (const phrase of forbidden) {
    if (content.includes(phrase)) matches.push({ file, phrase })
  }
}

if (matches.length > 0) {
  console.error('Public build contains private-only markers:')
  for (const match of matches) console.error(`- ${match.phrase} in ${match.file}`)
  process.exit(1)
}

console.log(`Verified ${readable.length} public build files: no private-only markers found.`)
