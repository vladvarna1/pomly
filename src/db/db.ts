import Dexie, { type Table } from 'dexie'
import { DAY, isoDay, lifeStage, startOfDay } from '../lib/util'

export interface Dog {
  id?: number
  name: string
  photo?: string
  birth?: string
  sex: 'f' | 'm'
  neutered: boolean
  color?: string
  weightKg?: number
  microchip?: string
  allergies?: string
  demo?: boolean
}
export interface Routine {
  id?: number
  dogId: number
  key: string
  title: string
  emoji: string
  everyDays: number
  snoozeUntil?: number
  note?: string
}
export interface Log {
  id?: number
  dogId: number
  ts: number
  type: string
  note?: string
  data?: Record<string, unknown>
}
export interface Weight { id?: number; dogId: number; ts: number; kg: number; bcs?: number }
export interface Vaccine { id?: number; dogId: number; name: string; date: number; nextDue?: number; note?: string; photo?: string }
export interface Med { id?: number; dogId: number; name: string; purpose?: string; dose?: string; schedule?: string; active: boolean }
export interface Visit { id?: number; dogId: number; date: number; clinic?: string; reason: string; diagnosis?: string; treatment?: string; cost?: string; followUp?: number }
export interface Symptom { id?: number; dogId: number; ts: number; title: string; note?: string; photo?: string; resolved?: boolean; source?: string }
export interface Issue { id?: number; dogId: number; ts: number; area: string; kind: string; severity: number; note?: string; photo?: string; resolvedTs?: number }
export interface Photo { id?: number; dogId: number; ts: number; kind: 'coat' | 'doc' | 'note'; photo: string; title?: string; stage?: string }
export interface Progress { id?: number; dogId: number; lessonId: string; ts: number; ok: number; fail: number; seconds: number }

class PomDB extends Dexie {
  dogs!: Table<Dog, number>
  routines!: Table<Routine, number>
  logs!: Table<Log, number>
  weights!: Table<Weight, number>
  vaccines!: Table<Vaccine, number>
  meds!: Table<Med, number>
  visits!: Table<Visit, number>
  symptoms!: Table<Symptom, number>
  issues!: Table<Issue, number>
  photos!: Table<Photo, number>
  progress!: Table<Progress, number>
  kv!: Table<{ key: string; value: unknown }, string>
  constructor() {
    super('pomly')
    this.version(1).stores({
      dogs: '++id',
      routines: '++id,dogId',
      logs: '++id,dogId,type,ts',
      weights: '++id,dogId,ts',
      vaccines: '++id,dogId',
      meds: '++id,dogId',
      visits: '++id,dogId',
      symptoms: '++id,dogId',
      issues: '++id,dogId',
      photos: '++id,dogId,kind,ts',
      progress: '++id,dogId,lessonId',
      kv: 'key',
    })
  }
}
export const db = new PomDB()

const TABLES = ['dogs', 'routines', 'logs', 'weights', 'vaccines', 'meds', 'visits', 'symptoms', 'issues', 'photos', 'progress', 'kv'] as const

export const getKv = async <T,>(key: string, fallback: T): Promise<T> => ((await db.kv.get(key))?.value as T) ?? fallback
export const setKv = (key: string, value: unknown) => db.kv.put({ key, value })

/** Routine templates: key matches the log type that marks it done. */
export function defaultRoutines(dogId: number, birth?: string): Routine[] {
  const st = lifeStage(birth)
  const r = (key: string, title: string, emoji: string, everyDays: number, note?: string): Routine => ({ dogId, key, title, emoji, everyDays, note })
  return [
    r('brush', st === 'puppy' ? 'Кратко четкане' : 'Четкане', '🪮', st === 'puppy' ? 1 : 3, 'При смяна на козината – всеки ден.'),
    r('teeth', 'Миене на зъбки', '🦷', 1, 'Само паста за кучета, никога човешка.'),
    r('eyes', 'Почистване на очички', '👀', 1),
    r('ears', 'Проверка на ушички', '👂', 7),
    r('nails', 'Подрязване на нокти', '💅', 18),
    r('paws', 'Подстригване на лапички', '🐾', 28),
    r('bath', 'Къпане', '🛁', 30, 'След къпане – подсушаване до кожата.'),
    r('sanitary', 'Хигиенно подстригване', '✂️', 35),
    r('weight', 'Претегляне', '⚖️', st === 'puppy' ? 7 : 30),
  ]
}

