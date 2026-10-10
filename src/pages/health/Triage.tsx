import { useState } from 'react'
import { Link } from 'react-router-dom'
import { db, getKv } from '../../db/db'
import { useCurrentDog } from '../../lib/dog'
import { evaluate, levelInfo, pathExtra, paths, universalFlags, type Path } from '../../content/triage/triage'
import Art from '../../components/Art'
import { Card, Disclaimer, Page } from '../../components/ui'
import type { Contacts } from '../Settings'
import { compressImage } from '../../lib/util'

export default function Triage() {
  const dog = useCurrentDog()
  const [step, setStep] = useState<'flags' | 'pick' | 'q' | 'result'>('flags')
  const [flags, setFlags] = useState<boolean[]>(universalFlags.map(() => false))
  const [path, setPath] = useState<Path>()
  const [answers, setAnswers] = useState<boolean[]>([])
  const [qi, setQi] = useState(0)
  const [phone, setPhone] = useState<string>()
  const [photo, setPhoto] = useState<string>()
  const [saved, setSaved] = useState(false)

  const anyFlag = flags.some(Boolean)
  const level = path ? evaluate(path, answers, anyFlag) : anyFlag ? 'red' : 'green'
  const info = levelInfo[level]

  const showResult = async () => {
    setPhone((await getKv<Contacts>('contacts', {})).vetPhone)
    setStep('result')
  }
  const reset = () => { setStep('flags'); setFlags(universalFlags.map(() => false)); setPath(undefined); setAnswers([]); setQi(0); setSaved(false); setPhoto(undefined) }

  return (
    <Page title="Спешно ли е?" emoji="🚑" back="/health">
      <Disclaimer />
      {step === 'flags' && (
        <Card className="space-y-2">
          <h2 className="font-extrabold text-berry">Първо – има ли нещо от това?</h2>
          {universalFlags.map((f, i) => (
            <label key={f} className="flex min-h-11 items-start gap-3 font-semibold">
              <input type="checkbox" className="mt-1 size-6 shrink-0 accent-red-600" checked={flags[i]} onChange={() => setFlags(flags.map((x, k) => (k === i ? !x : x)))} />
              {f}
            </label>
          ))}
          {anyFlag ? <button className="btn-red w-full" onClick={showResult}>Виж какво да правя</button> : <button className="btn w-full" onClick={() => setStep('pick')}>Нищо от това →</button>}
        </Card>
      )}

      {step === 'pick' && (
        <Card className="space-y-2">
          <h2 className="font-extrabold text-berry">Какво забеляза?</h2>
          {paths.map((p) => (
            <button key={p.id} className="btn-soft w-full !justify-start" onClick={() => { setPath(p); setAnswers([]); setQi(0); setStep('q') }}>{p.emoji} {p.title}</button>
          ))}
        </Card>
      )}

      {step === 'q' && path && (
        <Card className="space-y-3 text-center">
          {pathExtra[path.id] && <Art k={pathExtra[path.id].art} />}
          <p className="text-sm font-bold text-cocoa/70">{path.title} · въпрос {qi + 1}/{path.questions.length}</p>
          <p className="text-lg font-extrabold">{path.questions[qi].q}</p>
          <div className="flex gap-2">
            {[true, false].map((yes) => (
              <button key={String(yes)} className={yes ? 'btn flex-1' : 'btn-soft flex-1'} onClick={() => {
                const a = [...answers, yes]
                setAnswers(a)
                if (qi + 1 >= path.questions.length) showResult()
                else setQi(qi + 1)
              }}>{yes ? 'Да' : 'Не'}</button>
            ))}
          </div>
        </Card>
      )}

      {step === 'result' && (
        <>
          <Card className={`space-y-3 text-center ${level === 'red' ? '!border-red-500' : level === 'orange' ? '!border-orange-400' : '!border-green-500'}`}>
            <div className="text-5xl">{info.emoji}</div>
            <h2 className="text-xl font-extrabold">{info.title}</h2>
            <p>{info.text}</p>
            {path?.advice?.[level] && !anyFlag && <p className="rounded-2xl bg-petal p-3 text-left text-sm">{path.advice[level]}</p>}
            {anyFlag && <p className="rounded-2xl bg-petal p-3 text-left text-sm">Не предизвиквай повръщане и не давай лекарства вкъщи. Тръгвай и се обади по пътя.</p>}
            {path && pathExtra[path.id] && !anyFlag && (
              <div className="rounded-2xl bg-petal p-3 text-left text-sm"><p className="font-extrabold">👀 Наблюдавай и се върни, ако:</p><ul className="list-disc pl-5">{pathExtra[path.id].watch.map((w) => <li key={w}>{w}</li>)}</ul></div>
            )}
            {level !== 'green' && (phone
              ? <a className="btn-red w-full" href={`tel:${phone}`}>📞 Обади се на моя ветеринар</a>
              : <Link className="btn-soft w-full" to="/settings">Добави телефон на ветеринар в Настройки</Link>)}
            {level === 'red' && <Link className="btn-red w-full" to="/health/emergency">🚨 Спешен екран</Link>}
            <p className="text-xs font-semibold">Това не е диагноза – при съмнение се обади на ветеринаря.</p>
            {path && <p className="text-xs text-cocoa/60">Източници: {path.source}</p>}
          </Card>
          <Card className="space-y-2">
            <h2 className="font-extrabold text-berry">Запази за ветеринаря</h2>
            <label className="btn-soft cursor-pointer">{photo ? '✅ Снимка добавена' : '📸 Снимка'}
              <input type="file" accept="image/*" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if (f) setPhoto(await compressImage(f)) }} />
            </label>
            <button className="btn w-full" disabled={saved} onClick={async () => {
              await db.symptoms.add({ dogId: dog.id, ts: Date.now(), title: path?.title ?? 'Тревожен признак', note: `${info.title}${anyFlag ? ' (тревожен признак)' : ''}`, photo, source: 'triage' })
              setSaved(true)
            }}>{saved ? 'Запазено ✓' : 'Запази като симптом'}</button>
          </Card>
          <button className="btn-soft w-full" onClick={reset}>Започни отначало</button>
        </>
      )}
    </Page>
  )
}
