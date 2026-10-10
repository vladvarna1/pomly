import { useState, type ReactNode } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../db/db'
import { useCurrentDog } from '../../lib/dog'
import { DAY, compressImage, fmtDate, isoDay, isoToTs, startOfDay } from '../../lib/util'
import { Card, Disclaimer, Empty, Field, Page, Sheet } from '../../components/ui'
import { celebrate } from '../../components/Celebrate'

const PhotoBtn = ({ photo, onPick, label = '📸 Снимка' }: { photo?: string; onPick: (p: string) => void; label?: string }) => (
  <label className="btn-soft cursor-pointer">{photo ? '✅ Добавена' : label}
    <input type="file" accept="image/*" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if (f) onPick(await compressImage(f)) }} />
  </label>
)
const Del = ({ onClick }: { onClick: () => void }) => <button className="text-sm" aria-label="Изтрий" onClick={() => confirm('Да изтрия ли?') && onClick()}>🗑️</button>
const Add = ({ onClick, children }: { onClick: () => void; children: ReactNode }) => <button className="btn w-full" onClick={onClick}>➕ {children}</button>

export function Vaccines() {
  const dog = useCurrentDog()
  const list = useLiveQuery(() => db.vaccines.where('dogId').equals(dog.id).toArray(), [dog.id])
  const [open, setOpen] = useState(false)
  const [f, setF] = useState({ name: '', date: isoDay(Date.now()), next: '', photo: undefined as string | undefined })
  const status = (n?: number) => (!n ? null : n < startOfDay(Date.now()) ? <span className="chip chip-bad">просрочена</span> : n < Date.now() + 30 * DAY ? <span className="chip chip-warn">наближава</span> : <span className="chip chip-ok">наред</span>)
  return (
    <Page title="Ваксини и паразити" emoji="💉" back="/health">
      <p className="text-sm">Тук записваш какво е дал ветеринарят и кога е следващото. Приложението не предписва график.</p>
      <Add onClick={() => setOpen(true)}>Добави</Add>
      {list?.length === 0 && <Card><Empty emoji="💉" text="Още няма записи – добави първата ваксина" /></Card>}
      {list?.sort((a, b) => b.date - a.date).map((v) => (
        <Card key={v.id} className="!p-3 space-y-1">
          <div className="flex justify-between"><b>{v.name}</b><Del onClick={() => db.vaccines.delete(v.id!)} /></div>
          <p className="text-sm">Дадена: {fmtDate(v.date)}</p>
          {v.nextDue && <p className="text-sm">Следваща: {fmtDate(v.nextDue)} {status(v.nextDue)}</p>}
          {v.photo && <img src={v.photo} alt="Сертификат" className="max-h-40 rounded-xl" />}
        </Card>
      ))}
      {open && (
        <Sheet title="Ваксина / паразити" onClose={() => setOpen(false)}>
          <Field label="Какво (напр. ваксина, обезпаразитяване)"><input className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
          <Field label="Дата"><input type="date" className="input" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></Field>
          <Field label="Следваща (по график на ветеринаря)"><input type="date" className="input" value={f.next} onChange={(e) => setF({ ...f, next: e.target.value })} /></Field>
          <PhotoBtn photo={f.photo} onPick={(p) => setF({ ...f, photo: p })} label="📸 Снимка на сертификата" />
          <button className="btn w-full" disabled={!f.name.trim()} onClick={async () => {
            await db.vaccines.add({ dogId: dog.id, name: f.name.trim(), date: isoToTs(f.date), nextDue: f.next ? isoToTs(f.next) : undefined, photo: f.photo })
            setF({ name: '', date: isoDay(Date.now()), next: '', photo: undefined }); setOpen(false)
          }}>Запази</button>
        </Sheet>
      )}
      <Disclaimer />
    </Page>
  )
}

