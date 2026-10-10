import type { ReactNode } from 'react'

/* Hand-drawn (in code) cute Pom scenes. Every scene is a 320x200 SVG. */
const FUR = '#fbbf77', FUR2 = '#f59e4b', CREAM = '#fff4e0', INK = '#3b2a2f', PINK = '#ec4899', ROSE = '#f9a8c4', SKIN = '#ffd7c0', BONE = '#e3a05c', SKY = '#e0f2fe', STEEL = '#cbd5e1'

type Pose = 'sit' | 'stand' | 'down' | 'paw' | 'spin' | 'bow' | 'carried' | 'sniff' | 'leg'
type Mood = 'happy' | 'calm' | 'worried' | 'alert' | 'sick'

/* ---------- the Pom ---------- */
function Pom({ x = 110, y = 118, s = 1, pose = 'sit', mood = 'happy', harness = false, flip = false }: { x?: number; y?: number; s?: number; pose?: Pose; mood?: Mood; harness?: boolean; flip?: boolean }) {
  const headT = pose === 'down' ? 'translate(0 28)' : pose === 'sniff' ? 'translate(-10 30) rotate(14)' : pose === 'bow' ? 'translate(-22 38) rotate(12)' : pose === 'stand' || pose === 'leg' ? 'translate(0 6)' : ''
  const eyes = {
    happy: <><circle cx="-14" cy="-30" r="5.5" fill={INK} /><circle cx="14" cy="-30" r="5.5" fill={INK} /><circle cx="-12" cy="-32" r="2" fill="#fff" /><circle cx="16" cy="-32" r="2" fill="#fff" /></>,
    alert: <><circle cx="-14" cy="-30" r="6.5" fill={INK} /><circle cx="14" cy="-30" r="6.5" fill={INK} /><circle cx="-12" cy="-32" r="2.4" fill="#fff" /><circle cx="16" cy="-32" r="2.4" fill="#fff" /></>,
    calm: <><path d="M-21 -28 Q-14 -37 -7 -28" stroke={INK} strokeWidth="3.5" fill="none" strokeLinecap="round" /><path d="M7 -28 Q14 -37 21 -28" stroke={INK} strokeWidth="3.5" fill="none" strokeLinecap="round" /></>,
    worried: <><circle cx="-14" cy="-30" r="5.5" fill={INK} /><circle cx="14" cy="-30" r="5.5" fill={INK} /><circle cx="-12" cy="-32" r="2" fill="#fff" /><circle cx="16" cy="-32" r="2" fill="#fff" /><path d="M-22 -41 L-8 -37 M22 -41 L8 -37" stroke={INK} strokeWidth="3" strokeLinecap="round" /></>,
    sick: <><path d="M-21 -30 L-7 -30 M7 -30 L21 -30" stroke={INK} strokeWidth="3.5" strokeLinecap="round" /><path d="M30 -48 q4 7 0 10 q-4 -3 0 -10z" fill="#7dd3fc" /></>,
  }[mood]
  const mouth = {
    happy: <><path d="M0 -15 Q0 -9 -7 -8 M0 -15 Q0 -9 7 -8" stroke={INK} strokeWidth="2.6" fill="none" strokeLinecap="round" /><path d="M-5 -8 Q0 3 5 -8Z" fill="#f472b6" /></>,
    calm: <path d="M0 -15 Q0 -9 -7 -8 M0 -15 Q0 -9 7 -8" stroke={INK} strokeWidth="2.6" fill="none" strokeLinecap="round" />,
    worried: <path d="M-7 -8 Q-3 -12 0 -9 Q3 -12 7 -8" stroke={INK} strokeWidth="2.6" fill="none" strokeLinecap="round" />,
    alert: <ellipse cx="0" cy="-9" rx="4" ry="5" fill="#7f1d4d" />,
    sick: <path d="M-6 -9 L6 -9" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />,
  }[mood]
  const body = {
    sit: <><circle cx="42" cy="14" r="17" fill={FUR2} /><ellipse cx="0" cy="30" rx="46" ry="38" fill={FUR} /><ellipse cx="0" cy="40" rx="26" ry="24" fill={CREAM} /><ellipse cx="-16" cy="64" rx="11" ry="8" fill={CREAM} stroke={FUR} strokeWidth="2" /><ellipse cx="16" cy="64" rx="11" ry="8" fill={CREAM} stroke={FUR} strokeWidth="2" /></>,
    down: <><circle cx="62" cy="40" r="17" fill={FUR2} /><ellipse cx="0" cy="48" rx="62" ry="24" fill={FUR} /><ellipse cx="-26" cy="68" rx="14" ry="8" fill={CREAM} stroke={FUR} strokeWidth="2" /><ellipse cx="26" cy="68" rx="14" ry="8" fill={CREAM} stroke={FUR} strokeWidth="2" /></>,
    stand: <><circle cx="50" cy="16" r="17" fill={FUR2} /><ellipse cx="0" cy="34" rx="52" ry="32" fill={FUR} />{[-34, -13, 13, 34].map((px) => <ellipse key={px} cx={px} cy="68" rx="9" ry="7" fill={CREAM} stroke={FUR} strokeWidth="2" />)}</>,
    bow: <><circle cx="62" cy="-2" r="16" fill={FUR2} /><g transform="rotate(-20 20 30)"><ellipse cx="14" cy="26" rx="54" ry="30" fill={FUR} /></g><ellipse cx="-34" cy="72" rx="12" ry="7" fill={CREAM} stroke={FUR} strokeWidth="2" /><ellipse cx="-12" cy="74" rx="12" ry="7" fill={CREAM} stroke={FUR} strokeWidth="2" /><ellipse cx="38" cy="62" rx="9" ry="9" fill={CREAM} stroke={FUR} strokeWidth="2" /><ellipse cx="58" cy="62" rx="9" ry="9" fill={CREAM} stroke={FUR} strokeWidth="2" /></>,
  }
  const b = pose === 'down' ? body.down : pose === 'stand' || pose === 'sniff' || pose === 'leg' ? body.stand : pose === 'bow' ? body.bow : body.sit
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      {b}
      {pose === 'paw' && <g transform="rotate(-35 36 30)"><ellipse cx="42" cy="26" rx="9" ry="16" fill={CREAM} stroke={FUR} strokeWidth="2" /></g>}
      {pose === 'leg' && <g transform="rotate(40 40 50)"><ellipse cx="40" cy="62" rx="8" ry="14" fill={CREAM} stroke={FUR} strokeWidth="2" /></g>}
      {harness && <g stroke={PINK} strokeWidth="6" fill="none" strokeLinecap="round"><path d="M-30 14 Q0 40 30 14" /><path d="M0 22 L0 -4" /><circle cx="0" cy="-4" r="4" fill="#fff" /></g>}
      {pose === 'carried' && <g fill={SKIN} stroke="#f1b896" strokeWidth="2"><rect x="-70" y="62" width="62" height="22" rx="11" /><rect x="8" y="62" width="62" height="22" rx="11" /></g>}
      <g transform={headT}>
        <circle cx="0" cy="-30" r="44" fill={FUR} />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => <circle key={a} cx={Math.cos((a * Math.PI) / 180) * 42} cy={-30 + Math.sin((a * Math.PI) / 180) * 42} r="11" fill={FUR} />)}
        <path d="M-34 -52 L-42 -94 L-8 -72Z" fill={FUR2} stroke={FUR} strokeWidth="6" strokeLinejoin="round" />
        <path d="M34 -52 L42 -94 L8 -72Z" fill={FUR2} stroke={FUR} strokeWidth="6" strokeLinejoin="round" />
        <path d="M-31 -58 L-37 -82 L-17 -68Z M31 -58 L37 -82 L17 -68Z" fill={ROSE} />
        <ellipse cx="0" cy="-22" rx="30" ry="26" fill={CREAM} />
        {eyes}
        <ellipse cx="0" cy="-20" rx="7" ry="5" fill={INK} />
        {mouth}
        <ellipse cx="-25" cy="-16" rx="7" ry="4" fill={ROSE} opacity=".8" /><ellipse cx="25" cy="-16" rx="7" ry="4" fill={ROSE} opacity=".8" />
        <path d="M22 -68 L2 -80 Q-2 -68 2 -58Z M22 -68 L42 -80 Q46 -68 42 -58Z" transform="translate(2 -2) scale(.8)" fill={PINK} /><circle cx="24" cy="-70" r="6" fill="#db2777" />
      </g>
    </g>
  )
}

