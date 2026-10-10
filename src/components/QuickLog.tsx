import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import { useCurrentDog } from '../lib/dog'
import { compressImage } from '../lib/util'
import { Field, Sheet } from './ui'
import { shaveWords } from '../content/groom'
import { celebrate } from './Celebrate'

const simple = [
  { type: 'brush', emoji: '🪮', label: 'Четкане' },
  { type: 'bath', emoji: '🛁', label: 'Баня' },
  { type: 'nails', emoji: '💅', label: 'Нокти' },
  { type: 'teeth', emoji: '🦷', label: 'Зъбки' },
  { type: 'eyes', emoji: '👀', label: 'Очи' },
  { type: 'ears', emoji: '👂', label: 'Уши' },
]

type Mode = null | 'menu' | 'weight' | 'symptom' | 'note' | 'med' | 'potty'

export default function QuickLog() {
  const dog = useCurrentDog()
  const nav = useNavigate()
  const [mode, setMode] = useState<Mode>(null)
  const [text, setText] = useState('')
  const [kg, setKg] = useState('')
  const [toast, setToast] = useState('')
  const meds = useLiveQuery(() => db.meds.where('dogId').equals(dog.id).filter((m) => m.active).toArray(), [dog.id])

  const say = (m: string) => {
    setToast(m)
    setMode(null)
    setText('')
    setKg('')
    setTimeout(() => setToast(''), 2200)
  }
  const log = async (type: string, label: string, e?: React.MouseEvent, note?: string, data?: Record<string, unknown>) => {
    await db.logs.add({ dogId: dog.id, ts: Date.now(), type, note, data })
    if (e) celebrate(e.clientX, e.clientY)
    say(`${label} – записано 💗`)
  }

  return (
    <>
      <button
        className="fixed bottom-24 right-[max(1rem,calc(50%-12.5rem))] z-30 grid size-14 place-items-center rounded-full bg-pink text-3xl font-bold text-white shadow-lg shadow-pink/40"
        aria-label="Бърз запис"
        onClick={() => setMode('menu')}
      >
        +
      </button>
      {toast && <div role="status" className="pop fixed inset-x-0 bottom-40 z-50 mx-auto w-fit rounded-full bg-berry px-4 py-2 text-sm font-bold text-white shadow-lg">{toast}</div>}

      {mode === 'menu' && (
        <Sheet title="Бърз запис" onClose={() => setMode(null)}>
          <div className="grid grid-cols-3 gap-2">
            {simple.map((s) => (
              <button key={s.type} className="btn-soft !flex-col !rounded-3xl !py-3" onClick={(e) => log(s.type, s.label, e)}>
                <span className="text-2xl">{s.emoji}</span>{s.label}
              </button>
            ))}
            <button className="btn-soft !flex-col !rounded-3xl !py-3" onClick={() => setMode('weight')}><span className="text-2xl">⚖️</span>Тегло</button>
            <button className="btn-soft !flex-col !rounded-3xl !py-3" onClick={() => setMode('potty')}><span className="text-2xl">🚽</span>Тоалетна</button>
            <button className="btn-soft !flex-col !rounded-3xl !py-3" onClick={() => setMode('symptom')}><span className="text-2xl">🤒</span>Симптом</button>
            <button className="btn-soft !flex-col !rounded-3xl !py-3" onClick={() => setMode('med')}><span className="text-2xl">💊</span>Лекарство</button>
            <button className="btn-soft !flex-col !rounded-3xl !py-3" onClick={() => setMode('note')}><span className="text-2xl">📝</span>Бележка</button>
            <label className="btn-soft !flex-col !rounded-3xl !py-3 cursor-pointer">
              <span className="text-2xl">📸</span>Снимка
              <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                const f = e.target.files?.[0]
                if (!f) return
                await db.photos.add({ dogId: dog.id, ts: Date.now(), kind: 'note', photo: await compressImage(f) })
                say('Снимката е запазена 📸')
              }} />
            </label>
          </div>
          <button className="btn-red w-full" onClick={() => { setMode(null); nav('/health/emergency') }}>🚨 Спешно!</button>
        </Sheet>
      )}

      {mode === 'weight' && (
        <Sheet title="Тегло" onClose={() => setMode(null)}>
          <Field label="Килограми"><input className="input" inputMode="decimal" placeholder="напр. 2,6" value={kg} onChange={(e) => setKg(e.target.value)} autoFocus /></Field>
          <button className="btn w-full" disabled={!Number(kg.replace(',', '.'))} onClick={async () => {
            await db.weights.add({ dogId: dog.id, ts: Date.now(), kg: Number(kg.replace(',', '.')) })
            say('Теглото е записано ⚖️')
          }}>Запази</button>
        </Sheet>
      )}

      {mode === 'potty' && (
        <Sheet title="Тоалетна" onClose={() => setMode(null)}>
          <div className="grid grid-cols-3 gap-2">
            <button className="btn-ok" onClick={(e) => log('potty', 'Навън', e, undefined, { where: 'out' })}>🌳 Навън</button>
            <button className="btn-soft" onClick={() => log('potty', 'Подложка', undefined, undefined, { where: 'pad' })}>📄 Подложка</button>
            <button className="btn-soft" onClick={() => log('potty', 'Инцидент', undefined, undefined, { where: 'accident' })}>💦 Инцидент</button>
          </div>
        </Sheet>
      )}

      {(mode === 'note' || mode === 'symptom') && (
        <Sheet title={mode === 'note' ? 'Бележка' : 'Симптом'} onClose={() => setMode(null)}>
          <Field label={mode === 'note' ? 'Какво искаш да запомниш?' : 'Какво забеляза?'}>
            <textarea className="input" rows={3} value={text} onChange={(e) => setText(e.target.value)} autoFocus />
          </Field>
          {shaveWords.test(text) && <p className="rounded-2xl bg-amber-100 p-2 text-sm font-bold text-amber-900">🚫 Не бръснем помераните – двойната козина може да не порасне. Подстригване ≠ бръснене.</p>}
          <button className="btn w-full" disabled={!text.trim()} onClick={async () => {
            if (mode === 'note') await log('note', 'Бележка', undefined, text.trim())
            else {
              await db.symptoms.add({ dogId: dog.id, ts: Date.now(), title: text.trim(), source: 'quick' })
              say('Симптомът е записан – покажи го на ветеринаря 🩺')
            }
          }}>Запази</button>
          {mode === 'symptom' && <button className="btn-soft w-full" onClick={() => { setMode(null); nav('/health/triage') }}>Спешно ли е? Провери →</button>}
        </Sheet>
      )}

      {mode === 'med' && (
        <Sheet title="Дадено лекарство" onClose={() => setMode(null)}>
          <p className="rounded-2xl bg-amber-100 p-2 text-xs font-bold text-amber-900">Никога не давай човешки лекарства без ветеринар.</p>
          {!meds?.length && <p className="text-sm">Още няма добавени лекарства. Добави ги от Здраве → Лекарства.</p>}
          {meds?.map((m) => (
            <button key={m.id} className="btn-soft w-full" onClick={(e) => log('med', m.name, e, undefined, { medId: m.id })}>💊 {m.name}</button>
          ))}
        </Sheet>
      )}
    </>
  )
}
