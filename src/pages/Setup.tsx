import { useState } from 'react'
import { createDog } from '../db/db'
import { compressImage, isoDay } from '../lib/util'
import { Field } from '../components/ui'

export default function Setup({ onDone }: { onDone?: () => void }) {
  const [name, setName] = useState('Дарси')
  const [photo, setPhoto] = useState<string>()
  const [birth, setBirth] = useState('')
  const [months, setMonths] = useState('')
  const [sex, setSex] = useState<'f' | 'm'>('f')
  const [neutered, setNeutered] = useState(false)
  const [color, setColor] = useState('')
  const [kg, setKg] = useState('')

  const save = async () => {
    const b = birth || (Number(months) > 0 ? isoDay(Date.now() - Number(months) * 30.4 * 86400000) : undefined)
    await createDog({ name: name.trim() || 'Дарси', photo, birth: b, sex, neutered, color, weightKg: Number(kg.replace(',', '.')) || undefined })
    onDone?.()
  }

  return (
    <div className="mx-auto min-h-dvh max-w-md space-y-4 p-4">
      <div className="card bg-gradient-to-br from-card to-petal text-center">
        <img src="/icon.svg" alt="" className="floaty mx-auto size-24 rounded-3xl" />
        <h1 className="mt-2 text-2xl font-extrabold text-berry">Здравей, Рени! 💗</h1>
        <p className="font-semibold">Нека запознаем Pomly с Дарси.</p>
      </div>
      <div className="card space-y-3">
        <Field label="Как се казва?"><input className="input" value={name} onChange={(e) => setName(e.target.value)} /></Field>
        <Field label="Снимка">
          <label className="btn-soft cursor-pointer">
            {photo ? '✅ Избрана – смени' : '📸 Избери снимка'}
            <input type="file" accept="image/*" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if (f) setPhoto(await compressImage(f, 600)) }} />
          </label>
        </Field>
        <Field label="Рождена дата"><input type="date" className="input" value={birth} max={isoDay(Date.now())} onChange={(e) => setBirth(e.target.value)} /></Field>
        {!birth && <Field label="…или приблизителна възраст (месеци)"><input className="input" inputMode="numeric" value={months} onChange={(e) => setMonths(e.target.value)} placeholder="напр. 30" /></Field>}
        <Field label="Пол">
          <div className="flex gap-2">
            <button className={sex === 'f' ? 'btn' : 'btn-soft'} onClick={() => setSex('f')}>👧 Момиче</button>
            <button className={sex === 'm' ? 'btn' : 'btn-soft'} onClick={() => setSex('m')}>👦 Момче</button>
          </div>
        </Field>
        <Field label="Кастрирана / стерилизирана?">
          <div className="flex gap-2">
            <button className={neutered ? 'btn' : 'btn-soft'} onClick={() => setNeutered(true)}>Да</button>
            <button className={!neutered ? 'btn' : 'btn-soft'} onClick={() => setNeutered(false)}>Не</button>
          </div>
        </Field>
        <Field label="Цвят"><input className="input" value={color} onChange={(e) => setColor(e.target.value)} placeholder="напр. оранжева" /></Field>
        <Field label="Тегло сега (кг)"><input className="input" inputMode="decimal" value={kg} onChange={(e) => setKg(e.target.value)} placeholder="напр. 2,6" /></Field>
        <button className="btn w-full" onClick={save}>Започваме! 🐾</button>
      </div>
      <p className="text-center text-xs text-cocoa/70">Всичко се пази само в този телефон. Рутината за грижа се съставя според възрастта и можеш да я промениш.</p>
    </div>
  )
}
