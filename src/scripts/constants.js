export const UI = {
  en: {
    eyebrow: "Google Calendar • event flairs",
    title: "Google Calendar event flairs",
    lead:
      "Each card is now tied to a real flair code from src/data. By default it shows SVG, the img button switches the asset, the card opens the image in a new tab, and the photo reveals all association words.",
    codesTotal: "codes total",
    cardsVisible: "codes visible",
    groups: "languages",
    language: "language",
    empty: "Nothing found. Try another search or category.",
    search: "Search by code or association…",
    copied: "Copied",
    sourceSnapshot: "Real associations • src/data",
    revealHint: "If you type this word in Google Calendar, this picture should appear.",
    associationsTitle: "Associative words"
  },
  ru: {
    eyebrow: "Google Calendar • event flairs",
    title: "Flairs для Google Calendar",
    lead:
      "Каждая карточка привязана к реальному коду из src/data. По умолчанию показывается SVG, кнопка img переключает изображение, клик по карточке открывает картинку в новой вкладке, а клик по фото разворачивает все ассоциативные слова.",
    codesTotal: "кодов всего",
    cardsVisible: "кодов видно",
    groups: "языков",
    language: "язык",
    empty: "Ничего не найдено. Попробуйте другой запрос или категорию.",
    search: "Поиск по коду или ассоциации…",
    copied: "Скопировано",
    sourceSnapshot: "Реальные ассоциации • src/data",
    revealHint: "Если вы напишете это слово в Google Календарь, у вас покажется эта картинка.",
    associationsTitle: "Ассоциативные слова"
  }
};

export const categoryRules = [
  { key: "holidays", name: "Holidays", ru: "Праздники", color: "#d93025", match: /holiday|christmas|xmas|new year|halloween|thanksgiving|nowruz|mardi|fat tuesday|shrove|boxing day|st patricks|valentine|hijri|islamic|parsi|persian|vietnamese|chinese|santa|father christmas/i },
  { key: "sport", name: "Sport", ru: "Спорт", color: "#188038", match: /football|soccer|basketball|baseball|tennis|golf|swim|ski|running|jog|gym|fitness|yoga|boxing|judo|karate|aikido|jiu|jujutsu|taekwondo|wrestling|rugby|cricket|hockey|cycling|bike|bmx|archery|shooting|rowing|canoe|kayak|sailing|diving|gymnastics|triathlon|volleyball|badminton|billiard|bowling|climbing|bouldering|crossfit|track|discus|javelin|hammer|shot put|handball|water polo|sprinting|equestrian|dressage|eventing|jumping/i },
  { key: "food", name: "Food & meetings", ru: "Еда и встречи", color: "#f29900", match: /breakfast|brunch|lunch|luncheon|dinner|meal|restaurant|coffee|beer|wine|cocktail|drinks|bbq|barbecue|barbeque|cooking|cook|prepare|make|candle|romantic|family meal/i },
  { key: "study", name: "Study & code", ru: "Учёба и код", color: "#1a73e8", match: /school|class|course|code|coding|programming|computer science|web development|web programming|hackathon|codecademy|rails|english|french|german|practice/i },
  { key: "arts", name: "Music & arts", ru: "Музыка и искусство", color: "#9334e6", match: /music|concert|gig|opera|orchestra|choir|ballet|dance|dancing|theater|theatre|movie|cinema|art|drawing|sketching|painting|cello|clarinet|flute|guitar|piano|saxophone|trombone|trumpet|tuba|violin|contrabass|cornett|oboe|string quartet|singing/i },
  { key: "service", name: "Home & service", ru: "Дом и сервис", color: "#007b83", match: /clean|tidy|vacuum|plumber|electrician|handyman|fridge|auto|car|tire|oil|mechanic|repair|maintenance|service|hair|haircut|hairdresser|dental|dentist|teeth|manicure|pedicure|massage|back rub/i },
  { key: "events", name: "Events", ru: "События", color: "#d01884", match: /birthday|wedding|baby shower|bachelorette|stag|hen|graduation|party|invitations|quinceanera|date night|ladies night|pride|parade|march|christopher street|dyke|lesbian|gay/i },
  { key: "rest", name: "Rest", ru: "Отдых", color: "#7c5c00", match: /vacation|camping|hike|hiking|walk|walking|dog|boat|cruise|nap|sleep|relaxing|resting|reading|book club|ebook|newspaper|video game|games done quick|agdq|sgdq/i },
  { key: "craft", name: "Craft", ru: "Рукоделие", color: "#875900", match: /crochet|embroidery|felting|handicraft|knitting|millinery|patchwork|quilting|sewing|diy/i },
  { key: "planning", name: "Planning", ru: "Планирование", color: "#5f6368", match: /plan|planning|reach out|write letter/i },
  { key: "other", name: "Other", ru: "Другое", color: "#3c4043", match: /.*/i }
];

export const categories = [{ key: "all", name: "All", ru: "Все", color: "#2563eb" }, ...categoryRules];
