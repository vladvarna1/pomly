import { describe, expect, it } from 'vitest'
import { evaluate, levelInfo, paths, universalFlags } from './triage'

describe('triage', () => {
  it('every path ends in a defined result for all answer combinations', () => {
    for (const p of paths) {
      const n = p.questions.length
      for (let mask = 0; mask < 1 << n; mask++) {
        const answers = Array.from({ length: n }, (_, i) => !!(mask & (1 << i)))
        expect(levelInfo[evaluate(p, answers, false)]).toBeDefined()
      }
    }
  })
  it('any universal red flag leads to "go to a vet now" on every path', () => {
    expect(universalFlags.length).toBeGreaterThanOrEqual(8)
    for (const p of paths) expect(evaluate(p, p.questions.map(() => false), true)).toBe('red')
  })
  it('paths have questions and sources', () => {
    for (const p of paths) {
      expect(p.questions.length).toBeGreaterThanOrEqual(1)
      expect(p.source).toBeTruthy()
    }
  })
})
