import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { CartesianGrid, Line, LineChart, ReferenceArea, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { db } from '../../db/db'
import { useCurrentDog } from '../../lib/dog'
import { DAY, fmtDate } from '../../lib/util'
import { Card, Disclaimer, Empty, Field, Page } from '../../components/ui'

const ranges = [['30 дни', 30], ['6 месеца', 183], ['1 година', 365], ['Всичко', 99999]] as const
// Typical adult Pomeranian range – AKC lists roughly 3–7 lb. VERIFY against AKC/FCI (see CONTENT_TODO.md).
const BAND: [number, number] = [1.4, 3.2]

export default function Weight() {
  const dog = useCurrentDog()
  const [range, setRange] = useState(183)
  const [kg, setKg] = useState('')
  const [bcs, setBcs] = useState('')
  const all = useLiveQuery(() => db.weights.where('dogId').equals(dog.id).sortBy('ts'), [dog.id])
  const data = (all ?? []).filter((w) => w.ts >= Date.now() - range * DAY).map((w) => ({ ts: w.ts, kg: w.kg }))
  const adult = (dog.birth ? Date.now() - new Date(dog.birth).getTime() > 365 * DAY : true)

  return (
    <Page title="Тегло" emoji="⚖️" back="/health">
      <Card className="space-y-2">
        <Field label="Ново претегляне (кг)"><input className="input" inputMode="decimal" value={kg} onChange={(e) => setKg(e.target.value)} placeholder="напр. 2,6" /></Field>
        <Field label="Телесна кондиция (по желание, 1–9; 4–5 е идеално)">
          <select className="input" value={bcs} onChange={(e) => setBcs(e.target.value)}>
            <option value="">–</option>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => <option key={n}>{n}</option>)}
          </select>
        </Field>
        <p className="text-xs text-cocoa/70">Съвет: усети ребрата под козинката – трябва да се опипват лесно, без да са остри.</p>
        <button className="btn w-full" disabled={!Number(kg.replace(',', '.'))} onClick={async () => {
          await db.weights.add({ dogId: dog.id, ts: Date.now(), kg: Number(kg.replace(',', '.')), bcs: Number(bcs) || undefined })
          setKg(''); setBcs('')
        }}>Запази</button>
      </Card>

      <div className="flex flex-wrap gap-2">
        {ranges.map(([l, d]) => <button key={d} className={range === d ? 'btn !min-h-9' : 'btn-soft !min-h-9'} onClick={() => setRange(d)}>{l}</button>)}
      </div>

      <Card>
        {data.length < 1 ? <Empty emoji="⚖️" text="Още няма претегляния – добави първото" /> : (
          <div className="h-60" role="img" aria-label="Графика на теглото">
            <ResponsiveContainer>
              <LineChart data={data} margin={{ left: -15, right: 8, top: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f9a8c4" opacity={0.4} />
                {adult && <ReferenceArea y1={BAND[0]} y2={BAND[1]} fill="#bbf7d0" fillOpacity={0.5} label={{ value: 'норма за породата, не цел', fontSize: 10, fill: '#15803d', position: 'insideTopLeft' }} />}
                <XAxis dataKey="ts" type="number" scale="time" domain={['dataMin', 'dataMax']} tickFormatter={(t) => fmtDate(t).slice(0, -5)} fontSize={11} />
                <YAxis domain={[(m: number) => Math.floor((Math.min(m, adult ? BAND[0] : m) - 0.2) * 10) / 10, (m: number) => Math.ceil((Math.max(m, adult ? BAND[1] : m) + 0.2) * 10) / 10]} fontSize={11} />
                <Tooltip labelFormatter={(t) => fmtDate(Number(t))} formatter={(v) => [`${v} кг`, 'Тегло']} />
                <Line type="monotone" dataKey="kg" stroke="#ec4899" strokeWidth={3} dot={{ r: 4, fill: '#ec4899' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
        <p className="mt-1 text-xs text-cocoa/70">Зеленото е типичен диапазон за възрастна померания (по AKC) – „норма за породата, не цел“. Дарси си е Дарси 💗</p>
      </Card>

      <Card>
        <h2 className="font-extrabold text-berry">История</h2>
        {[...(all ?? [])].reverse().slice(0, 15).map((w) => (
          <div key={w.id} className="flex items-center justify-between border-b border-petal py-1.5 text-sm">
            <span>{fmtDate(w.ts)}</span><b>{w.kg} кг{w.bcs ? ` · BCS ${w.bcs}` : ''}</b>
            <button aria-label="Изтрий" onClick={() => db.weights.delete(w.id!)}>🗑️</button>
          </div>
        ))}
      </Card>
      <Disclaimer />
    </Page>
  )
}
