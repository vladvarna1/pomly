import { useLiveQuery } from 'dexie-react-hooks'
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'
import { db } from '../../db/db'
import { useCurrentDog } from '../../lib/dog'
import { ageText, fmtDate } from '../../lib/util'
import { Page } from '../../components/ui'

export default function Summary() {
  const dog = useCurrentDog()
  const d = useLiveQuery(async () => ({
    vax: await db.vaccines.where('dogId').equals(dog.id).toArray(),
    meds: await db.meds.where('dogId').equals(dog.id).filter((m) => m.active).toArray(),
    visits: (await db.visits.where('dogId').equals(dog.id).sortBy('date')).reverse().slice(0, 5),
    sym: await db.symptoms.where('dogId').equals(dog.id).filter((s) => !s.resolved).toArray(),
    w: await db.weights.where('dogId').equals(dog.id).sortBy('ts'),
  }), [dog.id])
  if (!d) return null
  const h = (t: string) => <h2 className="mt-3 border-b-2 border-petal text-lg font-extrabold text-berry">{t}</h2>
  return (
    <Page title="Резюме за ветеринаря" emoji="📄" back="/health">
      <button className="btn no-print w-full" onClick={() => window.print()}>🖨️ Печат / Запази като PDF</button>
      <div className="card space-y-1 text-sm">
        <h2 className="text-xl font-extrabold">{dog.name}</h2>
        <p>Порода: померан (шпиц) · {dog.sex === 'f' ? 'женско' : 'мъжко'}{dog.neutered ? ', кастрирано' : ''} · {ageText(dog.birth)}</p>
        <p>Цвят: {dog.color || '–'} · Чип: {dog.microchip || '–'}</p>
        <p>Алергии: {dog.allergies || '–'}</p>
        {h('Текущи лекарства')}
        {d.meds.length ? d.meds.map((m) => <p key={m.id}>• {m.name} – {m.dose} {m.schedule && `(${m.schedule})`}</p>) : <p>няма</p>}
        {h('Ваксини и паразити')}
        {d.vax.length ? d.vax.map((v) => <p key={v.id}>• {v.name}: {fmtDate(v.date)}{v.nextDue ? `, следваща ${fmtDate(v.nextDue)}` : ''}</p>) : <p>няма записи</p>}
        {h('Тегло')}
        {d.w.length > 1 && (
          <LineChart width={320} height={140} data={d.w.map((x) => ({ ts: x.ts, kg: x.kg }))}>
            <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="ts" tickFormatter={(t) => fmtDate(t).slice(0, -5)} fontSize={10} /><YAxis domain={['auto', 'auto']} fontSize={10} />
            <Line dataKey="kg" stroke="#be185d" isAnimationActive={false} />
          </LineChart>
        )}
        <p>{d.w.slice(-5).map((x) => `${fmtDate(x.ts)}: ${x.kg} кг`).join(' · ') || 'няма'}</p>
        {h('Последни посещения')}
        {d.visits.length ? d.visits.map((v) => <p key={v.id}>• {fmtDate(v.date)} – {v.reason}{v.diagnosis ? ` (${v.diagnosis})` : ''}</p>) : <p>няма</p>}
        {h('Отворени симптоми')}
        {d.sym.length ? d.sym.map((s) => <p key={s.id}>• {fmtDate(s.ts)} – {s.title}</p>) : <p>няма</p>}
      </div>
    </Page>
  )
}
