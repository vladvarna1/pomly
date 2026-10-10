import { useLiveQuery } from 'dexie-react-hooks'
import { db, lastTs, type Routine } from '../db/db'
import { DAY, endOfDay } from './util'

export interface RoutineStatus extends Routine {
  last?: number
  next: number
}

export function useRoutineStatus(dogId: number) {
  return useLiveQuery(async () => {
    // Re-run whenever logs/weights/routines change
    await Promise.all([db.logs.count(), db.weights.count()])
    const rs = await db.routines.where('dogId').equals(dogId).toArray()
    return Promise.all(
      rs.map(async (r) => {
        const last = await lastTs(dogId, r.key)
        const next = Math.max(last ? last + r.everyDays * DAY : 0, r.snoozeUntil ?? 0)
        return { ...r, last, next } as RoutineStatus
      }),
    )
  }, [dogId])
}

export const isDue = (r: RoutineStatus, now = Date.now()) => r.next <= endOfDay(now)
/** Late by more than a day */
export const isOverdue = (r: RoutineStatus, now = Date.now()) => !!r.last && now - r.next > DAY

export function routineIcs(dogName: string, r: Routine) {
  const d = new Date()
  const stamp = (x: Date) => x.toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '')
  const day = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Pomly//BG', 'BEGIN:VEVENT',
    `UID:pomly-${r.key}-${Date.now()}@pomly`,
    `DTSTAMP:${stamp(d)}`,
    `DTSTART:${day}T180000`,
    `DTEND:${day}T181500`,
    `RRULE:FREQ=DAILY;INTERVAL=${r.everyDays}`,
    `SUMMARY:${r.emoji} ${r.title} – ${dogName}`,
    'BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${r.title}`, 'TRIGGER:PT0M', 'END:VALARM',
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n')
}
