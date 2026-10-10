import { useEffect, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export const Card = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <div className={`card ${className}`}>{children}</div>
)

export function Page({ title, emoji, back, children }: { title: string; emoji?: string; back?: string | true; children: ReactNode }) {
  const nav = useNavigate()
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        {back && (
          <button className="btn-soft !min-h-10 !px-3" aria-label="Назад" onClick={() => (back === true ? nav(-1) : nav(back))}>
            ←
          </button>
        )}
        <h1 className="text-2xl font-extrabold text-berry">
          {emoji && <span aria-hidden>{emoji} </span>}
          {title}
        </h1>
      </div>
      {children}
    </section>
  )
}

export const Empty = ({ emoji = '🌷', text }: { emoji?: string; text: string }) => (
  <div className="py-6 text-center text-cocoa/70">
    <div className="text-4xl" aria-hidden>{emoji}</div>
    <p className="mt-1 font-semibold">{text}</p>
  </div>
)

export const Disclaimer = () => (
  <p className="rounded-2xl bg-petal px-3 py-2 text-xs font-semibold text-cocoa/80">
    ℹ️ Обща информация, не е ветеринарен съвет. При съмнение винаги питай ветеринаря на Дарси.
  </p>
)

export function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [onClose])
  return (
    <div className="fixed inset-0 z-40 flex items-end bg-black/40" onClick={onClose} role="dialog" aria-modal="true" aria-label={title}>
      <div className="mx-auto max-h-[88dvh] w-full max-w-md space-y-3 overflow-y-auto rounded-t-3xl bg-card p-4 pb-[max(1rem,env(safe-area-inset-bottom))]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-berry">{title}</h2>
          <button className="btn-soft !min-h-10 !px-3" aria-label="Затвори" onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

export const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <label className="block text-sm font-bold">
    {label}
    <div className="mt-1">{children}</div>
  </label>
)

export const MenuLink = ({ to, emoji, label, sub }: { to: string; emoji: string; label: string; sub?: string }) => (
  <Link to={to} className="card flex items-center gap-3 !p-3 active:scale-[0.98]">
    <span className="text-3xl" aria-hidden>{emoji}</span>
    <span className="flex-1">
      <span className="block font-extrabold">{label}</span>
      {sub && <span className="block text-sm text-cocoa/70">{sub}</span>}
    </span>
    <span aria-hidden className="text-rose">›</span>
  </Link>
)
