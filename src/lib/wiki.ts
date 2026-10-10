import MiniSearch from 'minisearch'

export interface Article {
  slug: string
  title: string
  category: string
  summary: string
  art: string
  reviewed: string
  vet: string
  sources: string[]
  related: string[]
  body: string
}

const raw = import.meta.glob('../content/wiki/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>

function parse(path: string, text: string): Article {
  const m = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  const meta: Record<string, string> = {}
  m?.[1].split('\n').forEach((l) => {
    const i = l.indexOf(':')
    if (i > 0) meta[l.slice(0, i).trim()] = l.slice(i + 1).trim()
  })
  return {
    slug: path.split('/').pop()!.replace('.md', ''),
    title: meta.title ?? '',
    category: meta.category ?? 'Друго',
    summary: meta.summary ?? '',
    art: meta.art ?? '',
    reviewed: meta.reviewed ?? '',
    vet: meta.vet ?? '',
    sources: (meta.sources ?? '').split('|').map((s) => s.trim()).filter(Boolean),
    related: (meta.related ?? '').split(',').map((s) => s.trim()).filter(Boolean),
    body: (m?.[2] ?? text).replace(/<!--[\s\S]*?-->/g, '').trim(),
  }
}

export const articles: Article[] = Object.entries(raw).map(([p, t]) => parse(p, t)).sort((a, b) => a.title.localeCompare(b.title, 'bg'))
export const categories = ['Порода', 'Грижа', 'Здраве', 'Храна', 'Поведение', 'Всекидневие', 'Спешни']
export const startHere = ['never-shave', 'line-brushing', 'tracheal-collapse', 'toxic-foods', 'first-aid-basics', 'harness-vs-collar']

const mini = new MiniSearch<Article>({
  idField: 'slug',
  fields: ['title', 'summary', 'body'],
  storeFields: ['title'],
  searchOptions: { prefix: true, fuzzy: 0.2, boost: { title: 3 } },
})
mini.addAll(articles)
export const search = (q: string) => mini.search(q).map((r) => articles.find((a) => a.slug === r.id)!).filter(Boolean)

/** Tiny markdown renderer: ## headings, lists, **bold**, paragraphs. */
export function renderMd(md: string): string {
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const inline = (s: string) => esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  const out: string[] = []
  let list: 'ul' | 'ol' | null = null
  const close = () => { if (list) { out.push(`</${list}>`); list = null } }
  for (const line of md.split('\n')) {
    const l = line.trimEnd()
    if (/^## /.test(l)) { close(); out.push(`<h2>${inline(l.slice(3))}</h2>`) }
    else if (/^- /.test(l)) { if (list !== 'ul') { close(); out.push('<ul>'); list = 'ul' } out.push(`<li>${inline(l.slice(2))}</li>`) }
    else if (/^\d+\. /.test(l)) { if (list !== 'ol') { close(); out.push('<ol>'); list = 'ol' } out.push(`<li>${inline(l.replace(/^\d+\. /, ''))}</li>`) }
    else if (!l.trim()) close()
    else { close(); out.push(`<p>${inline(l)}</p>`) }
  }
  close()
  return out.join('')
}

/** Split an article body into text chunks and inline picture markers like [[art:sections]] */
export function splitBody(body: string): ({ html: string } | { art: string })[] {
  const parts: ({ html: string } | { art: string })[] = []
  let buf: string[] = []
  const flush = () => {
    if (buf.join('').trim()) parts.push({ html: renderMd(buf.join('\n')) })
    buf = []
  }
  for (const line of body.split('\n')) {
    const m = line.trim().match(/^\[\[art:([\w-]+)\]\]$/)
    if (m) {
      flush()
      parts.push({ art: m[1] })
    } else buf.push(line)
  }
  flush()
  return parts
}

