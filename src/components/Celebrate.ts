import { beep } from '../lib/util'

/** A tiny burst of hearts where you tapped. */
export function celebrate(x: number, y: number) {
  beep(988, 70, 0.12)
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const items = ['💗', '✨', '🌸', '💖']
  for (let i = 0; i < 7; i++) {
    const el = document.createElement('span')
    el.textContent = items[i % items.length]
    el.style.cssText = `position:fixed;left:${x}px;top:${y}px;font-size:20px;pointer-events:none;z-index:99`
    document.body.appendChild(el)
    const a = (Math.PI * 2 * i) / 7
    el.animate(
      [{ transform: 'translate(-50%,-50%) scale(.5)', opacity: 1 }, { transform: `translate(calc(-50% + ${Math.cos(a) * 60}px), calc(-50% + ${Math.sin(a) * 60 - 30}px)) scale(1.2)`, opacity: 0 }],
      { duration: 700, easing: 'ease-out' },
    ).onfinish = () => el.remove()
  }
}
