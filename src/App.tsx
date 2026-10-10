import { NavLink, Route, Routes, Link } from 'react-router-dom'
import Today from './pages/Today'
import Groom from './pages/Groom'
import Health from './pages/Health'
import Train from './pages/Train'
import Wiki from './pages/Wiki'
import Settings from './pages/Settings'

const tabs = [
  { to: '/', label: 'Днес', icon: '🌸', end: true },
  { to: '/groom', label: 'Грижа', icon: '🎀' },
  { to: '/health', label: 'Здраве', icon: '💗' },
  { to: '/train', label: 'Учим се', icon: '🦴' },
  { to: '/wiki', label: 'Уики', icon: '📖' },
]

export default function App() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col">
      <header className="sticky top-0 z-10 flex items-center justify-between bg-blush/90 px-4 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur">
        <Link to="/" className="text-2xl font-extrabold text-pink">
          Pomly <span aria-hidden>🐾</span>
        </Link>
        <Link
          to="/settings"
          aria-label="Настройки"
          className="grid size-11 place-items-center rounded-full bg-white text-xl shadow"
        >
          ⚙️
        </Link>
      </header>

      <main className="flex-1 px-4 pb-28 pt-2">
        <Routes>
          <Route path="/" element={<Today />} />
          <Route path="/groom" element={<Groom />} />
          <Route path="/health" element={<Health />} />
          <Route path="/train" element={<Train />} />
          <Route path="/wiki" element={<Wiki />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Today />} />
        </Routes>
      </main>

      <nav
        aria-label="Главно меню"
        className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-md rounded-t-3xl border-t-2 border-petal bg-white px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-4px_20px_rgb(236_72_153/0.15)]"
      >
        <ul className="flex justify-around">
          {tabs.map((t) => (
            <li key={t.to}>
              <NavLink
                to={t.to}
                end={t.end}
                className={({ isActive }) =>
                  `flex min-w-16 flex-col items-center gap-0.5 rounded-2xl px-3 py-1.5 text-xs font-bold ${
                    isActive ? 'bg-petal text-berry' : 'text-cocoa/70'
                  }`
                }
              >
                <span className="text-2xl" aria-hidden>{t.icon}</span>
                {t.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
