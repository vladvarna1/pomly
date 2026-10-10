import { useLiveQuery } from 'dexie-react-hooks'
import { db, getKv } from '../../db/db'
import { useCurrentDog } from '../../lib/dog'
import { ageText } from '../../lib/util'
import { firstAid } from '../../content/firstaid'
import { Card, Disclaimer, Page } from '../../components/ui'
import type { Contacts } from '../Settings'

export default function Emergency() {
  const dog = useCurrentDog()
  const c = useLiveQuery(() => getKv<Contacts>('contacts', {}), [])
  const meds = useLiveQuery(() => db.meds.where('dogId').equals(dog.id).filter((m) => m.active).toArray(), [dog.id])
  const w = useLiveQuery(async () => (await db.weights.where('dogId').equals(dog.id).sortBy('ts')).at(-1), [dog.id])

  const call = (label: string, phone?: string) => phone
    ? <a href={`tel:${phone}`} className="btn-red w-full !min-h-14 !text-lg">📞 {label}: {phone}</a>
    : <div className="btn-soft w-full !min-h-14 opacity-70">{label} – добави в Настройки</div>

  return (
    <Page title="Спешно!" emoji="🚨" back="/health">
      <div className="space-y-2">
        {call(c?.vet ? `Моят ветеринар (${c.vet})` : 'Моят ветеринар', c?.vetPhone)}
        {call(c?.emVet ? `Спешен ветеринар (${c.emVet})` : 'Спешен ветеринар', c?.emVetPhone)}
      </div>
      <Card className="text-sm">
        <h2 className="font-extrabold text-berry">🐶 {dog.name}</h2>
        <p>Възраст: {ageText(dog.birth) || '–'}</p>
        <p>Тегло: {w ? `${w.kg} кг` : '–'}</p>
        <p>Чип: {dog.microchip || '–'}</p>
        <p>Алергии: {dog.allergies || '–'}</p>
        <p>Лекарства: {meds?.length ? meds.map((m) => m.name).join(', ') : '–'}</p>
      </Card>
      <h2 className="font-extrabold text-berry">Първа помощ</h2>
      {firstAid.map((a) => (
        <details key={a.id} className="card !p-3">
          <summary className="cursor-pointer text-lg font-extrabold">{a.emoji} {a.title}</summary>
          <div className="mt-2 space-y-2 text-sm">
            <div><p className="font-extrabold text-green-700">✅ Направи</p><ul className="list-disc pl-5">{a.do.map((x) => <li key={x}>{x}</li>)}</ul></div>
            <div><p className="font-extrabold text-red-700">⛔ Не прави</p><ul className="list-disc pl-5">{a.dont.map((x) => <li key={x}>{x}</li>)}</ul></div>
            <p className="font-bold">🏥 Към ветеринар: {a.vet}</p>
          </div>
        </details>
      ))}
      <p className="text-xs text-cocoa/70">Източници: VCA Animal Hospitals, Merck Veterinary Manual, ASPCA. Работи и без интернет.</p>
      <Disclaimer />
    </Page>
  )
}
