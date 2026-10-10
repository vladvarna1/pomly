export default function ComingSoon({ title, emoji, text }: { title: string; emoji: string; text: string }) {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-extrabold text-berry">{title}</h1>
      <div className="card text-center">
        <div className="floaty text-6xl" aria-hidden>{emoji}</div>
        <p className="mt-3 font-bold">{text}</p>
        <p className="mt-1 text-sm text-cocoa/70">Скоро тук ще има още сладки неща 💕</p>
      </div>
    </section>
  )
}
