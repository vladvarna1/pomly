import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, getKv, type Dog } from '../db/db'
import { useCurrentDog, useDog } from '../lib/dog'
import { isDue, isOverdue, routineIcs, useRoutineStatus, type RoutineStatus } from '../lib/routines'
import { DAY, ageText, daysAgo, download, endOfDay, fmtDate, relDays, startOfDay } from '../lib/util'
import { tips } from '../content/tips'
import { Card, Empty } from '../components/ui'
import { celebrate } from '../components/Celebrate'

const DAYS = ['неделя', 'понеделник', 'вторник', 'сряда', 'четвъртък', 'петък', 'събота']
const MONTHS = ['януари', 'февруари', 'март', 'април', 'май', 'юни', 'юли', 'август', 'септември', 'октомври', 'ноември', 'декември']
const greeting = (h: number) => (h < 5 ? 'Лека нощ' : h < 12 ? 'Добро утро' : h < 18 ? 'Здравей' : 'Добър вечер')

export default function Today() {
  const dog = useCurrentDog()
  const { dogs, setDogId } = useDog()
  const now = new Date()
  const routines = useRoutineStatus(dog.id)
  const [showOver, setShowOver] = useState(false)

  const extra = useLiveQuery(async () => {
    const [vax, visits, symptoms, weights, logs, lastBackup, notif] = await Promise.all([
      db.vaccines.where('dogId').equals(dog.id).toArray(),
      db.visits.where('dogId').equals(dog.id).toArray(),
      db.symptoms.where('dogId').equals(dog.id).toArray(),
      db.weights.where('dogId').equals(dog.id).sortBy('ts'),
      db.logs.where('dogId').equals(dog.id).and((l) => l.type === 'brush' || l.type === 'teeth').toArray(),
      getKv<number>('lastBackup', 0),
      getKv<boolean>('notify', false),
    ])
    return { vax, visits, symptoms, weights, logs, lastBackup, notif }
  }, [dog.id])

  const due = (routines ?? []).filter((r) => isDue(r) && !isOverdue(r))
  const over = (routines ?? []).filter((r) => isOverdue(r))

  useEffect(() => {
    if (!extra?.notif || !routines || sessionStorage.getItem('pomly.notified')) return
    const n = routines.filter((r) => isDue(r)).length
    if (n && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(`Рени, Дарси те чака 💗`, { body: `${n} грижи за днес`, icon: '/icon-192.png' })
      sessionStorage.setItem('pomly.notified', '1')
    }
  }, [extra?.notif, routines])

  const done = async (r: RoutineStatus, e: React.MouseEvent) => {
    if (r.key === 'weight') {
      const v = Number(prompt('Колко кг е Дарси днес?')?.replace(',', '.'))
      if (!v) return
      await db.weights.add({ dogId: dog.id, ts: Date.now(), kg: v })
    } else await db.logs.add({ dogId: dog.id, ts: Date.now(), type: r.key })
    celebrate(e.clientX, e.clientY)
  }
  const snooze = (r: RoutineStatus) => db.routines.update(r.id!, { snoozeUntil: startOfDay(Date.now()) + DAY })
  const skip = (r: RoutineStatus) => db.routines.update(r.id!, { snoozeUntil: Date.now() + r.everyDays * DAY })

  // Health watch
  const warn: string[] = []
  if (extra) {
    const w = extra.weights
    const cur = w.at(-1)
    const old = w.filter((x) => cur && cur.ts - x.ts >= 20 * DAY && cur.ts - x.ts <= 45 * DAY).at(-1)
    if (cur && old && Math.abs(cur.kg - old.kg) / old.kg > 0.1) warn.push(`Теглото се е променило с над 10% за месец (${old.kg} → ${cur.kg} кг). Спомени го на ветеринаря.`)
    const t = extra.logs.filter((l) => l.type === 'teeth').at(-1)
    if (routines?.length && (!t || daysAgo(t.ts) > 7) && routines.some((r) => r.key === 'teeth')) warn.push('Не са мити зъбки от повече от 7 дни.')
    const open = extra.symptoms.filter((s) => !s.resolved).length
    if (open) warn.push(`Имаш ${open} неразрешен${open > 1 ? 'и' : ''} симптом${open > 1 ? 'а' : ''}.`)
  }

  const soon = extra && [
    ...extra.vax.filter((v) => v.nextDue).map((v) => ({ ts: v.nextDue!, label: `💉 ${v.name}` })),
    ...extra.visits.filter((v) => v.followUp).map((v) => ({ ts: v.followUp!, label: `🩺 Контролен преглед – ${v.reason}` })),
  ].filter((x) => x.ts >= startOfDay(Date.now()) && x.ts <= endOfDay(Date.now() + 30 * DAY)).sort((a, b) => a.ts - b.ts)

  const week = Array.from({ length: 7 }, (_, i) => startOfDay(Date.now()) - (6 - i) * DAY)
  const has = (type: string, d: number) => extra?.logs.some((l) => l.type === type && l.ts >= d && l.ts < d + DAY)
  const tip = tips[Math.floor(Date.now() / DAY) % tips.length]
  const backupDue = extra && (Date.now() - extra.lastBackup > 14 * DAY)

  return (
    <section className="space-y-4">
      <Card className="bg-gradient-to-br from-card to-petal text-center">
        {dogs.length > 1 && (
          <select className="input mb-2 !min-h-10" value={dog.id} onChange={(e) => setDogId(Number(e.target.value))} aria-label="Избери куче">
            {dogs.map((d: Dog) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        )}
        {dog.photo
          ? <img src={dog.photo} alt={dog.name} className="floaty mx-auto size-28 rounded-full border-4 border-rose object-cover" />
          : <img src="/icon.svg" alt={dog.name} className="floaty mx-auto size-28 rounded-3xl" />}
        <h1 className="mt-3 text-2xl font-extrabold text-berry">{greeting(now.getHours())}, Рени! 💗</h1>
        <p className="text-sm font-semibold text-cocoa/70">{DAYS[now.getDay()]}, {now.getDate()} {MONTHS[now.getMonth()]}</p>
        <p className="mt-2 font-bold">{dog.name}{dog.birth ? ` · ${ageText(dog.birth)}` : ''} 🐶</p>
      </Card>

      {backupDue && (
        <Link to="/settings" className="card block !border-rose text-sm font-bold">
          💾 Време е за резервно копие – всички данни са само в този телефон.
        </Link>
      )}

      {warn.length > 0 && (
        <Card className="!border-amber-300">
          <h2 className="font-extrabold text-berry">👀 Погледни това</h2>
          <ul className="mt-1 space-y-1 text-sm">{warn.map((w) => <li key={w}>• {w}</li>)}</ul>
        </Card>
      )}

      <div>
        <h2 className="mb-2 font-extrabold text-berry">Днес за {dog.name} ✨</h2>
        {routines && due.length === 0 && (
          <Card><Empty emoji="🎉" text="Всичко за днес е готово! Дарси е най-подредената помераница." /></Card>
        )}
        <div className="space-y-2">
          {due.map((r) => <RoutineCard key={r.id} r={r} dogName={dog.name} onDone={done} onSnooze={snooze} onSkip={skip} />)}
        </div>
      </div>

      {over.length > 0 && (
        <div>
          <button className="btn-soft w-full" onClick={() => setShowOver(!showOver)} aria-expanded={showOver}>
            🌼 Малко закъсняха ({over.length}) {showOver ? '▲' : '▼'}
          </button>
          {showOver && (
            <div className="mt-2 space-y-2">
              {over.map((r) => <RoutineCard key={r.id} r={r} dogName={dog.name} onDone={done} onSnooze={snooze} onSkip={skip} />)}
            </div>
          )}
        </div>
      )}

      <Card>
        <h2 className="font-extrabold text-berry">Серии 🔥</h2>
        {(['teeth', 'brush'] as const).map((k) => (
          <div key={k} className="mt-2 flex items-center justify-between">
            <span className="font-bold">{k === 'teeth' ? '🦷 Зъбки' : '🪮 Четкане'}</span>
            <span className="flex gap-1.5" aria-label="Последните 7 дни">
              {week.map((d) => (
                <span key={d} className={`grid size-6 place-items-center rounded-full text-xs ${has(k, d) ? 'bg-pink text-white' : 'bg-petal'}`}>{has(k, d) ? '✓' : ''}</span>
              ))}
            </span>
          </div>
        ))}
      </Card>

      {soon && soon.length > 0 && (
        <Card>
          <h2 className="font-extrabold text-berry">Наближава 📅</h2>
          <ul className="mt-1 space-y-1 text-sm font-semibold">
            {soon.map((s, i) => <li key={i}>{s.label} – {fmtDate(s.ts)}</li>)}
          </ul>
        </Card>
      )}

      <Card className="bg-petal/60">
        <h2 className="font-extrabold text-berry">💡 Съвет за деня</h2>
        <p className="mt-1 text-sm">{tip.text}</p>
        {tip.slug && <Link to={`/wiki/${tip.slug}`} className="mt-1 inline-block text-sm font-extrabold text-berry underline">Прочети повече</Link>}
      </Card>
    </section>
  )
}

function RoutineCard({ r, dogName, onDone, onSnooze, onSkip }: {
  r: RoutineStatus; dogName: string
  onDone: (r: RoutineStatus, e: React.MouseEvent) => void
  onSnooze: (r: RoutineStatus) => void
  onSkip: (r: RoutineStatus) => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <Card className="!p-3">
      <div className="flex items-center gap-3">
        <span className="text-3xl" aria-hidden>{r.emoji}</span>
        <button className="flex-1 text-left" onClick={() => setOpen(!open)} aria-expanded={open}>
          <span className="block font-extrabold">{r.title}</span>
          <span className="block text-xs text-cocoa/70">{r.last ? `последно ${relDays(r.last)}` : 'още не е отбелязвано'}</span>
        </button>
        <button className="btn-ok !size-12 !p-0 text-xl" aria-label={`Готово: ${r.title}`} onClick={(e) => onDone(r, e)}>✓</button>
      </div>
      {open && (
        <div className="mt-2 space-y-2 border-t-2 border-petal pt-2 text-sm">
          {r.note && <p>{r.note}</p>}
          <div className="flex flex-wrap gap-2">
            <button className="btn-soft !min-h-9 !text-xs" onClick={() => onSnooze(r)}>😴 До утре</button>
            <button className="btn-soft !min-h-9 !text-xs" onClick={() => onSkip(r)}>⏭️ Пропусни</button>
            <button className="btn-soft !min-h-9 !text-xs" onClick={() => download(`${r.key}.ics`, routineIcs(dogName, r), 'text/calendar')}>📅 Към календара</button>
          </div>
        </div>
      )}
    </Card>
  )
}