/* ---------- props ---------- */
const Treat = ({ x, y }: { x: number; y: number }) => (
  <g transform={`translate(${x} ${y})`} fill={BONE}><rect x="-9" y="-3.5" width="18" height="7" rx="3" />{[[-9, -4], [-9, 4], [9, -4], [9, 4]].map(([a, b]) => <circle key={`${a}${b}`} cx={a} cy={b} r="3.4" />)}</g>
)
function Hand({ x, y, rot = 0, flip = false, children, point = false }: { x: number; y: number; rot?: number; flip?: boolean; children?: ReactNode; point?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${flip ? -1 : 1} 1)`}>
      <rect x="14" y="-14" width="90" height="28" rx="12" fill="#f9a8d4" />
      <ellipse cx="0" cy="0" rx="17" ry="13" fill={SKIN} stroke="#f1b896" strokeWidth="1.5" />
      {point ? <ellipse cx="-22" cy="-3" rx="12" ry="4.5" fill={SKIN} stroke="#f1b896" strokeWidth="1.5" /> : [-7, 0, 7].map((o) => <ellipse key={o} cx={-17 - Math.abs(o) / 3} cy={o} rx="8" ry="4.5" fill={SKIN} stroke="#f1b896" strokeWidth="1.5" />)}
      <ellipse cx="-4" cy="-14" rx="5" ry="8" fill={SKIN} stroke="#f1b896" strokeWidth="1.5" />
      {children}
    </g>
  )
}
const Brush = ({ x, y, rot = 0 }: { x: number; y: number; rot?: number }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}><rect x="0" y="-4" width="36" height="8" rx="4" fill={ROSE} /><rect x="-36" y="-9" width="36" height="18" rx="7" fill="#f472b6" />{[-32, -26, -20, -14, -8, -2].map((o) => <circle key={o} cx={o} cy="9" r="1.8" fill={INK} />)}</g>
)
const Comb = ({ x, y, rot = 0 }: { x: number; y: number; rot?: number }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}><rect x="0" y="-3" width="30" height="6" rx="3" fill={ROSE} /><rect x="-40" y="-7" width="40" height="8" rx="3" fill={STEEL} stroke="#94a3b8" />{Array.from({ length: 10 }, (_, i) => <line key={i} x1={-38 + i * 4} y1="1" x2={-38 + i * 4} y2="12" stroke="#94a3b8" strokeWidth="1.4" />)}</g>
)
const Clipper = ({ x, y, rot = 0 }: { x: number; y: number; rot?: number }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}><path d="M0 0 L-34 -8 L-34 -2Z M0 0 L-34 8 L-34 2Z" fill={STEEL} stroke="#94a3b8" /><path d="M0 0 Q26 -22 34 -8 M0 0 Q26 22 34 8" stroke="#f472b6" strokeWidth="6" fill="none" strokeLinecap="round" /></g>
)
const ToothBrush = ({ x, y, rot = 0 }: { x: number; y: number; rot?: number }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}><rect x="0" y="-3" width="46" height="6" rx="3" fill="#f472b6" /><rect x="-16" y="-5" width="18" height="10" rx="3" fill="#bae6fd" />{[-14, -10, -6, -2].map((o) => <line key={o} x1={o} y1="-5" x2={o} y2="-10" stroke="#38bdf8" strokeWidth="2" />)}</g>
)
const Dryer = ({ x, y, rot = 0 }: { x: number; y: number; rot?: number }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}><rect x="0" y="-14" width="46" height="28" rx="12" fill={ROSE} /><path d="M0 -10 L-16 -14 L-16 14 L0 10Z" fill={STEEL} /><rect x="20" y="10" width="12" height="26" rx="5" fill="#f472b6" />{[-8, 0, 8].map((o) => <path key={o} d={`M-22 ${o} q-14 -6 -26 ${o / 2}`} stroke="#7dd3fc" strokeWidth="3" fill="none" strokeLinecap="round" />)}</g>
)
const Clock = ({ x, y, r = 16, label }: { x: number; y: number; r?: number; label?: string }) => (
  <g transform={`translate(${x} ${y})`}><circle r={r} fill="#fff" stroke={PINK} strokeWidth="3" /><path d={`M0 0 L0 ${-r * 0.6} M0 0 L${r * 0.45} ${r * 0.2}`} stroke={INK} strokeWidth="2.5" strokeLinecap="round" />{label && <text y={r + 14} textAnchor="middle" fontSize="12" fontWeight="800" fill={INK} fontFamily="Nunito,sans-serif">{label}</text>}</g>
)
const Heart = ({ x, y, s = 1, c = PINK }: { x: number; y: number; s?: number; c?: string }) => <path transform={`translate(${x} ${y}) scale(${s})`} d="M0 6 C-14 -4 -10 -16 0 -8 C10 -16 14 -4 0 6Z" fill={c} />
const Spark = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => <path transform={`translate(${x} ${y}) scale(${s})`} d="M0 -9 L2.5 -2.5 L9 0 L2.5 2.5 L0 9 L-2.5 2.5 L-9 0 L-2.5 -2.5Z" fill="#fde047" stroke="#facc15" />
const Cross = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => <g transform={`translate(${x} ${y}) scale(${s})`}><circle r="17" fill="#fff" stroke="#dc2626" strokeWidth="4" /><path d="M-8 -8 L8 8 M8 -8 L-8 8" stroke="#dc2626" strokeWidth="5" strokeLinecap="round" /></g>
const Check = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => <g transform={`translate(${x} ${y}) scale(${s})`}><circle r="15" fill="#bbf7d0" stroke="#16a34a" strokeWidth="3" /><path d="M-7 0 L-2 6 L8 -6" stroke="#15803d" strokeWidth="4.5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></g>
const Arrow = ({ d, c = PINK }: { d: string; c?: string }) => <><defs><marker id={`ah${c.slice(1)}`} viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10Z" fill={c} /></marker></defs><path d={d} stroke={c} strokeWidth="3.5" strokeDasharray="7 6" fill="none" strokeLinecap="round" markerEnd={`url(#ah${c.slice(1)})`} /></>
const Bubble = ({ x, y, text, w }: { x: number; y: number; text: string; w?: number }) => {
  const W = w ?? Math.max(54, text.length * 9 + 22)
  return <g transform={`translate(${x} ${y})`}><rect x={-W / 2} y="-15" width={W} height="30" rx="15" fill="#fff" stroke={ROSE} strokeWidth="2.5" /><path d="M-6 14 L0 24 L6 14Z" fill="#fff" stroke={ROSE} strokeWidth="2.5" strokeLinejoin="round" /><rect x="-8" y="11" width="16" height="5" fill="#fff" /><text textAnchor="middle" y="5" fontSize="14" fontWeight="800" fill="#be185d" fontFamily="Nunito,sans-serif">{text}</text></g>
}
const Waves = ({ x, y, flip = false }: { x: number; y: number; flip?: boolean }) => <g transform={`translate(${x} ${y}) scale(${flip ? -1 : 1} 1)`} stroke={PINK} strokeWidth="3.5" fill="none" strokeLinecap="round">{[0, 1, 2].map((i) => <path key={i} d={`M${i * 11} ${-6 - i * 5} Q${i * 11 + 8} 0 ${i * 11} ${6 + i * 5}`} />)}</g>
const Mat = ({ x, y, w = 130 }: { x: number; y: number; w?: number }) => <g transform={`translate(${x} ${y})`}><rect x={-w / 2} y="-8" width={w} height="20" rx="10" fill="#f9a8d4" stroke={PINK} strokeWidth="2" /><circle cx="0" cy="3" r="4" fill="#fff" /><circle cx="-8" cy="-1" r="2" fill="#fff" /><circle cx="0" cy="-3" r="2" fill="#fff" /><circle cx="8" cy="-1" r="2" fill="#fff" /></g>
const Toy = ({ x, y, rot = 0 }: { x: number; y: number; rot?: number }) => <g transform={`translate(${x} ${y}) rotate(${rot})`}><rect x="-22" y="-4" width="44" height="8" rx="4" fill="#fcd34d" stroke="#f59e0b" /><circle cx="-24" cy="0" r="7" fill="#fbbf24" stroke="#f59e0b" /><circle cx="24" cy="0" r="7" fill="#fbbf24" stroke="#f59e0b" /></g>
const Ball = ({ x, y }: { x: number; y: number }) => <g transform={`translate(${x} ${y})`}><circle r="10" fill="#fde047" stroke="#f59e0b" strokeWidth="2" /><path d="M-8 -4 Q0 2 8 -4" stroke="#f59e0b" strokeWidth="2" fill="none" /></g>
const Bowl = ({ x, y }: { x: number; y: number }) => <g transform={`translate(${x} ${y})`}><path d="M-26 0 H26 Q22 22 0 22 Q-22 22 -26 0Z" fill="#f472b6" stroke="#db2777" strokeWidth="2" /><ellipse cx="0" cy="0" rx="26" ry="6" fill="#fda4af" /><circle cx="-8" cy="-3" r="4" fill={BONE} /><circle cx="2" cy="-4" r="4" fill={BONE} /><circle cx="10" cy="-2" r="4" fill={BONE} /></g>
const Tree = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => <g transform={`translate(${x} ${y}) scale(${s})`}><rect x="-6" y="0" width="12" height="40" rx="3" fill="#a16207" /><circle cx="0" cy="-8" r="28" fill="#4ade80" /><circle cx="-18" cy="6" r="18" fill="#22c55e" /><circle cx="18" cy="6" r="18" fill="#22c55e" /></g>
const Sun = ({ x, y }: { x: number; y: number }) => <g transform={`translate(${x} ${y})`}><circle r="20" fill="#fde047" />{Array.from({ length: 8 }, (_, i) => <line key={i} x1="0" y1="-27" x2="0" y2="-36" stroke="#facc15" strokeWidth="4" strokeLinecap="round" transform={`rotate(${i * 45})`} />)}</g>
const Drops = ({ x, y, n = 5 }: { x: number; y: number; n?: number }) => <g transform={`translate(${x} ${y})`}>{Array.from({ length: n }, (_, i) => <path key={i} transform={`translate(${(i - n / 2) * 14} ${(i % 2) * 12})`} d="M0 -7 Q6 2 0 6 Q-6 2 0 -7Z" fill="#38bdf8" />)}</g>
const Bubbles = ({ pts }: { pts: [number, number, number][] }) => <>{pts.map(([a, b, r], i) => <circle key={i} cx={a} cy={b} r={r} fill="#fff" fillOpacity=".8" stroke="#7dd3fc" strokeWidth="1.5" />)}</>
const Towel = ({ x, y, w = 80 }: { x: number; y: number; w?: number }) => <g transform={`translate(${x} ${y})`}><rect x={-w / 2} y="-8" width={w} height="16" rx="8" fill="#bae6fd" stroke="#38bdf8" strokeWidth="2" /><path d={`M${-w / 2 + 12} -8 V8 M${w / 2 - 12} -8 V8`} stroke="#fff" strokeWidth="3" /></g>
const Spray = ({ x, y }: { x: number; y: number }) => <g transform={`translate(${x} ${y})`}><rect x="-12" y="0" width="24" height="40" rx="7" fill="#f9a8d4" stroke={PINK} strokeWidth="2" /><rect x="-8" y="-12" width="22" height="12" rx="4" fill={STEEL} /><path d="M-8 -8 H-22" stroke="#94a3b8" strokeWidth="5" strokeLinecap="round" />{[[-34, -14], [-42, -6], [-36, 2], [-48, -12], [-52, 0]].map(([a, b], i) => <circle key={i} cx={a} cy={b} r="2.4" fill="#38bdf8" />)}</g>
const Scissors = ({ x, y, rot = 0 }: { x: number; y: number; rot?: number }) => <g transform={`translate(${x} ${y}) rotate(${rot})`}><path d="M0 0 L-34 -7 M0 0 L-34 7" stroke="#94a3b8" strokeWidth="5" strokeLinecap="round" /><circle cx="14" cy="-9" r="8" fill="none" stroke="#f472b6" strokeWidth="4" /><circle cx="14" cy="9" r="8" fill="none" stroke="#f472b6" strokeWidth="4" /></g>
const Cotton = ({ x, y, rot = 0 }: { x: number; y: number; rot?: number }) => <g transform={`translate(${x} ${y}) rotate(${rot})`}><rect x="0" y="-2" width="34" height="4" rx="2" fill="#e2e8f0" /><circle cx="-2" cy="0" r="7" fill="#fff" stroke={STEEL} strokeWidth="2" /></g>
const BigDog = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => <g transform={`translate(${x} ${y}) scale(${s})`}><ellipse cx="0" cy="30" rx="56" ry="30" fill="#a16207" /><circle cx="-44" cy="-4" r="26" fill="#ca8a04" /><path d="M-58 -16 Q-84 -4 -66 24 Q-52 12 -52 -6Z" fill="#7c2d12" /><path d="M52 10 Q80 -10 70 -34 Q50 -20 46 6Z" fill="#a16207" /><ellipse cx="-62" cy="6" rx="13" ry="10" fill="#d6a76b" /><circle cx="-46" cy="-8" r="3.5" fill={INK} /><ellipse cx="-69" cy="0" rx="4" ry="3" fill={INK} />{[-34, -12, 20, 42].map((l) => <rect key={l} x={l - 6} y="48" width="12" height="30" rx="5" fill="#92400e" />)}</g>
const Cup = ({ x, y }: { x: number; y: number }) => <path transform={`translate(${x} ${y})`} d="M-16 -22 H16 L12 4 H-12Z" fill="#fda4af" stroke="#e11d48" strokeWidth="2" />
const Leash = ({ d }: { d: string }) => <path d={d} stroke="#be185d" strokeWidth="3.5" fill="none" strokeLinecap="round" />
const Pad = ({ x, y }: { x: number; y: number }) => <g transform={`translate(${x} ${y})`}><rect x="-50" y="-12" width="100" height="26" rx="6" fill="#fff" stroke="#93c5fd" strokeWidth="2.5" strokeDasharray="6 4" /></g>
const Puddle = ({ x, y }: { x: number; y: number }) => <ellipse cx={x} cy={y} rx="30" ry="9" fill="#bae6fd" stroke="#7dd3fc" strokeWidth="2" />
const Clicker = ({ x, y }: { x: number; y: number }) => <g transform={`translate(${x} ${y})`}><rect x="-18" y="-12" width="36" height="24" rx="8" fill="#60a5fa" stroke="#2563eb" strokeWidth="2" /><circle cx="0" cy="0" r="6" fill="#dbeafe" /><path d="M24 -10 l8 -6 M26 0 h10 M24 10 l8 6" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" /></g>
const Tub = ({ lift = 0 }: { lift?: number }) => <g><path d={`M20 ${150 - lift} H220 Q216 196 180 196 H60 Q24 196 20 ${150 - lift}Z`} fill="#bae6fd" stroke="#38bdf8" strokeWidth="3" /><rect x="14" y={144 - lift} width="212" height="12" rx="6" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="3" /></g>
const Shower = ({ x, y }: { x: number; y: number }) => <g transform={`translate(${x} ${y})`}><path d="M60 -20 Q20 -30 8 0" stroke={STEEL} strokeWidth="6" fill="none" strokeLinecap="round" /><path d="M-6 0 H22 L16 14 H0Z" fill={STEEL} stroke="#94a3b8" />{[-4, 4, 12, 20].map((a) => <line key={a} x1={a} y1="22" x2={a - 3} y2="46" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" strokeDasharray="5 5" />)}</g>
const Clinic = ({ x, y }: { x: number; y: number }) => <g transform={`translate(${x} ${y})`}><rect x="-40" y="-40" width="80" height="80" rx="8" fill="#fff" stroke={ROSE} strokeWidth="3" /><path d="M-8 -22 H8 V-8 H22 V8 H8 V22 H-8 V8 H-22 V-8 H-8Z" fill="#f43f5e" /><rect x="-10" y="26" width="20" height="14" fill={ROSE} /></g>
const Crate = () => <g fill="none" stroke={PINK} strokeWidth="4" strokeLinecap="round"><rect x="30" y="52" width="170" height="116" rx="10" fill="#fff" fillOpacity=".25" />{[62, 94, 126, 158].map((a) => <path key={a} d={`M${a + 30} 52 V168`} />)}<path d="M200 52 L246 70 V150 L200 168" stroke="#f472b6" /></g>
const Door = ({ x, y }: { x: number; y: number }) => <g transform={`translate(${x} ${y})`}><rect x="-28" y="-60" width="56" height="120" rx="6" fill="#d6a76b" stroke="#a16207" strokeWidth="3" /><circle cx="16" cy="4" r="4" fill="#fde047" /></g>
const Sofa = ({ x, y }: { x: number; y: number }) => <g transform={`translate(${x} ${y})`}><rect x="-60" y="-34" width="120" height="30" rx="12" fill="#c4b5fd" /><rect x="-70" y="-14" width="140" height="34" rx="12" fill="#a78bfa" /><rect x="-64" y="20" width="10" height="10" fill="#7c3aed" /><rect x="54" y="20" width="10" height="10" fill="#7c3aed" /></g>
const Choco = ({ x, y }: { x: number; y: number }) => <g transform={`translate(${x} ${y})`}><rect x="-16" y="-12" width="32" height="24" rx="4" fill="#7c2d12" />{[-8, 0, 8].map((a) => <path key={a} d={`M${a} -12 V12`} stroke="#9a3412" />)}</g>
const Grapes = ({ x, y }: { x: number; y: number }) => <g transform={`translate(${x} ${y})`} fill="#a78bfa" stroke="#7c3aed">{[[-8, -6], [8, -6], [0, 4], [-8, 14], [8, 14], [0, 24]].map(([a, b], i) => <circle key={i} cx={a} cy={b} r="7" />)}<path d="M0 -14 q4 -10 10 -10" stroke="#15803d" strokeWidth="3" fill="none" /></g>
const Phone = ({ x, y }: { x: number; y: number }) => <g transform={`translate(${x} ${y})`}><rect x="-14" y="-24" width="28" height="48" rx="7" fill="#fff" stroke={INK} strokeWidth="3" /><path d="M-6 -6 Q0 -14 6 -6 L2 0 Q6 6 10 4 L8 10 Q-4 10 -8 -2Z" fill="#16a34a" /></g>

/* ---------- scene frame ---------- */
type Kind = 'room' | 'grass' | 'bath' | 'plain'
function Frame({ kind = 'room', children }: { kind?: Kind; children: ReactNode }) {
  const bg = { room: '#fff1f5', grass: SKY, bath: '#ecfeff', plain: '#fff1f5' }[kind]
  return (
    <svg viewBox="0 0 320 200" className="block w-full" fontFamily="Nunito, sans-serif">
      <rect width="320" height="200" fill={bg} />
      {kind === 'room' && <><rect y="168" width="320" height="32" fill="#ffd6e4" /><circle cx="22" cy="24" r="6" fill="#fbcfe8" /><circle cx="300" cy="170" r="5" fill="#fbcfe8" /></>}
      {kind === 'grass' && <><rect y="166" width="320" height="34" fill="#86efac" /><circle cx="280" cy="30" r="0" /></>}
      {kind === 'bath' && <path d="M0 40 H320 M0 90 H320 M0 140 H320 M60 0 V200 M160 0 V200 M260 0 V200" stroke="#cffafe" strokeWidth="2" />}
      {children}
    </svg>
  )
}
const T = ({ x, y, children, size = 13, c = '#be185d', anchor = 'middle' }: { x: number; y: number; children: ReactNode; size?: number; c?: string; anchor?: 'start' | 'middle' | 'end' }) => <text x={x} y={y} textAnchor={anchor} fontSize={size} fontWeight="800" fill={c}>{children}</text>
const Num = ({ x, y, n }: { x: number; y: number; n: number }) => <g transform={`translate(${x} ${y})`}><circle r="11" fill={PINK} stroke="#fff" strokeWidth="2" /><text y="5" textAnchor="middle" fontSize="13" fontWeight="800" fill="#fff">{n}</text></g>
const Faded = ({ children }: { children: ReactNode }) => <g opacity=".55">{children}</g>

/* ---------- scenes ---------- */
type Scene = () => ReactNode
export const scenes: Record<string, Scene> = {
  portrait: () => <Frame><Pom x={160} y={110} s={1.05} /><Heart x={70} y={50} s={1.4} /><Spark x={250} y={44} s={1.3} /><Heart x={262} y={110} /></Frame>,
  /* ---- training ---- */
  name: () => <Frame><Pom x={100} /><Hand x={250} y={78}><Treat x={-28} y={0} /></Hand><Bubble x={170} y={26} text="Дарси!" /><Spark x={150} y={60} /></Frame>,
  sit: () => <Frame><Pom x={95} pose="sit" /><Hand x={265} y={48}><Treat x={-28} y={0} /></Hand><Arrow d="M232 62 Q190 70 150 40" /><Bubble x={190} y={22} text="Седни" /></Frame>,
  down: () => <Frame><Pom x={95} pose="down" mood="calm" /><Hand x={265} y={150} rot={0}><Treat x={-28} y={0} /></Hand><Arrow d="M240 100 Q250 125 238 143" /><Bubble x={190} y={32} text="Лягай" /></Frame>,
  come: () => <Frame><Hand x={30} y={84} flip><Treat x={-28} y={0} /></Hand><Pom x={236} y={116} pose="stand" s={.9} /><Arrow d="M190 130 Q130 150 78 100" /><Bubble x={110} y={28} text="Ела!" /><Waves x={288} y={150} flip /></Frame>,
  drop: () => <Frame><Pom x={95} pose="stand" /><Toy x={95} y={120} /><Hand x={262} y={104}><Treat x={-28} y={0} /></Hand><Arrow d="M232 118 Q190 130 150 124" /><Bubble x={190} y={28} text="Пусни" /></Frame>,
  leave: () => <Frame><Pom x={238} y={120} pose="sit" s={.85} mood="calm" /><Treat x={90} y={166} /><Hand x={146} y={160} rot={-4} /><Cross x={60} y={130} s={.8} /><Bubble x={140} y={80} text="Остави" /><Hand x={300} y={40} flip={false}><Treat x={-28} y={0} /></Hand></Frame>,
  mat: () => <Frame><Mat x={100} y={170} w={150} /><Pom x={100} y={120} pose="down" mood="calm" /><Heart x={200} y={90} s={1.3} /><Bubble x={230} y={40} text="Място" /></Frame>,
  crate: () => <Frame><Pom x={110} y={118} s={.62} /><Crate /><Treat x={80} y={160} /><Heart x={270} y={40} s={1.3} /><Bubble x={270} y={110} text="Уютно!" /></Frame>,
  alone: () => <Frame><Door x={268} y={110} /><Pom x={90} s={.9} mood="calm" /><Toy x={100} y={172} /><Clock x={190} y={50} r={20} label="5 сек" /><Heart x={160} y={110} s={1.2} /></Frame>,
  /* potty */
  schedule: () => <Frame kind="grass"><Tree x={250} y={86} s={.9} /><Pom x={100} pose="stand" /><Clock x={190} y={46} r={20} label="след ядене" /><Treat x={170} y={160} /><Heart x={40} y={50} s={1.4} /></Frame>,
  pads: () => <Frame><Pad x={110} y={168} /><Pom x={110} pose="stand" s={.9} /><Bubble x={250} y={50} text="Тук" /><Check x={250} y={100} s={1.2} /></Frame>,
  accidents: () => <Frame><Puddle x={200} y={162} /><Pom x={90} s={.85} mood="calm" /><Spray x={262} y={110} /><Cross x={240} y={62} s={.9} /><T x={240} y={96} size={11} c="#b91c1c">без мъмрене</T></Frame>,
  /* barking */
  types: () => <Frame><Pom x={110} mood="alert" /><Waves x={170} y={74} /><Bubble x={250} y={40} text="Ав! Ав!" /><Door x={290} y={120} /></Frame>,
  quiet: () => <Frame><Pom x={95} mood="calm" /><Faded><Waves x={150} y={70} /></Faded><Hand x={262} y={90}><Treat x={-28} y={0} /></Hand><Bubble x={200} y={30} text="Тихо" /></Frame>,
  demand: () => <Frame><Pom x={95} mood="alert" /><Waves x={150} y={76} /><Clock x={250} y={60} r={20} label="чакай" /><Heart x={250} y={130} s={1.3} /><T x={250} y={158} size={11}>награда при тишина</T></Frame>,
  /* harness / walk */
  wear: () => <Frame><Pom x={100} pose="sit" harness /><Hand x={262} y={84}><Treat x={-28} y={0} /></Hand><Bubble x={190} y={26} text="Нагръдник" /></Frame>,
  loose: () => <Frame kind="grass"><Pom x={90} pose="stand" harness s={.9} /><Leash d="M105 118 Q170 168 250 110" /><Hand x={270} y={100} /><Check x={175} y={40} s={1.3} /><T x={175} y={72} size={12}>хлабава каишка</T></Frame>,
  sniffwalk: () => <Frame kind="grass"><Pom x={100} pose="sniff" harness s={.9} /><Leash d="M118 124 Q180 150 260 100" /><Hand x={280} y={92} /><Bubble x={210} y={34} text="Свободно!" /></Frame>,
  /* coop grooming */
  touch: () => <Frame><Pom x={100} pose="paw" /><Hand x={210} y={96} point /><Hand x={280} y={48}><Treat x={-28} y={0} /></Hand><Bubble x={150} y={24} text="Докосване" /></Frame>,
  coopbrush: () => <Frame><Pom x={100} pose="sit" mood="calm" /><Brush x={192} y={100} rot={-20} /><Hand x={280} y={62}><Treat x={-28} y={0} /></Hand><Heart x={50} y={50} s={1.2} /></Frame>,
  coopnail: () => <Frame><Pom x={100} pose="paw" mood="calm" /><Clipper x={196} y={118} /><Hand x={280} y={62}><Treat x={-28} y={0} /></Hand><Bubble x={200} y={30} text="Само докосване" w={140} /></Frame>,
  coopdryer: () => <Frame><Pom x={90} mood="calm" /><Dryer x={228} y={70} /><Arrow d="M210 140 Q200 150 180 150" c="#38bdf8" /><T x={250} y={130} size={11}>на разстояние</T><Treat x={140} y={168} /></Frame>,
  /* social */
  big: () => <Frame kind="grass"><BigDog x={250} y={100} s={.95} /><Pom x={70} s={.7} y={124} pose="sit" mood="calm" /><Treat x={120} y={162} /><Arrow d="M110 100 H190" c="#16a34a" /><T x={150} y={90} size={11} c="#15803d">разстояние</T></Frame>,
  carry: () => <Frame><Pom x={160} y={92} pose="carried" mood="calm" /><T x={160} y={190} size={12}>две ръце – гърди и задница</T></Frame>,
  vetvisit: () => <Frame kind="grass"><Clinic x={250} y={92} /><Pom x={96} s={.85} /><Treat x={178} y={162} /><Heart x={190} y={60} s={1.3} /><T x={250} y={148} size={11}>щастливо посещение</T></Frame>,
  /* tricks */
  spin: () => <Frame><Pom x={110} pose="sit" /><circle cx="110" cy="110" r="84" stroke={ROSE} strokeWidth="3" fill="none" strokeDasharray="8 7" /><Hand x={290} y={44}><Treat x={-28} y={0} /></Hand><Arrow d="M262 52 Q220 20 180 40" /></Frame>,
  paw: () => <Frame><Pom x={110} pose="paw" /><Hand x={230} y={96} point /><Treat x={266} y={62} /><Bubble x={230} y={30} text="Лапа" /></Frame>,
  bow: () => <Frame><Pom x={170} y={104} pose="bow" mood="happy" /><Hand x={40} y={156} flip><Treat x={-28} y={0} /></Hand><Bubble x={250} y={40} text="Поклон" /><Spark x={250} y={90} /></Frame>,
  find: () => <Frame><Pom x={90} pose="sniff" /><Cup x={190} y={166} /><Cup x={232} y={166} /><Cup x={274} y={166} /><Bubble x={232} y={104} text="Намери го" /><Spark x={210} y={140} /></Frame>,
  /* generic training */
  click: () => <Frame><Clicker x={110} y={100} /><Bubble x={110} y={44} text="КЛИК!" /><Arrow d="M140 100 H200" /><Treat x={228} y={100} /><T x={170} y={150} size={12}>първо клик – после лакомство</T></Frame>,
  reward: () => <Frame><Pom x={110} mood="happy" /><Treat x={180} y={100} /><Heart x={50} y={50} s={1.4} /><Heart x={250} y={60} s={1.1} /><Spark x={220} y={40} /></Frame>,
  timer: () => <Frame><Clock x={160} y={90} r={44} /><T x={160} y={170} size={16}>3–5 минути</T></Frame>,
  repeat: () => <Frame>{[0, 1, 2, 3, 4].map((i) => <Check key={i} x={50 + i * 55} y={90} s={1.3} />)}<T x={160} y={150} size={14}>5–10 повторения</T></Frame>,
  /* ---- grooming ---- */
  settle: () => <Frame><Towel x={100} y={176} w={130} /><Pom x={100} s={.95} mood="calm" /><Hand x={262} y={90}><Treat x={-28} y={0} /></Hand></Frame>,
  spray: () => <Frame><Pom x={90} pose="stand" s={.95} mood="calm" /><Spray x={250} y={90} /></Frame>,
  sections: () => <Frame><Pom x={110} pose="stand" /><path d="M72 112 H150 M66 126 H156 M62 140 H160" stroke={PINK} strokeWidth="3" strokeDasharray="6 5" /><Brush x={236} y={104} rot={-14} /><Num x={206} y={70} n={1} /><T x={252} y={60} size={11}>вдигни горния слой</T><T x={252} y={150} size={11}>четкай отдолу</T><Arrow d="M240 140 Q196 140 164 134" /></Frame>,
  hotspots: () => <Frame><Pom x={110} y={112} pose="stand" /><Num x={64} y={52} n={1} /><Num x={110} y={112} n={2} /><Num x={80} y={150} n={3} /><Num x={152} y={128} n={4} /><Num x={166} y={96} n={5} /><g fontSize="10.5" fontWeight="800" fill="#be185d"><text x="196" y="44">1 зад ушите</text><text x="196" y="68">2 яка / врат</text><text x="196" y="92">3 мишници</text><text x="196" y="116">4 „гащи“</text><text x="196" y="140">5 опашка</text></g></Frame>,
  comb: () => <Frame><Pom x={100} pose="stand" /><Comb x={218} y={98} rot={-12} /><Spark x={50} y={56} /><Spark x={180} y={40} s={.8} /><T x={250} y={150} size={11}>закачи ли се – има възел</T></Frame>,
  praise: () => <Frame><Pom x={100} mood="happy" /><Hand x={262} y={86}><Treat x={-28} y={0} /></Hand><Heart x={180} y={44} s={1.4} /><Heart x={50} y={60} s={1.1} /></Frame>,
  quickbrush: () => <Frame><Pom x={100} pose="stand" mood="calm" /><Brush x={190} y={98} rot={-22} /><Clock x={262} y={60} r={22} label="3–5 мин" /></Frame>,
  bathwet: () => <Frame kind="bath"><Pom x={120} y={116} s={.9} mood="calm" /><Tub /><Shower x={190} y={20} /><Drops x={130} y={90} n={4} /></Frame>,
  shampoo: () => <Frame kind="bath"><Pom x={120} y={116} s={.9} mood="calm" /><Bubbles pts={[[96, 100, 9], [130, 88, 7], [150, 110, 10], [110, 130, 8], [138, 66, 6]]} /><Tub /><g transform="translate(255 110)"><rect x="-12" y="-6" width="24" height="44" rx="8" fill="#f9a8d4" stroke={PINK} strokeWidth="2" /><rect x="-6" y="-18" width="12" height="12" rx="3" fill={STEEL} /></g></Frame>,
  rinse: () => <Frame kind="bath"><Pom x={120} y={116} s={.9} mood="calm" /><Tub /><Shower x={150} y={14} /><Drops x={120} y={84} n={5} /><Bubbles pts={[[160, 128, 6], [88, 134, 5]]} /><Check x={270} y={60} s={1} /><T x={268} y={92} size={10}>до чиста вода</T></Frame>,
  towel: () => <Frame><Pom x={100} s={.95} mood="calm" /><Towel x={100} y={108} w={96} /><Hand x={266} y={90} /><T x={246} y={150} size={11}>притискай, не търкай</T></Frame>,
  dry: () => <Frame><Pom x={90} pose="stand" mood="calm" /><Dryer x={248} y={86} /><Brush x={190} y={134} rot={-20} /><Check x={46} y={44} s={1.1} /><T x={252} y={156} size={11}>суши до кожата</T></Frame>,
  nailtouch: () => <Frame><Pom x={100} pose="paw" mood="calm" /><Hand x={206} y={96} /><Hand x={290} y={44}><Treat x={-28} y={0} /></Hand></Frame>,
  quick: () => <Frame><g transform="translate(24 28)"><path d="M10 120 Q20 20 90 14 Q100 40 90 120Z" fill="#fff1e6" stroke="#d6a76b" strokeWidth="3" /><path d="M24 120 Q30 60 70 40 Q80 70 78 120Z" fill="#fda4af" /><line x1="2" y1="52" x2="108" y2="40" stroke="#16a34a" strokeWidth="3" strokeDasharray="6 4" /><T x={58} y={140} size={11}>светъл нокът</T></g><g transform="translate(176 28)"><path d="M10 120 Q20 20 90 14 Q100 40 90 120Z" fill="#8b5e3c" stroke="#5b3a21" strokeWidth="3" /><circle cx="64" cy="56" r="6" fill={INK} /><line x1="2" y1="40" x2="108" y2="28" stroke="#16a34a" strokeWidth="3" strokeDasharray="6 4" /><T x={58} y={140} size={11}>тъмен нокът</T></g><T x={80} y={30} size={11} c="#16a34a">реж само върха</T><T x={80} y={58} size={11} c="#be185d">жива част</T></Frame>,
  clip: () => <Frame><Pom x={100} pose="paw" mood="calm" /><Clipper x={198} y={118} rot={-6} /><Hand x={280} y={70}><Treat x={-28} y={0} /></Hand></Frame>,
  bleed: () => <Frame><Pom x={90} pose="paw" mood="worried" /><g transform="translate(210 120)"><rect x="-22" y="-26" width="44" height="52" rx="8" fill="#fff" stroke={PINK} strokeWidth="3" /><text y="6" textAnchor="middle" fontSize="12" fontWeight="800" fill="#be185d">прах</text></g><Phone x={280} y={110} /><T x={214} y={170} size={11}>притискай спокойно</T></Frame>,
  teethtaste: () => <Frame><Pom x={110} mood="happy" /><Hand x={226} y={92} point /><circle cx="205" cy="90" r="5" fill="#fff" stroke="#38bdf8" strokeWidth="2" /><T x={250} y={150} size={11}>първо опитва пастата</T></Frame>,
  teethbrush: () => <Frame><Pom x={110} mood="calm" /><ToothBrush x={168} y={98} rot={-8} /><Check x={260} y={60} s={1.1} /><T x={252} y={96} size={11}>само паста за кучета</T></Frame>,
  eyewipe: () => <Frame><Pom x={140} y={150} s={1.7} mood="calm" /><Cotton x={236} y={94} rot={-6} /><Arrow d="M180 64 Q150 54 124 62" c="#16a34a" /><T x={250} y={50} size={11}>от ъгъла навън</T></Frame>,
  earcheck: () => <Frame><Pom x={140} y={150} s={1.7} mood="calm" /><g transform="translate(250 70)"><circle r="22" fill="#fff" stroke={INK} strokeWidth="3" /><line x1="16" y1="16" x2="32" y2="32" stroke={INK} strokeWidth="5" strokeLinecap="round" /></g><Check x={270} y={150} s={1.1} /><T x={262} y={180} size={11}>розово и чисто</T></Frame>,
  noinsert: () => <Frame><Pom x={120} y={150} s={1.5} mood="calm" /><Cotton x={250} y={80} rot={-20} /><Cross x={278} y={140} s={1.2} /><T x={256} y={178} size={11}>нищо навътре</T></Frame>,
  pawtrim: () => <Frame><Pom x={100} pose="paw" mood="calm" /><Scissors x={206} y={124} rot={-10} /><T x={254} y={150} size={11}>само стърчащото</T></Frame>,
  hygiene: () => <Frame><Pom x={120} pose="stand" mood="calm" /><Scissors x={236} y={116} rot={-20} /><Check x={46} y={44} s={1.1} /><T x={252} y={150} size={11}>леко скъсяване</T></Frame>,
  noshave: () => <Frame><Pom x={120} pose="stand" /><g transform="translate(250 90)"><rect x="-26" y="-10" width="52" height="20" rx="6" fill={STEEL} stroke="#94a3b8" strokeWidth="2" />{[-18, -10, -2, 6, 14].map((a) => <line key={a} x1={a} y1="10" x2={a} y2="18" stroke="#64748b" strokeWidth="2" />)}</g><Cross x={250} y={90} s={2} /><T x={160} y={190} size={12} c="#b91c1c">Не бръснем!</T></Frame>,
  puppytouch: () => <Frame><Pom x={110} y={130} s={.65} /><Hand x={200} y={120} /><Hand x={290} y={60}><Treat x={-28} y={0} /></Hand><Heart x={50} y={50} s={1.3} /></Frame>,
  /* ---- first aid & triage ---- */
  choking: () => <Frame><Pom x={100} mood="worried" /><path d="M64 70 l-14 -10 M64 80 l-18 0" stroke="#dc2626" strokeWidth="4" strokeLinecap="round" /><Phone x={250} y={90} /><T x={250} y={150} size={11}>обади се и тръгвай</T></Frame>,
  heat: () => <Frame><Sun x={50} y={42} /><Pom x={150} mood="sick" pose="down" /><Drops x={230} y={80} n={4} /><T x={240} y={130} size={11}>сянка и хладна вода</T></Frame>,
  puppyweak: () => <Frame><Pom x={120} y={130} s={.65} mood="sick" pose="down" /><Clinic x={250} y={90} /><T x={250} y={150} size={11}>спешно – към ветеринар</T></Frame>,
  poison: () => <Frame><Choco x={60} y={70} /><Grapes x={110} y={66} /><Cross x={88} y={102} s={1} /><Pom x={220} y={116} mood="worried" s={.9} /><Phone x={290} y={80} /></Frame>,
  bleeding: () => <Frame><Pom x={95} pose="paw" mood="worried" /><Towel x={196} y={118} w={50} /><Hand x={250} y={116} /><T x={230} y={166} size={11}>притискай с чиста кърпа</T></Frame>,
  seizure: () => <Frame><Pom x={110} y={120} pose="down" mood="sick" /><Clock x={250} y={56} r={22} label="засичай" /><Cross x={250} y={140} s={.9} /><T x={250} y={176} size={11}>без ръце в устата</T></Frame>,
  honk: () => <Frame><Pom x={110} mood="alert" /><Waves x={168} y={76} /><Bubble x={252} y={44} text="гък-гък" /><Cross x={258} y={120} s={.9} /><T x={258} y={152} size={11}>не нашийник</T></Frame>,
  reverse: () => <Frame><Pom x={110} mood="alert" /><path d="M96 80 l-8 -6 M104 76 l-3 -10 M118 76 l3 -10 M126 80 l8 -6" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" /><T x={250} y={80} size={12}>кратки хъркания</T><Check x={250} y={120} s={1} /></Frame>,
  patella: () => <Frame><Pom x={120} pose="leg" mood="worried" /><Arrow d="M200 110 Q220 90 214 70" c="#f59e0b" /><T x={256} y={60} size={12}>подскача</T></Frame>,
  ateitem: () => <Frame><Choco x={50} y={60} /><Grapes x={96} y={58} /><Pom x={220} y={116} mood="worried" /><Cross x={72} y={104} s={1} /></Frame>,
  teethproblem: () => <Frame><Pom x={110} mood="worried" /><g transform="translate(234 80)"><path d="M-18 -18 Q-20 8 -8 22 Q-4 10 0 6 Q4 10 8 22 Q20 8 18 -18 Q0 -26 -18 -18Z" fill="#fff" stroke={INK} strokeWidth="3" /></g><T x={234} y={140} size={11}>лош дъх, червени венци</T></Frame>,
  hairloss: () => <Frame><Pom x={110} pose="stand" /><ellipse cx="108" cy="140" rx="18" ry="11" fill={SKIN} stroke="#f1b896" strokeWidth="2" /><T x={250} y={90} size={12}>голо място?</T><T x={250} y={112} size={11}>покажи на ветеринаря</T></Frame>,
  fall: () => <Frame><Sofa x={80} y={110} /><Arrow d="M130 70 Q170 90 160 140" c="#f59e0b" /><Pom x={236} y={120} mood="worried" s={.9} /></Frame>,
  eye: () => <Frame><Pom x={140} y={150} s={1.7} mood="worried" /><Cross x={252} y={80} s={1.1} /><T x={252} y={120} size={11}>не търкай окото</T></Frame>,
  /* ---- wiki heroes ---- */
  h_breed: () => scenes.portrait(),
  h_groom: () => scenes.quickbrush(),
  h_health: () => <Frame><Pom x={110} mood="happy" /><Clinic x={250} y={90} /><Heart x={190} y={44} s={1.3} /></Frame>,
  h_food: () => <Frame><Pom x={100} mood="happy" /><Bowl x={236} y={150} /><Heart x={200} y={60} s={1.2} /></Frame>,
  h_behaviour: () => scenes.click(),
  h_daily: () => scenes.loose(),
  h_emergency: () => scenes.poison(),
}

export default function Art({ k, className = '', label }: { k?: string; className?: string; label?: string }) {
  const S = k ? scenes[k] : undefined
  if (!S) return null
  return (
    <div role="img" aria-label={label ?? 'Илюстрация'} className={`overflow-hidden rounded-3xl border-2 border-petal bg-card ${className}`}>
      {S()}
    </div>
  )
}
