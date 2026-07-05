import { categoryRules } from "./constants.js";

// Vite glob import to read all json files at build time!
const jsonFiles = import.meta.glob('../data/*.json', { eager: true });

export function getLanguageOptions() {
  const options = Object.keys(jsonFiles)
    .map((path) => {
      const parts = path.split('/');
      return parts[parts.length - 1].replace(".json", "");
    })
    .map((code) => {
      let label = code;
      try {
        const display = new Intl.DisplayNames(["en"], { type: "language" });
        label = display.of(code) || code;
      } catch {}
      return [code, label];
    })
    .sort((a, b) => {
      if (a[0] === "en") return -1;
      if (b[0] === "en") return 1;
      if (a[0] === "ru") return -1;
      if (b[0] === "ru") return 1;
      return a[0].localeCompare(b[0]);
    });
  return options;
}

/**
 * Detects the system/browser language from `navigator` and matches it against supported languages.
 * 
 * Example of what might end up in `browserLangs`:
 * - ["en-US", "en", "ru-RU", "ru"] (from navigator.languages)
 * - ["ru-RU"] (fallback from navigator.language)
 */
export function detectLanguage(supportedLanguages) {
  if (typeof navigator === "undefined") return "en";
  const browserLangs = navigator.languages || [navigator.language || navigator.userLanguage];
  for (const bLang of browserLangs) {
    if (!bLang) continue;
    const code = bLang.split("-")[0].toLowerCase();
    if (supportedLanguages.some(([langCode]) => langCode === code)) {
      return code;
    }
  }
  return "en";
}

export function getFlairsForLanguage(lang = "en") {
  const englishPayload = jsonFiles['../data/en.json'].default || jsonFiles['../data/en.json'];
  const englishEntries = englishPayload?.[0]?.[1] ?? [];
  
  let targetMap = new Map();
  if (lang !== "en") {
     const targetPath = `../data/${lang}.json`;
     const targetPayload = jsonFiles[targetPath]?.default || jsonFiles[targetPath];
     if (targetPayload) {
       const targetEntries = targetPayload?.[0]?.[1] ?? [];
       targetMap = new Map(targetEntries);
     }
  }

  const getShortestAssociation = (associations, fallback) => {
    return [...associations]
      .sort((a, b) => a.text.length - b.text.length || a.text.localeCompare(b.text))
      .at(0)?.text || fallback;
  };

  const getCategory = (item) => {
    const haystack = [item.code, ...item.associationsEn.map(({ text }) => text)].join(" ");
    return categoryRules.find((rule) => rule.match.test(haystack)) || categoryRules.at(-1);
  };

  const flairs = englishEntries
    .map(([code, associations]) => {
      const associationsEn = associations.map(([weight, text]) => ({
        weight,
        text: String(text).trim(),
      }));
      const shortestEn = getShortestAssociation(associationsEn, code);

      let currentAssoc = associationsEn;
      let uiShortest = shortestEn;
      
      if (lang !== "en") {
        const targetTarget = targetMap.get(code);
        if (targetTarget) {
           const targetAssoc = targetTarget.map(([weight, text]) => ({
              weight,
              text: String(text).trim(),
           }));
           currentAssoc = targetAssoc;
           uiShortest = getShortestAssociation(targetAssoc, shortestEn);
        }
      }

      const item = {
        key: code,
        code,
        image: code,
        associationsEn,
        shortestEn,
        countEn: associationsEn.length,
        wordsEn: associationsEn.map(({ text }) => text).join(", "),
        searchEn: [code, ...associationsEn.map(({ text }) => text)].join(" ").toLowerCase(),
        
        uiShortest,
        uiCount: currentAssoc.length,
        uiWords: currentAssoc.map(({ text }) => text).join(", "),
        uiSearch: [code, ...currentAssoc.map(({ text }) => text)].join(" ").toLowerCase(),
      };

      const fullCategory = getCategory(item);
      const { match, ...safeCategory } = fullCategory;
      return {
        ...item,
        category: safeCategory
      };
    })
    .sort((a, b) => a.uiShortest.localeCompare(b.uiShortest));

  return flairs;
}
