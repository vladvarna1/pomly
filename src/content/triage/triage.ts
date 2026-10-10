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
      { q: 'След кашлицата дълго се задъхва или изглежда уморена?', yes: 'orange' },
    ],
    advice: { orange: 'Звук, наподобяващ гъша кашлица, при мини породи може да е свързан с проблем с трахеята – само ветеринар може да каже. Използвай нагръдник, не нашийник.', green: 'Използвай нагръдник, не нашийник. Ако се повтаря, спомени го на ветеринаря.' },
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
    advice: { green: 'Понякога „подскачането“ на крачето може да е знак за луксация на пателата (изместване на колянната капачка). Покажи го на ветеринаря на следващия преглед.' },
    source: 'Merck Veterinary Manual; AKC',
  },
  {
    id: 'puppy-weak', title: 'Слабо, треперещо кученце', emoji: '🐣', base: 'orange',
    questions: [
      { q: 'Кученце ли е (под около 6 месеца) и е отпаднало, клати се или трепери?', yes: 'red' },
      { q: 'Не е ядяло повече от няколко часа?', yes: 'red' },
      { q: 'Повръща или има диария?', yes: 'red' },
    ],
    advice: { red: 'Много малките кученца може да получат ниска кръвна захар – това е спешно. Тръгвай към ветеринар.', orange: 'Малките кученца се влошават бързо. Обади се на ветеринаря още днес.' },
    source: 'Merck Veterinary Manual; VCA Animal Hospitals',
  },
  {
    id: 'ate', title: 'Изяла е нещо', emoji: '🍫', base: 'orange',
    questions: [
      { q: 'Шоколад, дъвки/бонбони без захар (ксилитол), грозде/стафиди, лук/чесън, човешки обезболяващи или отрова за плъхове?', yes: 'red' },
      { q: 'Изяла ли е чуждо тяло (играчка, кост, плат)?', yes: 'red' },
      { q: 'Повръща, отпаднала е или е със странно поведение?', yes: 'red' },
    ],
    advice: { red: 'Не предизвиквай повръщане вкъщи. Вземи опаковката или това, което е изяла, обади се на ветеринаря веднага и тръгвай към клиниката.', orange: 'Не предизвиквай повръщане вкъщи. Обади се на ветеринаря и му кажи какво и колко е изяла.' },
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
      { q: 'Кожата червена ли е или се лющи, или Дарси се чеше силно?', yes: 'orange' },
      { q: 'Има рани или гной?', yes: 'orange' },
      { q: 'Козината пада на петна, а иначе се държи нормално?', yes: 'orange' },
    ],
    advice: { orange: 'Не е спешно, но запиши час, за да се изключат медицински причини. Това не е диагноза. Не бръсни.' },
    source: 'Merck Veterinary Manual; AKC',
  },
  {
    id: 'heat', title: 'Прегряване / задъхване в жега', emoji: '🥵', base: 'orange',
    questions: [
      { q: 'Задъхва се силно, слюнката е гъста, венците са ярко червени?', yes: 'red' },
      { q: 'Отпаднала е, залита или повръща?', yes: 'red' },
      { q: 'Била е на жега, в кола или на слънце?', yes: 'orange' },
    ],
    advice: { red: 'Премести я на сянка или на хладно, мокри я с хладка (не ледена) вода и тръгвай към ветеринар.', orange: 'Остави я на хладно място и ѝ предложи вода. Ако не се успокои бързо – към ветеринар.' },
    source: 'VCA Animal Hospitals; Merck Veterinary Manual',
  },
  {
    id: 'fall', title: 'Падане или скок от мебел', emoji: '🛋️', base: 'orange',
    questions: [
      { q: 'Куца, пищи или не иска да се движи?', yes: 'red' },
      { q: 'Има рана, подуване или кръв?', yes: 'red' },
      { q: 'Повръща или е объркана?', yes: 'red' },
    ],
    advice: { orange: 'Мини кучетата могат да крият болка. Дори да изглежда добре, обади се до 24 часа и ограничи движението.', red: 'Вдигай я внимателно с две ръце.' },
    source: 'Merck Veterinary Manual',
  },
  {
    id: 'seizure', title: 'Припадък / гърч', emoji: '⚡', base: 'red',
    questions: [
      { q: 'Гърчът продължава или се повтаря?', yes: 'red' },
    ],
    advice: { red: 'Не слагай ръце в устата ѝ. Отдалечи предметите наоколо, засичай колко трае гърчът и тръгвай към ветеринар.' },
    source: 'VCA Animal Hospitals',
  },
  {
    id: 'eye', title: 'Травма на око', emoji: '👁️', base: 'orange',
    questions: [
      { q: 'Окото е изскочило, силно подуто или има видима рана?', yes: 'red' },
      { q: 'Присвива очи, сълзи силно или окото е червено или мътно?', yes: 'orange' },
    ],
    advice: { red: 'Не търкай окото и не го пипай. Към ветеринар веднага.', orange: 'Очните проблеми се влошават бързо – не чакай дълго.' },
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

/** Picture and "what to watch for / when to come back" for each path. */
export const pathExtra: Record<string, { art: string; watch: string[] }> = {
  honk: { art: 'honk', watch: ['Кашлицата става по-честа или по-силна', 'Дишането ѝ е затруднено или се уморява бързо', 'Венците стават бледи или синкави – веднага към ветеринар', 'Кашлица, която не минава за няколко дни'] },
  reverse: { art: 'reverse', watch: ['Епизодите стават по-чести или по-дълги', 'Между епизодите диша шумно или с усилие', 'Има секрет от носа или кръв', 'Изглежда отпаднала след епизод'] },
  patella: { art: 'patella', watch: ['Куца повече от 24 часа', 'Не стъпва изобщо на крака', 'Пищи при докосване', 'Кракът е подут или изглежда странно'] },
  'puppy-weak': { art: 'puppyweak', watch: ['Става по-слаба или не реагира', 'Не може да стои или се клати', 'Повръща или има диария', 'Венците са бледи или студени'] },
  ate: { art: 'ateitem', watch: ['Повръщане, слюноотделяне, треперене', 'Слабост или странно поведение', 'Подут корем или болка', 'Нещо от опасния списък – веднага ветеринар'] },
  teeth: { art: 'teethproblem', watch: ['Бузата се подува', 'Не иска да яде', 'Кърви от устата', 'Лош дъх, който се влошава'] },
  hair: { art: 'hairloss', watch: ['Червена, лющеща се или мокра кожа', 'Силен сърбеж или рани', 'Козината пада на нови места', 'Промяна в апетита или енергията'] },
  heat: { art: 'heat', watch: ['Задъхването не се успокоява за 10–15 минути', 'Слабост, повръщане, залитане', 'Венци ярко червени или бледи', 'Колапс'] },
  fall: { art: 'fall', watch: ['Куцане или нежелание да се движи', 'Повръщане или объркване', 'Подуване или рана', 'Диша учестено'] },
  seizure: { art: 'seizure', watch: ['Гърч над 5 минути или няколко подред', 'Не идва в съзнание', 'Задух след гърча'] },
  eye: { art: 'eye', watch: ['Присвива очи, сълзи силно', 'Окото е червено или мътно', 'Видим секрет или рана', 'Търка окото с лапа'] },
}
