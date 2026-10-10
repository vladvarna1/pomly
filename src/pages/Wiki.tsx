import { useState } from 'react'
import { Link, Route, Routes, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { getKv, setKv } from '../db/db'
import { articles, categories, search, splitBody, startHere } from '../lib/wiki'
import Art from '../components/Art'
import { shaveWords } from '../content/groom'
import { Card, Disclaimer, Empty, Page } from '../components/ui'

export default function Wiki() {
  return (
    <Routes>
      <Route index element={<Home />} />
      <Route path=":slug" element={<ArticlePage />} />
    </Routes>
  )
}

const useBookmarks = () => useLiveQuery(() => getKv<string[]>('bookmarks', []), []) ?? []

const Row = ({ slug }: { slug: string }) => {
  const a = articles.find((x) => x.slug === slug)
  if (!a) return null
  return (
    <Link to={`/wiki/${a.slug}`} className="card block !p-3">
      <p className="font-extrabold">{a.title}</p>
      <p className="text-sm text-cocoa/70">{a.summary}</p>
    </Link>
  )
}

function Home() {
  const [q, setQ] = useState('')
  const [cat, setCat] = useState<string>()
  const marks = useBookmarks()
  const results = q.trim().length > 1 ? search(q) : null

  return (
    <Page title="Уики" emoji="📖">
      <input className="input" type="search" placeholder="🔍 Търси…" aria-label="Търсене" value={q} onChange={(e) => setQ(e.target.value)} />
      {shaveWords.test(q) && (
        <Card className="!border-amber-300 text-sm font-semibold">🚫 Не бръснем помераните! Двойната козина може да не порасне като преди. <Link className="underline" to="/wiki/never-shave">Защо?</Link></Card>
      )}
      {results ? (
        <div className="space-y-2">
          {results.length === 0 && <Card><Empty emoji="🔍" text="Няма резултати" /></Card>}
          {results.map((a) => <Row key={a.slug} slug={a.slug} />)}
        </div>
      ) : (
        <>
          {marks.length > 0 && (<><h2 className="font-extrabold text-berry">🔖 Любими</h2>{marks.map((s) => <Row key={s} slug={s} />)}</>)}
          <h2 className="font-extrabold text-berry">Започни оттук ✨</h2>
          {startHere.map((s) => <Row key={s} slug={s} />)}
          <h2 className="font-extrabold text-berry">Категории</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => <button key={c} className={cat === c ? 'btn !min-h-9' : 'btn-soft !min-h-9'} onClick={() => setCat(cat === c ? undefined : c)}>{c}</button>)}
          </div>
          {cat && articles.filter((a) => a.category === cat).map((a) => <Row key={a.slug} slug={a.slug} />)}
        </>
      )}
      <Disclaimer />
    </Page>
  )
}

function ArticlePage() {
  const { slug } = useParams()
  const a = articles.find((x) => x.slug === slug)
  const marks = useBookmarks()
  if (!a) return <Page title="Не е намерено" back="/wiki"><p>Тази статия не съществува.</p></Page>
  const on = marks.includes(a.slug)
  return (
    <Page title={a.title} back="/wiki">
      <p className="text-sm font-semibold text-cocoa/70">{a.summary}</p>
      <div className="flex items-center justify-between text-xs font-bold text-cocoa/60">
        <span>Последен преглед: {a.reviewed}</span>
        <button className={on ? 'btn !min-h-9' : 'btn-soft !min-h-9'} onClick={() => setKv('bookmarks', on ? marks.filter((m) => m !== a.slug) : [...marks, a.slug])}>{on ? '🔖 Запазена' : '🔖 Запази'}</button>
      </div>
      {a.art && <Art k={a.art} label={a.title} />}
      <Card>
        {splitBody(a.body).map((part, i) => 'art' in part
          ? <div key={i} className="my-3"><Art k={part.art} /></div>
          : <div key={i} className="prose" dangerouslySetInnerHTML={{ __html: part.html }} />)}
      </Card>
      {a.vet && <Card className="!border-red-300"><p className="font-extrabold text-red-700">🩺 Кога към ветеринар</p><p className="text-sm">{a.vet}</p></Card>}
      {a.related.length > 0 && (<><h2 className="font-extrabold text-berry">Свързани</h2>{a.related.map((s) => <Row key={s} slug={s} />)}</>)}
      <Card className="text-xs"><b>Източници:</b><ul className="list-disc pl-5">{a.sources.map((s) => <li key={s}>{s}</li>)}</ul></Card>
      <Disclaimer />
    </Page>
  )
}
