import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, type Issue } from '../../db/db'
import { useCurrentDog } from '../../lib/dog'
import { compressImage, fmtDate } from '../../lib/util'
import { bodyAreas, issueKinds } from '../../content/groom'
import { Card, Empty, Field, Page, Sheet } from '../../components/ui'

// tappable spots on the side view / belly view (viewBox 300x200)
const side: Record<string, [number, number]> = { ears: [92, 38], face: [58, 78], neck: [112, 80], chest: [105, 120], armpit: [135, 135], back: [185, 70], pants: [235, 115], tail: [262, 62], paws: [120, 178] }
const belly: Record<string, [number, number]> = { belly: [150, 100], armpit: [100, 80], pants: [205, 100], paws: [60, 150] }

function Dogsvg({ spots, issues, onPick, belly: isBelly }: { spots: Record<string, [number, number]>; issues: Issue[]; onPick: (a: string) => void; belly?: boolean }) {
  return (
    <svg viewBox="0 0 300 200" className="w-full" role="group" aria-label={isBelly ? 'Коремче' : 'Отстрани'}>
      {isBelly ? (
        <>
          <ellipse cx="150" cy="100" rx="95" ry="60" fill="#fbbf77" />
          <circle cx="62" cy="75" r="30" fill="#f59e4b" />
          <ellipse cx="150" cy="105" rx="50" ry="35" fill="#fff4e0" />
          {[[75, 150], [115, 160], [190, 160], [230, 150]].map(([x, y]) => <ellipse key={x} cx={x} cy={y} rx="15" ry="12" fill="#f59e4b" />)}
        </>
      ) : (
        <>
          <ellipse cx="170" cy="105" rx="95" ry="55" fill="#fbbf77" />
          <circle cx="75" cy="78" r="38" fill="#f59e4b" />
          <path d="M60 52 L55 18 L88 42 Z M100 50 L120 18 L118 56 Z" fill="#f59e4b" stroke="#fbbf77" strokeWidth="6" strokeLinejoin="round" />
          <circle cx="58" cy="76" r="4" fill="#3b2a2f" /><ellipse cx="42" cy="90" rx="6" ry="4" fill="#3b2a2f" />
          <path d="M255 85 Q290 40 270 25 Q245 45 250 85 Z" fill="#fbbf77" />
          {[[115, 165], [150, 168], [215, 165], [245, 160]].map(([x, y]) => <rect key={x} x={x - 9} y={y - 20} width="18" height="34" rx="9" fill="#f59e4b" />)}
        </>
      )}
      {Object.entries(spots).map(([a, [x, y]]) => {
        const n = issues.filter((i) => i.area === a && !i.resolvedTs).length
        return (
          <g key={a} onClick={() => onPick(a)} role="button" tabIndex={0} aria-label={bodyAreas.find((b) => b.id === a)?.label} onKeyDown={(e) => e.key === 'Enter' && onPick(a)} style={{ cursor: 'pointer' }}>
            <circle cx={x} cy={y} r="17" fill={n ? '#ec4899' : '#fff'} fillOpacity={n ? 0.9 : 0.55} stroke="#ec4899" strokeWidth="2" strokeDasharray={n ? '' : '4'} />
            <text x={x} y={y + 5} textAnchor="middle" fontSize="14" fontWeight="800" fill={n ? '#fff' : '#be185d'}>{n || '+'}</text>
          </g>
        )
      })}
    </svg>
  )
}

export default function BodyMap() {
  const dog = useCurrentDog()
  const nav = useNavigate()
  const issues = useLiveQuery(() => db.issues.where('dogId').equals(dog.id).toArray(), [dog.id])
  const [area, setArea] = useState<string>()
  const [kind, setKind] = useState(issueKinds[0])
  const [sev, setSev] = useState(1)
  const [note, setNote] = useState('')
  const [photo, setPhoto] = useState<string>()
  if (!issues) return null

  const areaLabel = (a: string) => bodyAreas.find((b) => b.id === a)?.label ?? a
  const inArea = issues.filter((i) => i.area === area).sort((a, b) => b.ts - a.ts)

  const add = async () => {
    await db.issues.add({ dogId: dog.id, ts: Date.now(), area: area!, kind, severity: sev, note: note || undefined, photo })
    setNote(''); setPhoto(undefined)
  }
  const toSymptom = async (i: Issue) => {
    await db.symptoms.add({ dogId: dog.id, ts: Date.now(), title: `${i.kind} – ${areaLabel(i.area)}`, note: i.note, photo: i.photo, source: 'bodymap' })
    nav('/health/symptoms')
  }

  return (
    <Page title="Карта на тялото" emoji="🗺️" back="/groom">
      <Card className="space-y-2">
        <p className="text-sm font-semibold">Докосни място, за да добавиш или видиш бележка. Розовите точки са отворени проблеми.</p>
        <Dogsvg spots={side} issues={issues} onPick={setArea} />
        <Dogsvg spots={belly} issues={issues} onPick={setArea} belly />
      </Card>
      {issues.filter((i) => !i.resolvedTs).length === 0 && <Card><Empty emoji="✨" text="Няма отворени проблеми – чудесно!" /></Card>}

      {area && (
        <Sheet title={areaLabel(area)} onClose={() => setArea(undefined)}>
          {inArea.map((i) => (
            <div key={i.id} className={`rounded-2xl border-2 p-2 text-sm ${i.resolvedTs ? 'border-mint opacity-70' : 'border-rose'}`}>
              <p className="font-extrabold">{i.kind} · тежест {i.severity}/3 · {fmtDate(i.ts)}</p>
              {i.note && <p>{i.note}</p>}
              {i.photo && <img src={i.photo} alt="" className="mt-1 max-h-32 rounded-xl" />}
              <div className="mt-1 flex flex-wrap gap-2">
                {!i.resolvedTs ? <button className="btn-ok !min-h-9 !text-xs" onClick={() => db.issues.update(i.id!, { resolvedTs: Date.now() })}>✓ Решен</button> : <span className="chip chip-ok">решен {fmtDate(i.resolvedTs)}</span>}
                <button className="btn-soft !min-h-9 !text-xs" onClick={() => toSymptom(i)}>→ Към симптом</button>
              </div>
            </div>
          ))}
          <h3 className="font-extrabold text-berry">Нова бележка</h3>
          <select className="input" value={kind} onChange={(e) => setKind(e.target.value)} aria-label="Вид">{issueKinds.map((k) => <option key={k}>{k}</option>)}</select>
          <Field label="Тежест">
            <div className="flex gap-2">{[1, 2, 3].map((n) => <button key={n} className={sev === n ? 'btn flex-1' : 'btn-soft flex-1'} onClick={() => setSev(n)}>{['Лека', 'Средна', 'Силна'][n - 1]}</button>)}</div>
          </Field>
          <input className="input" placeholder="Бележка" value={note} onChange={(e) => setNote(e.target.value)} />
          <label className="btn-soft cursor-pointer">{photo ? '✅ Снимка добавена' : '📸 Снимка'}
            <input type="file" accept="image/*" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if (f) setPhoto(await compressImage(f)) }} />
          </label>
          <button className="btn w-full" onClick={add}>Добави</button>
        </Sheet>
      )}
    </Page>
  )
}
