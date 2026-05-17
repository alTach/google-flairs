import { categoryRules } from "./constants.js";

const languageModules = import.meta.glob("../data/*.json", {
  eager: true,
  import: "default"
});

export const normalize = (text) =>
  String(text ?? "")
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export const compact = (text) => normalize(text).replace(/\s+/g, "");

export const svgUrl = (code) =>
  `https://ssl.gstatic.com/calendar/images/eventillustrations/2024_v2/img_${code}.svg`;

export const jpgUrl = (code) =>
  `https://ssl.gstatic.com/tmly/f8944938hffheth4ew890ht4i8/flairs/xxhdpi/img_${code}.jpg`;

export const getImageUrl = (code, format = "svg") => (format === "img" ? jpgUrl(code) : svgUrl(code));

function parseLanguageEntries(payload) {
  return payload?.[0]?.[1] ?? [];
}

function getLanguageCode(path) {
  return path.split("/").at(-1)?.replace(".json", "") ?? "";
}

function getLanguageLabel(code) {
  try {
    const display = new Intl.DisplayNames([code], { type: "language" });
    const label = display.of(code);
    return label ? label[0].toUpperCase() + label.slice(1) : code;
  } catch {
    return code;
  }
}

function sortLanguageCodes(a, b) {
  if (a === "ru") return -1;
  if (b === "ru") return 1;
  if (a === "en") return -1;
  if (b === "en") return 1;
  return a.localeCompare(b);
}

const languageData = Object.entries(languageModules)
  .map(([path, payload]) => [getLanguageCode(path), parseLanguageEntries(payload)])
  .sort(([a], [b]) => sortLanguageCodes(a, b));

export const languageOptions = languageData.map(([code]) => [code, getLanguageLabel(code)]);

const itemsMap = new Map();

languageData.forEach(([language, entries]) => {
  entries.forEach(([code, associations]) => {
    const item = itemsMap.get(code) || {
      key: code,
      code,
      image: code,
      associationsByLanguage: {}
    };

    item.associationsByLanguage[language] = associations.map(([weight, text]) => ({
      weight,
      text: String(text).trim()
    }));

    itemsMap.set(code, item);
  });
});

export function getAssociations(item, language = "en") {
  return item.associationsByLanguage[language] || item.associationsByLanguage.en || [];
}

export function getShortestAssociation(item, language = "en") {
  return [...getAssociations(item, language)]
    .sort((a, b) => a.text.length - b.text.length || a.text.localeCompare(b.text))
    .at(0)?.text || item.code;
}

export function getAssociationCount(item, language = "en") {
  return getAssociations(item, language).length;
}

export function getCategory(item) {
  const englishAssociations = getAssociations(item, "en").map(({ text }) => text);
  const haystack = [item.code, ...englishAssociations].join(" ");
  return categoryRules.find((rule) => rule.match.test(haystack)) || categoryRules.at(-1);
}

export const flairItems = [...itemsMap.values()].sort((a, b) =>
  getShortestAssociation(a, "en").localeCompare(getShortestAssociation(b, "en"))
);
