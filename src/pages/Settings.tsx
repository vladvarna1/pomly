import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, deleteDog, exportBackup, getKv, importBackup, loadDemo, setKv, wipeAll } from '../db/db'
import { useCurrentDog, useDog } from '../lib/dog'
import { compressImage, download, isoDay, relDays } from '../lib/util'
import { Card, Disclaimer, Field, Page } from '../components/ui'

export interface Contacts { vet?: string; vetPhone?: string; emVet?: string; emVetPhone?: string; groomer?: string; groomerPhone?: string }

export const applyTheme = (t: string) => document.documentElement.classList.toggle('dark', t === 'dark')

export default function Settings() {
  const dog = useCurrentDog()
  const { dogs, setDogId } = useDog()
  const nav = useNavigate()
  const fileRef = useRef<HTMLInputElement>(null)
  const [msg, setMsg] = useState('')
  const s = useLiveQuery(async () => ({
    contacts: await getKv<Contacts>('contacts', {}),
    theme: await getKv<string>('theme', 'light'),
    notify: await getKv<boolean>('notify', false),
    lastBackup: await getKv<number>('lastBackup', 0),
    routines: await db.routines.where('dogId').equals(dog.id).toArray(),
  }), [dog.id])
  const rs = useLiveQuery(() => db.routines.where('dogId').equals(dog.id).toArray(), [dog.id])
  if (!s) return null
  const say = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3000) }
  const setC = (k: keyof Contacts, v: string) => setKv('contacts', { ...s.contacts, [k]: v })

  return (
    <Page title="Настройки" emoji="⚙️" back>
      {msg && <div role="status" className="card !border-pink text-center font-bold">{msg}</div>}

      <Card className="space-y-3">
        <h2 className="font-extrabold text-berry">🐶 Профил на {dog.name}</h2>
        <Field label="Име"><input className="input" value={dog.name} onChange={(e) => db.dogs.update(dog.id, { name: e.target.value })} /></Field>
        <Field label="Рождена дата"><input type="date" className="input" value={dog.birth ?? ''} max={isoDay(Date.now())} onChange={(e) => db.dogs.update(dog.id, { birth: e.target.value })} /></Field>
        <Field label="Цвят"><input className="input" value={dog.color ?? ''} onChange={(e) => db.dogs.update(dog.id, { color: e.target.value })} /></Field>
        <Field label="Чип номер"><input className="input" value={dog.microchip ?? ''} onChange={(e) => db.dogs.update(dog.id, { microchip: e.target.value })} /></Field>
        <Field label="Алергии"><input className="input" value={dog.allergies ?? ''} onChange={(e) => db.dogs.update(dog.id, { allergies: e.target.value })} /></Field>
        <label className="btn-soft cursor-pointer">📸 Смени снимката
          <input type="file" accept="image/*" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if (f) db.dogs.update(dog.id, { photo: await compressImage(f, 600) }) }} />
        </label>
        {dogs.length > 1 && (
          <Field label="Друго куче"><select className="input" value={dog.id} onChange={(e) => setDogId(Number(e.target.value))}>{dogs.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select></Field>
        )}
        <button className="btn-soft w-full" onClick={() => nav('/newdog')}>➕ Добави друго куче</button>
      </Card>

      <Card className="space-y-2">
        <h2 className="font-extrabold text-berry">🌸 Рутина (на колко дни)</h2>
        {rs?.map((r) => (
          <div key={r.id} className="flex items-center justify-between gap-2">
            <span className="font-bold">{r.emoji} {r.title}</span>
            <input className="input !w-20 text-center" inputMode="numeric" aria-label={`Дни за ${r.title}`} value={r.everyDays} onChange={(e) => db.routines.update(r.id!, { everyDays: Math.max(1, Number(e.target.value) || 1) })} />
          </div>
        ))}
        <p className="text-xs text-cocoa/70">Парaзитна профилактика и ваксини следват графика на ветеринаря – добавяш ги в Здраве.</p>
      </Card>

      <Card className="space-y-3">
        <h2 className="font-extrabold text-berry">📞 Контакти</h2>
        {([['vet', 'vetPhone', 'Ветеринар'], ['emVet', 'emVetPhone', 'Спешен ветеринар (денонощен)'], ['groomer', 'groomerPhone', 'Грууминг салон']] as const).map(([n, p, label]) => (
          <div key={n} className="space-y-1">
            <Field label={label}><input className="input" placeholder="Име" defaultValue={s.contacts[n] ?? ''} onBlur={(e) => setC(n, e.target.value)} /></Field>
            <input className="input" type="tel" placeholder="Телефон" aria-label={`Телефон: ${label}`} defaultValue={s.contacts[p] ?? ''} onBlur={(e) => setC(p, e.target.value)} />
          </div>
        ))}
      </Card>

      <Card className="space-y-3">
        <h2 className="font-extrabold text-berry">🎀 Външен вид</h2>
        <div className="flex gap-2">
          <button className={s.theme === 'light' ? 'btn' : 'btn-soft'} onClick={() => { setKv('theme', 'light'); applyTheme('light') }}>☀️ Светъл</button>
          <button className={s.theme === 'dark' ? 'btn' : 'btn-soft'} onClick={() => { setKv('theme', 'dark'); applyTheme('dark') }}>🌙 Тъмен</button>
        </div>
        <button className={s.notify ? 'btn' : 'btn-soft'} onClick={async () => {
          if (!s.notify && 'Notification' in window && (await Notification.requestPermission()) !== 'granted') return say('Известията са блокирани в браузъра.')
          setKv('notify', !s.notify)
        }}>🔔 Напомняне при отваряне: {s.notify ? 'включено' : 'изключено'}</button>
      </Card>

      <Card className="space-y-3">
        <h2 className="font-extrabold text-berry">💾 Резервно копие</h2>
        <p className="text-sm">Последно: {s.lastBackup ? relDays(s.lastBackup) : 'още няма'}. Данните са само в този телефон – правиш копие, за да не се загубят.</p>
        <button className="btn w-full" onClick={async () => { download(`pomly-${isoDay(Date.now())}.json`, await exportBackup(), 'application/json'); say('Копието е свалено 💗') }}>⬇️ Свали копие</button>
        <button className="btn-soft w-full" onClick={() => fileRef.current?.click()}>⬆️ Върни от копие</button>
        <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={async (e) => {
          const f = e.target.files?.[0]
          if (!f) return
          if (!confirm('Това ще замени всички данни в приложението. Сигурна ли си?')) return
          try { await importBackup(await f.text()); say('Върнато успешно 🎉') } catch (err) { say((err as Error).message) }
          e.target.value = ''
        }} />
      </Card>

      <Card className="space-y-3">
        <h2 className="font-extrabold text-berry">🧸 Демо</h2>
        <p className="text-sm">Пълни приложението с примерно куче и 60 дни записи, за да видиш как изглежда.</p>
        <button className="btn-soft w-full" onClick={async () => { const id = await loadDemo(); setDogId(id); say('Демо данните са заредени') }}>Зареди демо данни</button>
        {dogs.some((d) => d.demo) && (
          <button className="btn-soft w-full" onClick={async () => {
            for (const d of dogs.filter((x) => x.demo)) await deleteDog(d.id!)
            localStorage.removeItem('pomly.dog')
            say('Демото е изчистено')
          }}>Изчисти демо данните</button>
        )}
      </Card>

      <Card className="space-y-3">
        <h2 className="font-extrabold text-berry">🗑️ Изтриване</h2>
        <button className="btn-red w-full" onClick={async () => {
          if (!confirm('Да изтрия ВСИЧКО? Това не може да се върне.')) return
          if (prompt('Напиши ИЗТРИЙ, за да потвърдиш') !== 'ИЗТРИЙ') return
          await wipeAll()
          location.href = '/'
        }}>Изтрий всички данни</button>
      </Card>

      <Disclaimer />
      <p className="text-center text-xs text-cocoa/60">Pomly · направено с любов за Дарси 🐾</p>
    </Page>
  )
}
