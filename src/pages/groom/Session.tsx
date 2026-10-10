import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { db } from '../../db/db'
import { useCurrentDog } from '../../lib/dog'
import { compressImage } from '../../lib/util'
import { sessions } from '../../content/groom'
import { Card, Page } from '../../components/ui'
import { celebrate } from '../../components/Celebrate'

const moods = ['😌', '😐', '😣']
const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

export default function Session() {
  const { id } = useParams()
  const s = sessions.find((x) => x.id === id)
  const dog = useCurrentDog()
  const nav = useNavigate()
  const [phase, setPhase] = useState<'tools' | 'step' | 'mood' | 'stop' | 'end'>('tools')
  const [i, setI] = useState(0)
  const [checked, setChecked] = useState<string[]>([])
  const [why, setWhy] = useState(false)
  const [moodList, setMoodList] = useState<number[]>([])
  const [total, setTotal] = useState(0)
  const [stepT, setStepT] = useState(0)
  const [note, setNote] = useState('')
  const [photo, setPhoto] = useState<string>()
  const started = useRef(Date.now())

  // timers + screen wake lock
  useEffect(() => {
    if (phase === 'tools' || phase === 'end') return
    const t = setInterval(() => { setTotal(Math.round((Date.now() - started.current) / 1000)); setStepT((x) => x + 1) }, 1000)
    return () => clearInterval(t)
  }, [phase])
  useEffect(() => {
    let lock: WakeLockSentinel | undefined
    navigator.wakeLock?.request('screen').then((l) => (lock = l)).catch(() => {})
    return () => { lock?.release().catch(() => {}) }
  }, [])

  if (!s) return <Page title="Не е намерено" back="/groom"><p>Тази сесия не съществува.</p></Page>
  const step = s.steps[i]
  const stressed = moodList.filter((m) => m === 2).length

  const answer = (m: number) => {
    const list = [...moodList, m]
    setMoodList(list)
    if (list.filter((x) => x === 2).length >= 2) return setPhase('stop')
    next()
  }
  const next = () => {
    setWhy(false)
    setStepT(0)
    if (i + 1 >= s.steps.length) setPhase('end')
    else { setI(i + 1); setPhase('step') }
  }
  const save = async (e: React.MouseEvent, goBody: boolean) => {
    const moodAvg = moodList.length ? moodList.reduce((a, b) => a + b, 0) / moodList.length : 0
    await db.logs.add({ dogId: dog.id, ts: Date.now(), type: s.logType, note: note || undefined, data: { session: s.id, seconds: total, mood: moodAvg } })
    if (photo) await db.photos.add({ dogId: dog.id, ts: Date.now(), kind: 'note', photo, title: s.title })
    celebrate(e.clientX, e.clientY)
    nav(goBody ? '/groom/body' : '/groom')
  }

  return (
    <Page title={s.title} emoji={s.emoji} back="/groom">
      {phase === 'tools' && (
        <Card className="space-y-3">
          <h2 className="font-extrabold text-berry">Приготви:</h2>
          {s.tools.map((t) => (
            <label key={t} className="flex min-h-11 items-center gap-3 font-semibold">
              <input type="checkbox" className="size-6 accent-pink" checked={checked.includes(t)} onChange={() => setChecked(checked.includes(t) ? checked.filter((x) => x !== t) : [...checked, t])} />
              {t}
            </label>
          ))}
          <p className="text-sm text-cocoa/70">Екранът няма да угасва по време на сесията.</p>
          <button className="btn w-full" onClick={() => { started.current = Date.now(); setPhase('step') }}>Започваме! 💗</button>
        </Card>
      )}

      {(phase === 'step' || phase === 'mood') && (
        <>
          <div className="flex justify-between text-sm font-bold"><span>Стъпка {i + 1} от {s.steps.length}</span><span>⏱️ {mmss(total)}</span></div>
          <div className="h-2 overflow-hidden rounded-full bg-petal"><div className="h-full bg-pink transition-all" style={{ width: `${(i / s.steps.length) * 100}%` }} /></div>
          <Card className="space-y-3 text-center">
            <div className="text-6xl" aria-hidden>{step.emoji}</div>
            <h2 className="text-xl font-extrabold text-berry">{step.title}</h2>
            <p className="text-lg leading-snug">{step.text}</p>
            {step.seconds && <p className="text-sm font-bold text-cocoa/70">⏳ {mmss(Math.max(0, step.seconds - stepT))} {stepT >= step.seconds && '– готово!'}</p>}
            <button className="btn-soft w-full" onClick={() => setWhy(!why)} aria-expanded={why}>Защо е важно? {why ? '▲' : '▼'}</button>
            {why && <p className="rounded-2xl bg-petal p-3 text-left text-sm">{step.why}</p>}
          </Card>
          {phase === 'step' ? (
            <button className="btn w-full" onClick={() => setPhase('mood')}>Готово ✓</button>
          ) : (
            <Card className="text-center">
              <p className="font-extrabold">Как се чувства {dog.name}?</p>
              <div className="mt-2 flex justify-center gap-3">
                {moods.map((m, k) => <button key={m} className="btn-soft !size-16 !p-0 text-3xl" aria-label={['Спокойна', 'Така-така', 'Стресирана'][k]} onClick={() => answer(k)}>{m}</button>)}
              </div>
            </Card>
          )}
        </>
      )}

      {phase === 'stop' && (
        <Card className="space-y-3 text-center">
          <div className="text-5xl">🛑</div>
          <h2 className="text-xl font-extrabold text-berry">Нека спрем за днес</h2>
          <p>{dog.name} е била стресирана два пъти. Няма проблем – спирането навреме е добре! Опитай по-късно с по-кратка сесия.</p>
          <Link to="/train/c/coop" className="btn-soft w-full">📚 Урок: Спокойно разчесване</Link>
          <button className="btn w-full" onClick={() => setPhase('end')}>Запази и приключи</button>
        </Card>
      )}

      {phase === 'end' && (
        <Card className="space-y-3">
          <div className="text-center text-5xl">🎉</div>
          <h2 className="text-center text-xl font-extrabold text-berry">Браво, Рени! ⏱️ {mmss(total)}</h2>
          {stressed === 0 && moodList.length > 0 && <p className="text-center">{dog.name} беше спокойна 😌</p>}
          <textarea className="input" rows={2} placeholder="Бележка (по желание)" value={note} onChange={(e) => setNote(e.target.value)} />
          <label className="btn-soft cursor-pointer">{photo ? '✅ Снимката е добавена' : '📸 Добави снимка'}
            <input type="file" accept="image/*" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if (f) setPhoto(await compressImage(f)) }} />
          </label>
          <p className="font-bold">Намери ли възли или проблеми с кожата?</p>
          <div className="flex gap-2">
            <button className="btn flex-1" onClick={(e) => save(e, true)}>Да, към картата</button>
            <button className="btn-ok flex-1" onClick={(e) => save(e, false)}>Не, запази</button>
          </div>
        </Card>
      )}
    </Page>
  )
}
