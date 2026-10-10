const DAYS = ['неделя', 'понеделник', 'вторник', 'сряда', 'четвъртък', 'петък', 'събота']
const MONTHS = ['януари', 'февруари', 'март', 'април', 'май', 'юни', 'юли', 'август', 'септември', 'октомври', 'ноември', 'декември']

function greeting(h: number) {
  if (h < 5) return 'Лека нощ'
  if (h < 12) return 'Добро утро'
  if (h < 18) return 'Здравей'
  return 'Добър вечер'
}

export default function Today() {
  const now = new Date()
  const date = `${DAYS[now.getDay()]}, ${now.getDate()} ${MONTHS[now.getMonth()]}`

  return (
    <section className="space-y-4">
      <div className="card bg-gradient-to-br from-white to-petal text-center">
        <img src="/icon.svg" alt="Дарси" className="floaty mx-auto size-28 rounded-3xl" />
        <h1 className="mt-3 text-2xl font-extrabold text-berry">{greeting(now.getHours())}, Рени! 💗</h1>
        <p className="text-sm font-semibold text-cocoa/70">{date}</p>
        <p className="mt-2 font-bold">Дарси те чака за гушкане 🐶</p>
      </div>

      <div className="card">
        <h2 className="font-extrabold text-berry">Днес за Дарси</h2>
        <p className="mt-1 text-sm text-cocoa/70">
          Тук ще виждаш четкане, зъбки, нокти и всичко останало, което Дарси има нужда да получи днес ✨
        </p>
      </div>
    </section>
  )
}