export function Meds() {
  const dog = useCurrentDog()
  const meds = useLiveQuery(() => db.meds.where('dogId').equals(dog.id).toArray(), [dog.id])
  const today = useLiveQuery(() => db.logs.where('dogId').equals(dog.id).and((l) => (l.type === 'med' || l.type === 'medskip') && l.ts >= startOfDay(Date.now())).toArray(), [dog.id])
  const [open, setOpen] = useState(false)
  const [f, setF] = useState({ name: '', purpose: '', dose: '', schedule: '' })
  const state = (id?: number) => today?.find((l) => l.data?.medId === id)
  return (
    <Page title="Лекарства" emoji="💊" back="/health">
      <p className="rounded-2xl bg-amber-100 p-3 text-sm font-bold text-amber-900">⚠️ Никога не давай човешки лекарства без указание от ветеринаря. Приложението не предлага и не изчислява дози – пиши точно това, което ти е казал ветеринарят.</p>
      <Add onClick={() => setOpen(true)}>Добави лекарство</Add>
      {meds?.length === 0 && <Card><Empty emoji="💊" text="Няма добавени лекарства" /></Card>}
      {meds?.map((m) => {
        const st = state(m.id)
        return (
          <Card key={m.id} className="!p-3 space-y-1">
            <div className="flex justify-between"><b>{m.name} {!m.active && <span className="chip chip-warn">спряно</span>}</b><Del onClick={() => db.meds.delete(m.id!)} /></div>
            {m.purpose && <p className="text-sm">За: {m.purpose}</p>}
            {m.dose && <p className="text-sm">Доза (по ветеринаря): <b>{m.dose}</b></p>}
            {m.schedule && <p className="text-sm">Кога: {m.schedule}</p>}
            {m.active && (st ? <span className="chip chip-ok">днес: {st.type === 'med' ? 'дадено ✓' : 'пропуснато'}</span> : (
              <div className="flex gap-2">
                <button className="btn-ok !min-h-9" onClick={(e) => { db.logs.add({ dogId: dog.id, ts: Date.now(), type: 'med', data: { medId: m.id } }); celebrate(e.clientX, e.clientY) }}>✓ Дадено</button>
                <button className="btn-soft !min-h-9" onClick={() => db.logs.add({ dogId: dog.id, ts: Date.now(), type: 'medskip', data: { medId: m.id } })}>Пропуснато</button>
              </div>
            ))}
            <button className="text-xs font-bold underline" onClick={() => db.meds.update(m.id!, { active: !m.active })}>{m.active ? 'Спри' : 'Върни'}</button>
          </Card>
        )
      })}
      {open && (
        <Sheet title="Ново лекарство" onClose={() => setOpen(false)}>
          <Field label="Име"><input className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
          <Field label="За какво"><input className="input" value={f.purpose} onChange={(e) => setF({ ...f, purpose: e.target.value })} /></Field>
          <Field label="Доза – точно както я е написал ветеринарят"><input className="input" value={f.dose} onChange={(e) => setF({ ...f, dose: e.target.value })} /></Field>
          <Field label="Кога / колко често"><input className="input" value={f.schedule} onChange={(e) => setF({ ...f, schedule: e.target.value })} /></Field>
          <button className="btn w-full" disabled={!f.name.trim()} onClick={async () => { await db.meds.add({ dogId: dog.id, ...f, active: true }); setF({ name: '', purpose: '', dose: '', schedule: '' }); setOpen(false) }}>Запази</button>
        </Sheet>
      )}
      <Disclaimer />
    </Page>
  )
}

export function Visits() {
  const dog = useCurrentDog()
  const list = useLiveQuery(() => db.visits.where('dogId').equals(dog.id).reverse().sortBy('date'), [dog.id])
  const [open, setOpen] = useState(false)
  const blank = { date: isoDay(Date.now()), clinic: '', reason: '', diagnosis: '', treatment: '', cost: '', follow: '' }
  const [f, setF] = useState(blank)
  return (
    <Page title="При ветеринаря" emoji="🩺" back="/health">
      <Add onClick={() => setOpen(true)}>Добави посещение</Add>
      {list?.length === 0 && <Card><Empty emoji="🩺" text="Още няма посещения" /></Card>}
      {list?.map((v) => (
        <Card key={v.id} className="!p-3 space-y-0.5 text-sm">
          <div className="flex justify-between"><b>{fmtDate(v.date)} · {v.reason}</b><Del onClick={() => db.visits.delete(v.id!)} /></div>
          {v.clinic && <p>🏥 {v.clinic}</p>}
          {v.diagnosis && <p>Диагноза: {v.diagnosis}</p>}
          {v.treatment && <p>Лечение: {v.treatment}</p>}
          {v.cost && <p>Цена: {v.cost}</p>}
          {v.followUp && <p>Контролен: <b>{fmtDate(v.followUp)}</b></p>}
        </Card>
      ))}
      {open && (
        <Sheet title="Посещение" onClose={() => setOpen(false)}>
          <Field label="Дата"><input type="date" className="input" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></Field>
          <Field label="Клиника"><input className="input" value={f.clinic} onChange={(e) => setF({ ...f, clinic: e.target.value })} /></Field>
          <Field label="Причина"><input className="input" value={f.reason} onChange={(e) => setF({ ...f, reason: e.target.value })} /></Field>
          <Field label="Диагноза"><input className="input" value={f.diagnosis} onChange={(e) => setF({ ...f, diagnosis: e.target.value })} /></Field>
          <Field label="Лечение"><input className="input" value={f.treatment} onChange={(e) => setF({ ...f, treatment: e.target.value })} /></Field>
          <Field label="Цена"><input className="input" value={f.cost} onChange={(e) => setF({ ...f, cost: e.target.value })} /></Field>
          <Field label="Контролен преглед"><input type="date" className="input" value={f.follow} onChange={(e) => setF({ ...f, follow: e.target.value })} /></Field>
          <button className="btn w-full" disabled={!f.reason.trim()} onClick={async () => {
            await db.visits.add({ dogId: dog.id, date: isoToTs(f.date), clinic: f.clinic, reason: f.reason, diagnosis: f.diagnosis, treatment: f.treatment, cost: f.cost, followUp: f.follow ? isoToTs(f.follow) : undefined })
            setF(blank); setOpen(false)
          }}>Запази</button>
        </Sheet>
      )}
    </Page>
  )
}

