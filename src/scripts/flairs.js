import englishData from "../data/en.json";
import { categories, categoryRules } from "./constants.js";

const languageModules = import.meta.glob("../data/*.json", {
  import: "default"
});

/**
 * Нормализует текст для поиска: приводит к нижнему регистру и убирает шум.
 *
 * @param {unknown} text
 * @returns {string}
 */
export const normalize = (text) =>
  String(text ?? "")
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/**
 * Возвращает URL `svg`-версии flair-изображения по коду.
 *
 * @param {string} code
 * @returns {string}
 */
export const svgUrl = (code) =>
  `https://ssl.gstatic.com/calendar/images/eventillustrations/2024_v2/img_${code}.svg`;

/**
 * Возвращает URL `jpg`-версии flair-изображения по коду.
 *
 * @param {string} code
 * @returns {string}
 */
export const jpgUrl = (code) =>
  `https://ssl.gstatic.com/tmly/f8944938hffheth4ew890ht4i8/flairs/xxhdpi/img_${code}.jpg`;

/**
 * Возвращает URL изображения в нужном формате.
 *
 * @param {string} code
 * @param {string} [format="svg"]
 * @returns {string}
 */
export const getImageUrl = (code, format = "svg") => (format === "img" ? jpgUrl(code) : svgUrl(code));

/**
 * Извлекает массив языковых записей из исходного JSON-пакета.
 *
 * @param {unknown} payload
 * @returns {Array}
 */
export function parseLanguageEntries(payload) {
  return payload?.[0]?.[1] ?? [];
}

/**
 * Получает код языка из пути к JSON-файлу.
 *
 * @param {string} path
 * @returns {string}
 */
export function getLanguageCode(path) {
  return path.split("/").at(-1)?.replace(".json", "") ?? "";
}

/**
 * Преобразует сырой языковой пакет в карту `код -> ассоциации`.
 *
 * @param {unknown} payload
 * @returns {Map<string, Array<{weight: unknown, text: string}>>}
 */
export function buildLanguageMap(payload) {
  return new Map(
    parseLanguageEntries(payload).map(([code, associations]) => [
      code,
      associations.map(([weight, text]) => ({
        weight,
        text: String(text).trim()
      }))
    ])
  );
}

/**
 * Возвращает самую короткую ассоциацию для карточки или fallback-значение.
 *
 * @param {Array<{text: string}>} associations
 * @param {string} fallback
 * @returns {string}
 */
export function getShortestAssociation(associations, fallback) {
  return [...associations]
    .sort((a, b) => a.text.length - b.text.length || a.text.localeCompare(b.text))
    .at(0)?.text || fallback;
}

const englishMap = buildLanguageMap(englishData);
const languageCache = new Map([["en", englishMap]]);

/**
 * Возвращает человекочитаемую подпись языка по его коду.
 *
 * @param {string} code
 * @returns {string}
 */
export function getLanguageLabel(code) {
  try {
    const display = new Intl.DisplayNames(["en"], { type: "language" });
    return display.of(code) || code;
  } catch {
    return code;
  }
}

/**
 * Сортирует коды языков для списка выбора, поднимая `en` и `ru` выше остальных.
 *
 * @param {string} a
 * @param {string} b
 * @returns {number}
 */
function sortLanguageCodes(a, b) {
  if (a === "en") return -1;
  if (b === "en") return 1;
  if (a === "ru") return -1;
  if (b === "ru") return 1;
  return a.localeCompare(b);
}

export const languageOptions = Object.keys(languageModules)
  .map(getLanguageCode)
  .sort(sortLanguageCodes)
  .map((code) => [code, getLanguageLabel(code)]);

export const flairItems = [...englishMap.entries()]
  .map(([code, associationsEn]) => {
    const shortestEn = getShortestAssociation(associationsEn, code);

    return {
      key: code,
      code,
      image: code,
      associationsEn,
      shortestEn,
      countEn: associationsEn.length,
      wordsEn: associationsEn.map(({ text }) => text).join(", "),
      searchEn: [code, ...associationsEn.map(({ text }) => text)].join(" ").toLowerCase()
    };
  })
  .sort((a, b) => a.shortestEn.localeCompare(b.shortestEn));

/**
 * Определяет категорию карточки по её коду и английским ассоциациям.
 *
 * @param {{ code: string, associationsEn: Array<{text: string}> }} item
 * @returns {{ key: string, name: string, color: string, match: RegExp }}
 */
export function getCategory(item) {
  const haystack = [item.code, ...item.associationsEn.map(({ text }) => text)].join(" ");
  return categoryRules.find((rule) => rule.match.test(haystack)) || categoryRules.at(-1);
}

export { categories };

/**
 * Загружает и кэширует карту ассоциаций для выбранного языка.
 *
 * @param {string} language
 * @returns {Promise<Map<string, Array<{weight: unknown, text: string}>>>}
 */
export async function loadLanguageMap(language) {
  if (languageCache.has(language)) {
    return languageCache.get(language);
  }

  const loaderEntry = Object.entries(languageModules).find(([path]) => getLanguageCode(path) === language);
  if (!loaderEntry) {
    return englishMap;
  }

  const [, loader] = loaderEntry;
  const payload = await loader();
  const languageMap = buildLanguageMap(payload);
  languageCache.set(language, languageMap);
  return languageMap;
}
