// Fixed-rule symptom checker. NOT AI, NOT a diagnosis. Plain data so it can be reviewed.
// Sources to review against: VCA Animal Hospitals, Merck Veterinary Manual, Cornell University College of Veterinary Medicine, ASPCA.
export type Level = 'red' | 'orange' | 'green'

export const levelInfo: Record<Level, { emoji: string; title: string; text: string }> = {
  red: { emoji: '🔴', title: 'Към ветеринар веднага', text: 'Обади се на ветеринаря или на спешна клиника и тръгвай сега.' },
  orange: { emoji: '🟠', title: 'Обади се на ветеринаря до 24 часа', text: 'Не е непременно спешно, но си струва да се прегледа скоро.' },
  green: { emoji: '🟢', title: 'Наблюдавай вкъщи', text: 'Изглежда не е спешно. Наблюдавай и се обади, ако се променят нещата.' },
}

/** Any "yes" to these means: go to a vet now. */
export const universalFlags: string[] = [
  'Има затруднено дишане (диша с усилие, с отворена уста, шумно)',
  'Венците са бледи, сини или сиви',
  'Колабира, не може да се изправи или е в безсъзнание',
  'Има припадък / гърч',
  'Коремът е твърд и подут',
  'Подозираш отравяне (изяла е нещо токсично)',
  'Силно кървене, което не спира',
  'Паднала е от височина, била е настъпена или ударена',
]

export interface Question { q: string; yes: Level }
export interface Path {
  id: string
  title: string
  emoji: string
  base: Level // result if every answer is "no"
  questions: Question[]
  /** extra advice shown for a level (optional) */
  advice?: Partial<Record<Level, string>>
  source: string
}

