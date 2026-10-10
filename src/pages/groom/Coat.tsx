import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../db/db'
import { useCurrentDog } from '../../lib/dog'
import { compressImage, fmtDate, lifeStage } from '../../lib/util'
import { coatStages } from '../../content/groom'
import { Card, Empty, Page, Sheet } from '../../components/ui'

export default function Coat() {
  const dog = useCurrentDog()
  const photos = useLiveQuery(() => db.photos.where('dogId').equals(dog.id).and((p) => p.kind === 'coat').reverse().sortBy('ts'), [dog.id])
  const [adding, setAdding] = useState<string>()
  const [stage, setStage] = useState('full')
  const [a, setA] = useState(0)
  const [b, setB] = useState(1)
  const [pos, setPos] = useState(50)
  const [view, setView] = useState<string>()

  const label = (s?: string) => coatStages.find((c) => c.id === s)?.label ?? ''
  const latest = photos?.[0]
  const showBald = stage === 'thinning' && lifeStage(dog.birth) !== 'puppy'
  const A = photos?.[a]
  const B = photos?.[b]

  return (
    <Page title="Козинка" emoji="🌷" back="/groom">
      <Card className="text-center">
        <p className="text-sm font-bold text-cocoa/70">Сега</p>
        <p className="text-lg font-extrabold text-berry">{latest ? label(latest.stage) : 'Още няма запис'}</p>
        <label className="btn mt-2 cursor-pointer">📸 Месечна снимка
          <input type="file" accept="image/*" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if (f) setAdding(await compressImage(f)) }} />
        </label>
        <p className="mt-2 text-xs text-cocoa/70">Една снимка на месец е достатъчна да видиш как се променя козинката.</p>
      </Card>

      {adding && (
        <Sheet title="Етап на козинката" onClose={() => setAdding(undefined)}>
          <img src={adding} alt="" className="mx-auto max-h-48 rounded-2xl" />
          <select className="input" value={stage} onChange={(e) => setStage(e.target.value)} aria-label="Етап">
            {coatStages.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
          {showBald && (
            <p className="rounded-2xl bg-amber-100 p-3 text-sm font-semibold text-amber-900">
              Спокойно 💗 Голи места при възрастно куче си струва да се покажат на ветеринаря, за да се изключат медицински причини. Това не е диагноза.{' '}
              <Link to="/wiki/hair-loss" className="underline">Прочети повече</Link>
            </p>
          )}
          <button className="btn w-full" onClick={async () => { await db.photos.add({ dogId: dog.id, ts: Date.now(), kind: 'coat', photo: adding, stage }); setAdding(undefined) }}>Запази</button>
        </Sheet>
      )}

      {photos && photos.length >= 2 && A && B && (
        <Card className="space-y-2">
          <h2 className="font-extrabold text-berry">Сравнение</h2>
          <div className="flex gap-2">
            <select className="input" value={a} onChange={(e) => setA(Number(e.target.value))} aria-label="Първа снимка">{photos.map((p, k) => <option key={p.id} value={k}>{fmtDate(p.ts)}</option>)}</select>
            <select className="input" value={b} onChange={(e) => setB(Number(e.target.value))} aria-label="Втора снимка">{photos.map((p, k) => <option key={p.id} value={k}>{fmtDate(p.ts)}</option>)}</select>
          </div>
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-petal">
            <img src={B.photo} alt="" className="absolute inset-0 size-full object-cover" />
            <img src={A.photo} alt="" className="absolute inset-0 size-full object-cover" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }} />
            <div className="absolute inset-y-0 w-1 bg-white shadow" style={{ left: `${pos}%` }} />
          </div>
          <input type="range" min={0} max={100} value={pos} onChange={(e) => setPos(Number(e.target.value))} className="w-full accent-pink" aria-label="Плъзгач за сравнение" />
        </Card>
      )}

      <h2 className="font-extrabold text-berry">Времева линия</h2>
      {photos?.length === 0 && <Card><Empty emoji="📷" text="Още няма снимки – добави първата!" /></Card>}
      <div className="grid grid-cols-2 gap-2">
        {photos?.map((p) => (
          <button key={p.id} className="card !p-1 text-left" onClick={() => setView(`${p.id}`)}>
            <img src={p.photo} alt={`Козинка ${fmtDate(p.ts)}`} className="aspect-square w-full rounded-2xl object-cover" />
            <p className="px-1 pt-1 text-xs font-bold">{fmtDate(p.ts)}</p>
            <p className="px-1 pb-1 text-xs text-cocoa/70">{label(p.stage)}</p>
          </button>
        ))}
      </div>
      {view && photos && (
        <Sheet title="Снимка" onClose={() => setView(undefined)}>
          <img src={photos.find((p) => `${p.id}` === view)?.photo} alt="" className="w-full rounded-2xl" />
          <button className="btn-soft w-full" onClick={async () => { if (confirm('Да изтрия снимката?')) { await db.photos.delete(Number(view)); setView(undefined) } }}>🗑️ Изтрий</button>
        </Sheet>
      )}
    </Page>
  )
}
