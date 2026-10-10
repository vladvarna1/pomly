// Bulgarian spell check for every Cyrillic word in src/ (Hunspell dictionary).
// Words that are correct but missing from the dictionary (vet/grooming terms, names) live in scripts/spell-allow.txt.
// Also catches Latin letters hidden inside Cyrillic words. Run: npm run spell
// NOTE: a dictionary cannot catch grammar or invented-but-plausible forms – still proofread new text.
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import nspell from 'nspell'
import dict from 'dictionary-bg'

const spell = nspell(dict)
const allow = new Set(readFileSync('scripts/spell-allow.txt', 'utf8').split(/\r?\n/).filter(Boolean))
const files = []
const walk = (d) => { for (const f of readdirSync(d)) { const p = join(d, f); statSync(p).isDirectory() ? walk(p) : /\.(tsx?|md)$/.test(f) && !/\.test\./.test(f) && files.push(p) } }
walk('src')

let problems = 0
for (const f of files) {
  readFileSync(f, 'utf8').replace(/<!--[\s\S]*?-->/g, '').split(/\r?\n/).forEach((line, i) => {
    for (const m of line.matchAll(/[A-Za-z]+[А-Яа-я][А-Яа-я]*[A-Za-z]*|[А-Яа-я]+[A-Za-z]+[А-Яа-я]*/g)) {
      console.log(`${f}:${i + 1}  Latin letter inside Cyrillic word: ${m[0]}`); problems++
    }
    for (const m of line.matchAll(/[А-Яа-яЁё]+(?:-[А-Яа-яЁё]+)*/g)) {
      const w = m[0]
      const ok = w.split('-').every((p) => p.length < 2 || spell.correct(p) || spell.correct(p.toLowerCase()) || allow.has(p.toLowerCase()))
      if (!ok) { console.log(`${f}:${i + 1}  ${w}  → ${spell.suggest(w).slice(0, 3).join(', ') || '?'}`); problems++ }
    }
  })
}
console.log(problems ? `\n${problems} possible problem(s). Fix them, or add valid words to scripts/spell-allow.txt` : 'Spelling OK')
process.exit(problems ? 1 : 0)
