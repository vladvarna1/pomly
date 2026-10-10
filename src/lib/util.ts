export const DAY = 86400000

export const startOfDay = (ts: number) => {
  const d = new Date(ts)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}
export const endOfDay = (ts: number) => startOfDay(ts) + DAY - 1

const MON = ['яну', 'фев', 'мар', 'апр', 'май', 'юни', 'юли', 'авг', 'сеп', 'окт', 'ное', 'дек']
export const fmtDate = (ts: number) => {
  const d = new Date(ts)
  return `${d.getDate()} ${MON[d.getMonth()]} ${d.getFullYear()}`
}
export const fmtTime = (ts: number) =>
  new Date(ts).toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit' })

export const isoDay = (ts: number) => {
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
export const isoToTs = (s: string) => new Date(s + 'T12:00:00').getTime()

export const daysAgo = (ts: number) => Math.floor((startOfDay(Date.now()) - startOfDay(ts)) / DAY)
export const relDays = (ts: number) => {
  const n = daysAgo(ts)
  if (n <= 0) return 'днес'
  if (n === 1) return 'вчера'
  return `преди ${n} дни`
}

export const ageMonths = (birth?: string) => {
  if (!birth) return undefined
  const b = new Date(birth + 'T12:00:00')
  const n = new Date()
  return (n.getFullYear() - b.getFullYear()) * 12 + n.getMonth() - b.getMonth() - (n.getDate() < b.getDate() ? 1 : 0)
}
export const ageText = (birth?: string) => {
  const m = ageMonths(birth)
  if (m === undefined) return ''
  if (m < 12) return `${m} ${m === 1 ? 'месец' : 'месеца'}`
  const y = Math.floor(m / 12)
  const r = m % 12
  return `${y} ${y === 1 ? 'година' : 'години'}${r ? ` и ${r} ${r === 1 ? 'месец' : 'месеца'}` : ''}`
}
export const lifeStage = (birth?: string): 'puppy' | 'adult' | 'senior' => {
  const m = ageMonths(birth)
  if (m === undefined) return 'adult'
  return m < 12 ? 'puppy' : m >= 108 ? 'senior' : 'adult'
}

/** Compress a photo in the browser (max 1200px, WebP with JPEG fallback). */
export async function compressImage(file: File, max = 1200): Promise<string> {
  const bmp = await createImageBitmap(file)
  const k = Math.min(1, max / Math.max(bmp.width, bmp.height))
  const c = document.createElement('canvas')
  c.width = Math.round(bmp.width * k)
  c.height = Math.round(bmp.height * k)
  c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height)
  const webp = c.toDataURL('image/webp', 0.8)
  return webp.startsWith('data:image/webp') ? webp : c.toDataURL('image/jpeg', 0.8)
}

export const download = (name: string, content: BlobPart, type: string) => {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}

let ctx: AudioContext | undefined
export function beep(freq = 880, ms = 90, vol = 0.25) {
  try {
    ctx ??= new AudioContext()
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.frequency.value = freq
    o.type = 'square'
    g.gain.value = vol
    o.connect(g).connect(ctx.destination)
    o.start()
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + ms / 1000)
    o.stop(ctx.currentTime + ms / 1000)
  } catch {
    /* sound is optional */
  }
}