export const paths: Path[] = [
  {
    id: 'honk', title: 'Гъши кашлица', emoji: '🪿', base: 'green',
    questions: [
      { q: 'Кашлицата започва при възбуда, дърпане на каишката или пиене?', yes: 'orange' },
      { q: 'Продължава повече от 2 дни или се влошава?', yes: 'orange' },
      { q: 'След кашлицата се задъхва дълго или е уморена?', yes: 'orange' },
    ],
    advice: { orange: 'Звукът „гъша“ при мини породи може да е свързан с проблеми с трахеята – само ветеринар може да каже. Ползвай нагръдник, не нашийник.', green: 'Ползвай нагръдник, не нашийник. Ако се повтаря, спомени на ветеринаря.' },
    source: 'Merck Veterinary Manual; VCA Animal Hospitals',
  },
  {
    id: 'reverse', title: 'Обратно кихане', emoji: '🤧', base: 'green',
    questions: [
      { q: 'Епизодът продължава повече от няколко минути?', yes: 'orange' },
      { q: 'Случва се често (всеки ден)?', yes: 'orange' },
      { q: 'Има гноен или кървав секрет от носа?', yes: 'orange' },
    ],
    advice: { green: 'Обратното кихане често е безвредно: кратки хъркащи вдишвания, след които всичко е нормално. Ако диша нормално между епизодите, най-вероятно е това.', orange: 'Спомени го на ветеринаря.' },
    source: 'VCA Animal Hospitals',
  },
  {
    id: 'patella', title: 'Подскача на задно краче', emoji: '🦵', base: 'green',
    questions: [
      { q: 'Куца или не стъпва повече от 24 часа?', yes: 'orange' },
      { q: 'Пищи или се дърпа, когато я докоснеш?', yes: 'orange' },
      { q: 'Кракът изглежда извит или подут?', yes: 'orange' },
      { q: 'Започна внезапно след скок или падане?', yes: 'red' },
    ],
    advice: { green: 'Понякога „прескачане“ с крачето може да е изкълчване на капачката (луксация на пателата). Покажи го на ветеринаря на следващия преглед.' },
    source: 'Merck Veterinary Manual; AKC',
  },
  {
    id: 'puppy-weak', title: 'Слабо, треперещо кученце', emoji: '🐣', base: 'orange',
    questions: [
      { q: 'Кученце е (под около 6 месеца) и е отпаднало, клати се или трепери?', yes: 'red' },
      { q: 'Не е яло от повече от няколко часа?', yes: 'red' },
      { q: 'Повръща или има диария?', yes: 'red' },
    ],
    advice: { red: 'Много малките кученца може да получат ниска кръвна захар – това е спешно. Тръгвай към ветеринар.', orange: 'Малките кученца се влошават бързо. Обади се на ветеринаря още днес.' },
    source: 'Merck Veterinary Manual; VCA Animal Hospitals',
  },
  {
    id: 'ate', title: 'Изяла е нещо', emoji: '🍫', base: 'orange',
    questions: [
      { q: 'Шоколад, дъвки/бонбони без захар (ксилитол), грозде/стафиди, лук/чесън, човешки обезболяващи или отрова за плъхове?', yes: 'red' },
      { q: 'Изяла е чуждо тяло (играчка, кост, плат)?', yes: 'red' },
      { q: 'Повръща, отпаднала е или е със странно поведение?', yes: 'red' },
    ],
    advice: { red: 'Не предизвиквай повръщане вкъщи. Вземи опаковката/какво е изяла и тръгвай към ветеринар или се обади веднага.', orange: 'Не предизвиквай повръщане вкъщи. Обади се на ветеринаря, кажи какво и колко е изяла.' },
    source: 'ASPCA Animal Poison Control; VCA Animal Hospitals',
  },
  {
    id: 'teeth', title: 'Лош дъх, червени венци, клатещи се зъби', emoji: '🦷', base: 'orange',
    questions: [
      { q: 'Лицето/бузата е подуто?', yes: 'red' },
      { q: 'Не иска да яде или яде само от една страна?', yes: 'orange' },
      { q: 'Кърви от устата?', yes: 'orange' },
    ],
    advice: { orange: 'Зъбните проблеми са чести при мини породи. Запази час за преглед; не е спешно, освен ако не е с подуване.' },
    source: 'VCA Animal Hospitals; AKC',
  },
  {
    id: 'hair', title: 'Пада козина', emoji: '🪮', base: 'orange',
    questions: [
      { q: 'Кожата е червена, лющи се или тя се чеше силно?', yes: 'orange' },
      { q: 'Има рани или гной?', yes: 'orange' },
      { q: 'Козината пада на петна, а иначе се държи нормално?', yes: 'orange' },
    ],
    advice: { orange: 'Не е спешно, но запиши час, за да се изключат медицински причини. Това не е диагноза. Не бръсни.' },
    source: 'Merck Veterinary Manual; AKC',
  },
  {
    id: 'heat', title: 'Прегряване / задъхване в жега', emoji: '🥵', base: 'orange',
    questions: [
      { q: 'Задъхва се силно, слюнка е гъста, венците са ярко червени?', yes: 'red' },
      { q: 'Отпаднала е, залита или повръща?', yes: 'red' },
      { q: 'Била е на жега, в кола или на слънце?', yes: 'orange' },
    ],
    advice: { red: 'Премести я на сянка/хладно, мокри с хладка (не ледена) вода и тръгвай към ветеринар.', orange: 'Остави я на хладно място и ѝ предложи вода. Ако не се успокои бързо – към ветеринар.' },
    source: 'VCA Animal Hospitals; Merck Veterinary Manual',
  },
  {
    id: 'fall', title: 'Падане или скок от мебел', emoji: '🛋️', base: 'orange',
    questions: [
      { q: 'Куца, пищи или не иска да се движи?', yes: 'red' },
      { q: 'Има рана, подуване или кръв?', yes: 'red' },
      { q: 'Повръща или е объркана?', yes: 'red' },
    ],
    advice: { orange: 'Мини кучета могат да скрият болка. Дори да изглежда добре, обади се до 24 часа и ограничи движението.', red: 'Вдигай я внимателно с две ръце.' },
    source: 'Merck Veterinary Manual',
  },
  {
    id: 'seizure', title: 'Припадък / гърч', emoji: '⚡', base: 'red',
    questions: [
      { q: 'Гърчът продължава или се повтаря?', yes: 'red' },
    ],
    advice: { red: 'Не слагай ръце в устата ѝ. Отдалечи предмети, време на гърча и тръгвай към ветеринар.' },
    source: 'VCA Animal Hospitals',
  },
  {
    id: 'eye', title: 'Травма на око', emoji: '👁️', base: 'orange',
    questions: [
      { q: 'Окото е изскочило, силно подуто или има видима рана?', yes: 'red' },
      { q: 'Мижи, сълзи силно или е червено/мътно?', yes: 'orange' },
    ],
    advice: { red: 'Не търкай и не пипай. Към ветеринар веднага.', orange: 'Очните проблеми се влошават бързо – не чакай дълго.' },
    source: 'Merck Veterinary Manual',
  },
]

/** answers[i] === true means "yes" to question i. */
export function evaluate(path: Path, answers: boolean[], universalYes: boolean): Level {
  if (universalYes) return 'red'
  const rank: Record<Level, number> = { green: 0, orange: 1, red: 2 }
  let level: Level = path.base
  path.questions.forEach((q, i) => {
    if (answers[i] && rank[q.yes] > rank[level]) level = q.yes
  })
  return level
}