export function Docs() {
  const dog = useCurrentDog()
  const list = useLiveQuery(() => db.photos.where('dogId').equals(dog.id).and((p) => p.kind === 'doc').reverse().sortBy('ts'), [dog.id])
  const [title, setTitle] = useState('')
  const [photo, setPhoto] = useState<string>()
  return (
    <Page title="Документи" emoji="📁" back="/health">
      <Card className="space-y-2">
        <input className="input" placeholder="Заглавие (напр. Паспорт, изследване)" value={title} onChange={(e) => setTitle(e.target.value)} />
        <PhotoBtn photo={photo} onPick={setPhoto} label="📸 Снимай документ" />
        <button className="btn w-full" disabled={!photo} onClick={async () => { await db.photos.add({ dogId: dog.id, ts: Date.now(), kind: 'doc', photo: photo!, title: title || 'Документ' }); setPhoto(undefined); setTitle('') }}>Запази</button>
      </Card>
      {list?.length === 0 && <Card><Empty emoji="📁" text="Още няма документи" /></Card>}
      <div className="grid grid-cols-2 gap-2">
        {list?.map((d) => (
          <Card key={d.id} className="!p-1"><img src={d.photo} alt={d.title} className="aspect-square w-full rounded-2xl object-cover" /><div className="flex justify-between px-1 py-1 text-xs font-bold"><span>{d.title}</span><Del onClick={() => db.photos.delete(d.id!)} /></div></Card>
        ))}
      </div>
    </Page>
  )
}

export function Symptoms() {
  const dog = useCurrentDog()
  const list = useLiveQuery(() => db.symptoms.where('dogId').equals(dog.id).reverse().sortBy('ts'), [dog.id])
  const [t, setT] = useState('')
  const [photo, setPhoto] = useState<string>()
  return (
    <Page title="Симптоми" emoji="🤒" back="/health">
      <Card className="space-y-2">
        <input className="input" placeholder="Какво забеляза?" value={t} onChange={(e) => setT(e.target.value)} />
        <PhotoBtn photo={photo} onPick={setPhoto} label="📸 Снимка за ветеринаря" />
        <button className="btn w-full" disabled={!t.trim()} onClick={async () => { await db.symptoms.add({ dogId: dog.id, ts: Date.now(), title: t.trim(), photo }); setT(''); setPhoto(undefined) }}>Запази</button>
      </Card>
      {list?.length === 0 && <Card><Empty emoji="🌷" text="Няма записани симптоми – чудесно!" /></Card>}
      {list?.map((s) => (
        <Card key={s.id} className={`!p-3 space-y-1 text-sm ${s.resolved ? 'opacity-60' : ''}`}>
          <div className="flex justify-between"><b>{s.title}</b><Del onClick={() => db.symptoms.delete(s.id!)} /></div>
          <p>{fmtDate(s.ts)}</p>
          {s.note && <p>{s.note}</p>}
          {s.photo && <img src={s.photo} alt="" className="max-h-40 rounded-xl" />}
          <button className={s.resolved ? 'btn-soft !min-h-9' : 'btn-ok !min-h-9'} onClick={() => db.symptoms.update(s.id!, { resolved: !s.resolved })}>{s.resolved ? 'Върни като отворен' : '✓ Отзвучал'}</button>
        </Card>
      ))}
      <Disclaimer />
    </Page>
  )
}
