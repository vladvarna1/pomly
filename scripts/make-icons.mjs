// Generates PNG icons for the PWA from public/icon.svg
import sharp from 'sharp'
import { readFileSync } from 'node:fs'

const svg = readFileSync('public/icon.svg')
const out = (name, size, pad = 0) => {
  const inner = Math.round(size * (1 - pad * 2))
  return sharp(svg, { density: 384 })
    .resize(inner, inner)
    .extend({
      top: Math.round((size - inner) / 2),
      bottom: size - inner - Math.round((size - inner) / 2),
      left: Math.round((size - inner) / 2),
      right: size - inner - Math.round((size - inner) / 2),
      background: '#ffe4ec',
    })
    .png()
    .toFile(`public/${name}`)
}

await out('icon-192.png', 192)
await out('icon-512.png', 512)
await out('icon-maskable-512.png', 512, 0.1)
await out('apple-touch-icon.png', 180)
console.log('icons ready')
