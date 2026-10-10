import { useEffect, useState } from 'react'
import { Link, Route, Routes, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, getKv, setKv } from '../db/db'
import { useCurrentDog } from '../lib/dog'
import { beep } from '../lib/util'
import { courses } from '../content/training'
import { Card, Disclaimer, Empty, MenuLink, Page } from '../components/ui'
import { celebrate } from '../components/Celebrate'

export default function Train() {
  return (
    <Routes>
      <Route index element={<Home />} />
      <Route path="c/:cid" element={<CoursePage />} />
      <Route path="l/:cid/:lid" element={<LessonPage />} />
      <Route path="clicker" element={<Clicker />} />
      <Route path="potty" element={<Potty />} />
      <Route path="barks" element={<Barks />} />
    </Routes>
  )
}

const useMastered = (dogId: number) => useLiveQuery(() => getKv<string[]>(`mastered:${dogId}`, []), [dogId]) ?? []

function Home() {
  const dog = useCurrentDog()
  const m = useMastered(dog.id)
  return (
    <Page title="Учим се" emoji="🦴">
      <p className="font-semibold">Само с позитивно подкрепяне: лакомства, похвали и търпение 💗</p>
      <Link to="/train/clicker" className="btn w-full !min-h-14 !text-lg">🔔 Кликер</Link>
      <div className="grid grid-cols-2 gap-2">
        <Link to="/train/potty" className="btn-soft !flex-col !rounded-3xl !py-3">🚽 Дневник тоалетна</Link>
        <Link to="/train/barks" className="btn-soft !flex-col !rounded-3xl !py-3">📣 Дневник лаене</Link>
      </div>
      <h2 className="font-extrabold text-berry">Курсове</h2>
      {courses.map((c) => (
        <MenuLink key={c.id} to={`/train/c/${c.id}`} emoji={c.emoji} label={c.title} sub={`${c.lessons.filter((l) => m.includes(`${c.id}/${l.id}`)).length}/${c.lessons.length} усвоени · ${c.blurb}`} />
      ))}
    </Page>
  )
}

function CoursePage() {
  const { cid } = useParams()
  const dog = useCurrentDog()
  const m = useMastered(dog.id)
  const c = courses.find((x) => x.id === cid)
  if (!c) return <Page title="Не е намерено" back="/train"><p>Няма такъв курс.</p></Page>
  return (
    <Page title={c.title} emoji={c.emoji} back="/train">
      {c.lessons.map((l, i) => (
        <MenuLink key={l.id} to={`/train/l/${c.id}/${l.id}`} emoji={m.includes(`${c.id}/${l.id}`) ? '🌟' : `${i + 1}️⃣`} label={l.title} sub={l.goal} />
      ))}
    </Page>
  )
}

function LessonPage() {
  const { cid, lid } = useParams()
  const dog = useCurrentDog()
  const c = courses.find((x) => x.id === cid)
  const l = c?.lessons.find((x) => x.id === lid)
  const m = useMastered(dog.id)
  const past = useLiveQuery(() => db.progress.where('dogId').equals(dog.id).and((p) => p.lessonId === `${cid}/${lid}`).sortBy('ts'), [dog.id, cid, lid]) ?? []
  const [ok, setOk] = useState(0)
  const [fail, setFail] = useState(0)
  const [t0, setT0] = useState(0)
  const [sec, setSec] = useState(0)
  const [practice, setPractice] = useState(false)

  useEffect(() => {
    if (!t0) return
    const i = setInterval(() => setSec(Math.round((Date.now() - t0) / 1000)), 1000)
    return () => clearInterval(i)
  }, [t0])

  if (!c || !l) return <Page title="Не е намерено" back="/train"><p>Няма такъв урок.</p></Page>
  const id = `${c.id}/${l.id}`
  const mastered = m.includes(id)
  const rate = (a: number, b: number) => (a + b ? a / (a + b) : 0)
  const total = ok + fail
  const last2 = [...past.slice(-1), { ok, fail }].filter((p) => p.ok + p.fail > 0)
  const ready = last2.length >= 2 && last2.every((p) => rate(p.ok, p.fail) >= 0.8)
  const tap = (good: boolean, e: React.MouseEvent) => {
    if (!t0) setT0(Date.now())
    if (good) { setOk(ok + 1); beep(1400, 50, 0.3); if ((ok + 1) % 5 === 0) celebrate(e.clientX, e.clientY) } else setFail(fail + 1)
  }

  return (
    <Page title={l.title} emoji="📚" back={`/train/c/${c.id}`}>
      <Card className="space-y-2 text-sm">
        <p><b>🎯 Цел:</b> {l.goal}</p>
        <p><b>🐾 Защо за помераните:</b> {l.why}</p>
        <b>Стъпки:</b>
        <ol className="list-decimal pl-5">{l.steps.map((s) => <li key={s}>{s}</li>)}</ol>
        <b>Чести грешки:</b>
        <ul className="list-disc pl-5">{l.mistakes.map((s) => <li key={s}>{s}</li>)}</ul>
        <p><b>Ако не се получава:</b> {l.fix}</p>
      </Card>

      {!practice ? <button className="btn w-full" onClick={() => setPractice(true)}>▶️ Практика</button> : (
        <Card className="space-y-3 text-center">
          <p className="font-bold">⏱️ {sec}s · {ok}✓ {fail}✗ {total > 0 && `· ${Math.round(rate(ok, fail) * 100)}%`}</p>
          <div className="flex gap-2">
            <button className="btn-ok !min-h-20 flex-1 !text-3xl" aria-label="Успех" onClick={(e) => tap(true, e)}>✓</button>
            <button className="btn-soft !min-h-20 flex-1 !text-3xl" aria-label="Неуспех" onClick={(e) => tap(false, e)}>✗</button>
          </div>
          {ready && <p className="rounded-2xl bg-mint p-2 text-sm font-bold text-mint-dark">Над 80% в две поредни сесии – време е за следващия урок! 🎉</p>}
          <button className="btn w-full" disabled={!total} onClick={async () => {
            await db.progress.add({ dogId: dog.id, lessonId: id, ts: Date.now(), ok, fail, seconds: sec })
            setOk(0); setFail(0); setT0(0); setSec(0); setPractice(false)
          }}>Запази сесията</button>
        </Card>
      )}

      {past.length > 0 && (
        <Card className="text-sm">
          <b>Предишни сесии</b>
          {past.slice(-5).map((p) => <p key={p.id}>{new Date(p.ts).toLocaleDateString('bg-BG')}: {Math.round(rate(p.ok, p.fail) * 100)}% ({p.ok}/{p.ok + p.fail})</p>)}
        </Card>
      )}
      <button className={mastered ? 'btn-soft w-full' : 'btn-ok w-full'} onClick={(e) => {
        setKv(`mastered:${dog.id}`, mastered ? m.filter((x) => x !== id) : [...m, id])
        if (!mastered) celebrate(e.clientX, e.clientY)
      }}>{mastered ? '🌟 Усвоено (премахни)' : 'Отбележи като усвоено'}</button>
      <Disclaimer />
    </Page>
  )
}