export async function createDog(d: Dog) {
  const id = await db.dogs.add(d)
  await db.routines.bulkAdd(defaultRoutines(id, d.birth))
  if (d.weightKg) await db.weights.add({ dogId: id, ts: Date.now(), kg: d.weightKg })
  localStorage.setItem('pomly.dog', String(id))
  return id
}

export async function deleteDog(id: number) {
  await Promise.all(
    (['routines', 'logs', 'weights', 'vaccines', 'meds', 'visits', 'symptoms', 'issues', 'photos', 'progress'] as const).map((t) =>
      (db[t] as Table<{ dogId: number }, number>).where('dogId').equals(id).delete(),
    ),
  )
  await db.dogs.delete(id)
}

export async function lastTs(dogId: number, key: string): Promise<number | undefined> {
  if (key === 'weight') return (await db.weights.where('dogId').equals(dogId).reverse().sortBy('ts'))[0]?.ts
  return (await db.logs.where('dogId').equals(dogId).and((l) => l.type === key).reverse().sortBy('ts'))[0]?.ts
}

export async function exportBackup() {
  const out: Record<string, unknown> = { app: 'pomly', version: 1, exportedAt: Date.now() }
  for (const t of TABLES) out[t] = await db.table(t).toArray()
  await setKv('lastBackup', Date.now())
  return JSON.stringify(out)
}

export async function importBackup(text: string) {
  const data = JSON.parse(text)
  if (data.app !== 'pomly') throw new Error('Това не е файл от Pomly.')
  await db.transaction('rw', TABLES.map((t) => db.table(t)), async () => {
    for (const t of TABLES) {
      await db.table(t).clear()
      if (Array.isArray(data[t])) await db.table(t).bulkPut(data[t])
    }
  })
}

export async function wipeAll() {
  await Promise.all(TABLES.map((t) => db.table(t).clear()))
  localStorage.removeItem('pomly.dog')
}

/** A sample dog with ~60 days of realistic logs. */
export async function loadDemo() {
  const birth = new Date(Date.now() - 2.5 * 365 * DAY)
  const id = await db.dogs.add({
    name: 'Демо Дарси', sex: 'f', neutered: true, color: 'оранжева', weightKg: 2.6, demo: true,
    birth: isoDay(birth.getTime()), microchip: '000000000000000', allergies: 'няма известни',
  })
  await db.routines.bulkAdd(defaultRoutines(id, isoDay(birth.getTime())))
  const now = Date.now()
  const logs: Log[] = []
  for (let i = 60; i >= 0; i--) {
    const ts = startOfDay(now) - i * DAY + 10 * 3600000
    if (i % 3 === 0) logs.push({ dogId: id, ts, type: 'brush' })
    if (i % 4 !== 0) logs.push({ dogId: id, ts: ts + 3600000, type: 'teeth' })
    if (i % 2 === 0) logs.push({ dogId: id, ts: ts + 7200000, type: 'eyes' })
    if (i % 7 === 0) logs.push({ dogId: id, ts, type: 'ears' })
    if (i % 18 === 0) logs.push({ dogId: id, ts, type: 'nails' })
    if (i % 30 === 5) logs.push({ dogId: id, ts, type: 'bath' })
    for (const h of [8, 13, 19]) if ((i + h) % 2 === 0) logs.push({ dogId: id, ts: ts + h * 3600000 - 36000000, type: 'potty', data: { where: i % 9 === 0 && h === 13 ? 'accident' : 'out' } })
  }
  await db.logs.bulkAdd(logs)
  await db.weights.bulkAdd(Array.from({ length: 9 }, (_, k) => ({ dogId: id, ts: startOfDay(now) - (8 - k) * 7 * DAY, kg: Math.round((2.55 + Math.sin(k) * 0.08 + k * 0.01) * 100) / 100 })))
  await db.vaccines.add({ dogId: id, name: 'Годишна ваксина (по график на ветеринаря)', date: now - 200 * DAY, nextDue: now + 165 * DAY })
  await db.vaccines.add({ dogId: id, name: 'Против бяс', date: now - 335 * DAY, nextDue: now + 20 * DAY })
  await db.visits.add({ dogId: id, date: now - 45 * DAY, clinic: 'Примерна клиника, Варна', reason: 'Профилактичен преглед', diagnosis: 'Всичко е наред', followUp: now + 25 * DAY })
  return id
}
