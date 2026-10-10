import { Route, Routes } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import { useCurrentDog } from '../lib/dog'
import { useRoutineStatus } from '../lib/routines'
import { fmtDate, relDays } from '../lib/util'
import { coatStages, sessions, tools } from '../content/groom'
import { Card, MenuLink, Page } from '../components/ui'
import Art from '../components/Art'
import Session from './groom/Session'
import Coat from './groom/Coat'
import BodyMap from './groom/BodyMap'
import { Link } from 'react-router-dom'

export default function Groom() {
  return (
    <Routes>
      <Route index element={<Dashboard />} />
      <Route path="session/:id" element={<Session />} />
      <Route path="coat" element={<Coat />} />
      <Route path="body" element={<BodyMap />} />
      <Route path="tools" element={<Tools />} />
    </Routes>
  )
}

function Dashboard() {
  const dog = useCurrentDog()
  const rs = useRoutineStatus(dog.id)
  const info = useLiveQuery(async () => ({
    open: await db.issues.where('dogId').equals(dog.id).filter((i) => !i.resolvedTs).count(),
    coat: (await db.photos.where('dogId').equals(dog.id).and((p) => p.kind === 'coat').reverse().sortBy('ts'))[0],
  }), [dog.id])
  const groomKeys = ['brush', 'bath', 'nails', 'teeth', 'eyes', 'ears', 'paws', 'sanitary']

  return (
    <Page title="Грижа за козинката" emoji="🎀">
      <Card className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-cocoa/70">Етап на козинката</p>
          <p className="font-extrabold text-berry">{info?.coat ? coatStages.find((c) => c.id === info.coat!.stage)?.label : 'Още не е отбелязан'}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-cocoa/70">Отворени проблеми</p>
          <p className="text-2xl font-extrabold text-berry">{info?.open ?? 0}</p>
        </div>
      </Card>

      <Card className="space-y-2">
        <h2 className="font-extrabold text-berry">Започни сесия ✨</h2>
        <div className="grid grid-cols-2 gap-2">
          {sessions.map((s) => (
            <Link key={s.id} to={`/groom/session/${s.id}`} className="btn-soft !flex-col !rounded-3xl !py-3 !text-sm">
              <span className="text-2xl">{s.emoji}</span>{s.title}
            </Link>
          ))}
        </div>
      </Card>

      <MenuLink to="/groom/coat" emoji="🌷" label="Козинка" sub="Месечни снимки и сравнение" />
      <MenuLink to="/groom/body" emoji="🗺️" label="Карта на тялото" sub="Възли, червенини, бучки" />
      <MenuLink to="/groom/tools" emoji="🧰" label="Инструменти" sub="Какво за какво служи" />

      <Card className="!border-amber-300 text-sm">
        <p className="font-extrabold text-berry">🚫 Никога не бръснем Дарси</p>
        <p>Помераните имат двоен слой козина. Бръсненето може да доведе до неравномерно порастване или козината изобщо да не порасне. Подстригването на по-късо ≠ бръснене – питай грууминг салона за „леко оформяне“. <Link className="font-extrabold underline" to="/wiki/never-shave">Повече</Link></p>
      </Card>

      <Card>
        <h2 className="font-extrabold text-berry">Последно / следващо</h2>
        <ul className="mt-1 divide-y-2 divide-petal">
          {rs?.filter((r) => groomKeys.includes(r.key)).map((r) => (
            <li key={r.id} className="flex justify-between py-1.5 text-sm">
              <span className="font-bold">{r.emoji} {r.title}</span>
              <span className="text-right text-cocoa/70">{r.last ? relDays(r.last) : '–'} → {fmtDate(r.next)}</span>
            </li>
          ))}
        </ul>
      </Card>
    </Page>
  )
}

function Tools() {
  return (
    <Page title="Инструменти" emoji="🧰" back="/groom">
      {tools.map((t) => (
        <Card key={t.name} className="space-y-2">
          <Art k={t.art} label={t.name} />
          <p className="font-extrabold text-berry">{t.name}</p>
          <p className="text-sm">{t.what}</p>
          <ul className="list-disc pl-5 text-sm">{t.how.map((h) => <li key={h}>{h}</li>)}</ul>
          <p className="rounded-2xl bg-petal p-2 text-sm font-bold">💡 {t.tip}</p>
        </Card>
      ))}
      <p className="text-xs text-cocoa/70">Без препратки към магазини – избери каквото е удобно за Дарси.</p>
    </Page>
  )
}