function Clicker() {
  const [n, setN] = useState(0)
  return (
    <Page title="Кликер" emoji="🔔" back="/train">
      <p className="text-center font-semibold">Натисни в момента на правилното поведение, после веднага лакомство.</p>
      <button className="mx-auto grid size-64 place-items-center rounded-full bg-pink text-6xl text-white shadow-xl shadow-pink/40 active:scale-95" aria-label="Кликер" onClick={() => { beep(2200, 40, 0.4); setN(n + 1) }}>🐾</button>
      <p className="text-center text-sm font-bold">Кликове: {n} <button className="underline" onClick={() => setN(0)}>нулирай</button></p>
    </Page>
  )
}

function Potty() {
  const dog = useCurrentDog()
  const logs = useLiveQuery(() => db.logs.where('dogId').equals(dog.id).and((l) => l.type === 'potty').toArray(), [dog.id])
  const add = (where: string) => db.logs.add({ dogId: dog.id, ts: Date.now(), type: 'potty', data: { where } })
  const buckets = Array.from({ length: 8 }, (_, i) => ({ from: i * 3, ok: 0, acc: 0 }))
  logs?.forEach((l) => {
    const b = buckets[Math.floor(new Date(l.ts).getHours() / 3)]
    if (l.data?.where === 'accident') b.acc++; else b.ok++
  })
  const max = Math.max(1, ...buckets.map((b) => b.ok + b.acc))
  return (
    <Page title="Дневник: тоалетна" emoji="🚽" back="/train">
      <div className="grid grid-cols-3 gap-2">
        <button className="btn-ok" onClick={() => add('out')}>🌳 Навън</button>
        <button className="btn-soft" onClick={() => add('pad')}>📄 Подложка</button>
        <button className="btn-soft" onClick={() => add('accident')}>💦 Инцидент</button>
      </div>
      <Card>
        <h2 className="font-extrabold text-berry">По часове</h2>
        {!logs?.length ? <Empty emoji="🚽" text="Още няма записи" /> : buckets.map((b) => (
          <div key={b.from} className="flex items-center gap-2 py-0.5 text-xs font-bold">
            <span className="w-14">{String(b.from).padStart(2, '0')}–{String(b.from + 3).padStart(2, '0')}ч</span>
            <div className="flex h-4 flex-1 overflow-hidden rounded-full bg-petal">
              <div className="bg-mint-dark" style={{ width: `${(b.ok / max) * 100}%` }} />
              <div className="bg-red-400" style={{ width: `${(b.acc / max) * 100}%` }} />
            </div>
            <span className="w-6 text-right">{b.ok + b.acc}</span>
          </div>
        ))}
        <p className="mt-1 text-xs text-cocoa/70">Зелено – правилно, червено – инциденти. Виж кога са излизанията, за да ги планираш.</p>
      </Card>
    </Page>
  )
}

const barkTypes = ['Алармен', 'За внимание', 'Скука', 'Страх', 'Възбуда']
function Barks() {
  const dog = useCurrentDog()
  const logs = useLiveQuery(() => db.logs.where('dogId').equals(dog.id).and((l) => l.type === 'bark').reverse().sortBy('ts'), [dog.id])
  const count = (t: string) => logs?.filter((l) => l.data?.kind === t).length ?? 0
  return (
    <Page title="Дневник: лаене" emoji="📣" back="/train">
      <div className="grid grid-cols-2 gap-2">
        {barkTypes.map((t) => <button key={t} className="btn-soft" onClick={() => db.logs.add({ dogId: dog.id, ts: Date.now(), type: 'bark', data: { kind: t } })}>{t}</button>)}
      </div>
      <Card>
        <h2 className="font-extrabold text-berry">Обобщение</h2>
        {!logs?.length ? <Empty emoji="📣" text="Още няма записи" /> : barkTypes.map((t) => <p key={t} className="flex justify-between text-sm font-bold"><span>{t}</span><span>{count(t)}</span></p>)}
      </Card>
    </Page>
  )
}
