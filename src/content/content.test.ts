import { describe, expect, it } from 'vitest'
import { scenes } from '../components/Art'
import { courses } from './training'
import { sessions, tools } from './groom'
import { firstAid } from './firstaid'
import { pathExtra, paths } from './triage/triage'
import { articles } from '../lib/wiki'

const has = (k?: string) => !k || k in scenes

describe('content references', () => {
  it('every lesson and step picture exists', () => {
    for (const c of courses) for (const l of c.lessons) {
      expect(has(l.art), `${c.id}/${l.id} art ${l.art}`).toBe(true)
      for (const s of l.steps) expect(has(s.a), `${c.id}/${l.id} step art ${s.a}`).toBe(true)
      expect(l.steps.length).toBeGreaterThanOrEqual(3)
    }
  })
  it('every grooming step, tool, first-aid card and triage path picture exists', () => {
    for (const s of sessions) for (const st of s.steps) expect(has(st.art), `${s.id} ${st.art}`).toBe(true)
    for (const t of tools) expect(has(t.art), t.name).toBe(true)
    for (const a of firstAid) expect(has(a.art), a.id).toBe(true)
    for (const p of paths) expect(has(pathExtra[p.id]?.art), p.id).toBe(true)
  })
  it('wiki articles have valid pictures, related links and sources', () => {
    const slugs = new Set(articles.map((a) => a.slug))
    expect(articles.length).toBeGreaterThanOrEqual(40)
    for (const a of articles) {
      expect(has(a.art), `${a.slug} hero`).toBe(true)
      for (const m of a.body.matchAll(/\[\[art:([\w-]+)\]\]/g)) expect(has(m[1]), `${a.slug} inline ${m[1]}`).toBe(true)
      for (const r of a.related) expect(slugs.has(r), `${a.slug} related ${r}`).toBe(true)
      expect(a.sources.length, a.slug).toBeGreaterThan(0)
    }
  })
})
