import { Link, Route, Routes } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import { useCurrentDog } from '../lib/dog'
import { DAY, fmtDate, startOfDay } from '../lib/util'
import { Card, Disclaimer, MenuLink, Page } from '../components/ui'
import Weight from './health/Weight'
import { Docs, Meds, Symptoms, Vaccines, Visits } from './health/Records'
import Triage from './health/Triage'
import Emergency from './health/Emergency'
import Summary from './health/Summary'

export default function Health() {
  return (
    <Routes>
      <Route index element={<Dashboard />} />
      <Route path="weight" element={<Weight />} />
      <Route path="vaccines" element={<Vaccines />} />
      <Route path="meds" element={<Meds />} />
      <Route path="visits" element={<Visits />} />
      <Route path="docs" element={<Docs />} />
      <Route path="symptoms" element={<Symptoms />} />
      <Route path="triage" element={<Triage />} />
      <Route path="emergency" element={<Emergency />} />
      <Route path="summary" element={<Summary />} />
    </Routes>
  )
}

function Dashboard() {
  const dog = useCurrentDog()
  const d = useLiveQuery(async () => {
    const w = await db.weights.where('dogId').equals(dog.id).sortBy('ts')
    const vax = await db.vaccines.where('dogId').equals(dog.id).toArray()
    const meds = await db.meds.where('dogId').equals(dog.id).filter((m) => m.active).count()
    const visits = await db.visits.where('dogId').equals(dog.id).toArray()
    const sym = await db.symptoms.where('dogId').equals(dog.id).filter((s) => !s.resolved).count()
    return { w, vax, meds, visits, sym }
  }, [dog.id])
  if (!d) return null
  const today = startOfDay(Date.now())
  const overdue = d.vax.filter((v) => v.nextDue && v.nextDue < today).length
  const soon = d.vax.filter((v) => v.nextDue && v.nextDue >= today && v.nextDue < today + 30 * DAY).length
  const nextVisit = d.visits.filter((v) => v.followUp && v.followUp >= today).sort((a, b) => a.followUp! - b.followUp!)[0]
  const last = d.w.at(-1)

  return (
    <Page title="Здраве" emoji="💗">
      <Link to="/health/emergency" className="btn-red w-full !min-h-14 !text-lg">🚨 Спешно!</Link>
      <Link to="/health/triage" className="btn-soft w-full !min-h-14">🚑 Спешно ли е? Провери симптом</Link>
      <div className="grid grid-cols-2 gap-2">
        <Card className="!p-3"><p className="text-xs font-bold text-cocoa/70">Тегло</p><p className="text-xl font-extrabold text-berry">{last ? `${last.kg} кг` : '–'}</p></Card>
        <Card className="!p-3"><p className="text-xs font-bold text-cocoa/70">Ваксини</p><p className="font-extrabold">{overdue ? <span className="chip chip-bad">{overdue} просрочени</span> : soon ? <span className="chip chip-warn">{soon} наближават</span> : <span className="chip chip-ok">наред</span>}</p></Card>
        <Card className="!p-3"><p className="text-xs font-bold text-cocoa/70">Лекарства днес</p><p className="text-xl font-extrabold text-berry">{d.meds || '–'}</p></Card>
        <Card className="!p-3"><p className="text-xs font-bold text-cocoa/70">Следващ преглед</p><p className="font-extrabold text-berry">{nextVisit ? fmtDate(nextVisit.followUp!) : '–'}</p></Card>
      </div>
      {d.sym > 0 && <Link to="/health/symptoms" className="card block !border-amber-300 font-bold">🤒 Отворени симптоми: {d.sym}</Link>}
      <MenuLink to="/health/weight" emoji="⚖️" label="Тегло" sub="Графика и история" />
      <MenuLink to="/health/vaccines" emoji="💉" label="Ваксини и паразити" />
      <MenuLink to="/health/meds" emoji="💊" label="Лекарства" />
      <MenuLink to="/health/visits" emoji="🩺" label="Посещения при ветеринаря" />
      <MenuLink to="/health/symptoms" emoji="🤒" label="Симптоми" />
      <MenuLink to="/health/docs" emoji="📁" label="Документи" />
      <MenuLink to="/health/summary" emoji="📄" label="Резюме за ветеринаря" sub="За печат / PDF" />
      <Disclaimer />
    </Page>
  )
}
