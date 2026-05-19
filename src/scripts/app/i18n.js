import { UI, categories } from "../constants.js";

const defaultCategoryLabels = new Map(categories.map((category) => [category.key, category.name]));
const uiCache = new Map([["en", UI.en]]);
const categoryLabelCache = new Map([["en", defaultCategoryLabels]]);
const translatorCache = new Map();

/**
 * Создаёт helpers для перевода интерфейса и защиты от гонок асинхронных запросов.
 *
 * @returns {{
 *   t: (key: string) => string,
 *   categoryName: (category: { key: string, name: string }) => string,
 *   setActiveLanguage: (payload: { language: string, uiStrings: Record<string, string>, categoryLabels: Map<string, string> }) => string,
 *   beginLanguageRequest: () => number,
 *   isLatestLanguageRequest: (requestId: number) => boolean,
 *   resolveUiStrings: (language: string) => Promise<Record<string, string>>,
 *   resolveCategoryLabels: (language: string) => Promise<Map<string, string>>
 * }}
 */
export function createI18n() {
  let activeUi = UI.en;
  let activeCategoryLabels = defaultCategoryLabels;
  let languageRequestId = 0;

  /**
   * Возвращает текущую переведённую строку интерфейса по ключу.
   *
   * @param {string} key
   * @returns {string}
   */
  function t(key) {
    return activeUi[key] || UI.en[key] || key;
  }

  /**
   * Возвращает переведённое название категории.
   *
   * @param {{ key: string, name: string }} category
   * @returns {string}
   */
  function categoryName(category) {
    return activeCategoryLabels.get(category.key) || category.name;
  }

  /**
   * Сохраняет текущий активный набор переводов интерфейса.
   *
   * @param {{ language: string, uiStrings: Record<string, string>, categoryLabels: Map<string, string> }} payload
   * @returns {string}
   */
  function setActiveLanguage({ language, uiStrings, categoryLabels }) {
    activeUi = uiStrings;
    activeCategoryLabels = categoryLabels;
    return language;
  }

  /**
   * Начинает новый цикл асинхронной загрузки языка.
   *
   * @returns {number}
   */
  function beginLanguageRequest() {
    languageRequestId += 1;
    return languageRequestId;
  }

  /**
   * Проверяет, относится ли ответ всё ещё к последнему запросу языка.
   *
   * @param {number} requestId
   * @returns {boolean}
   */
  function isLatestLanguageRequest(requestId) {
    return requestId === languageRequestId;
  }

  return {
    t,
    categoryName,
    setActiveLanguage,
    beginLanguageRequest,
    isLatestLanguageRequest,
    resolveUiStrings,
    resolveCategoryLabels
  };
}

/**
 * Преобразует локаль приложения в формат, понятный browser translator API.
 *
 * @param {string} language
 * @returns {string}
 */
function getTranslatorTargetLanguage(language) {
  if (language === "zh-TW") return "zh-Hant";
  if (language === "zh-CN") return "zh";
  return language;
}

/**
 * Создаёт или переиспользует экземпляр браузерного переводчика для UI из `en`.
 *
 * @param {string} language
 * @returns {Promise<Translator | null>}
 */
async function getTranslator(language) {
  if (language === "en" || !("Translator" in globalThis)) {
    return null;
  }

  const targetLanguage = getTranslatorTargetLanguage(language);
  const cacheKey = `en:${targetLanguage}`;

  if (translatorCache.has(cacheKey)) {
    return translatorCache.get(cacheKey);
  }

  const translatorPromise = (async () => {
    try {
      const availability = await Translator.availability({
        sourceLanguage: "en",
        targetLanguage
      });

      if (availability === "unavailable") {
        return null;
      }

      return await Translator.create({
        sourceLanguage: "en",
        targetLanguage
      });
    } catch {
      return null;
    }
  })();

  translatorCache.set(cacheKey, translatorPromise);
  return translatorPromise;
}

/**
 * Переводит массив строк через browser translator API.
 *
 * @param {string} language
 * @param {string[]} texts
 * @returns {Promise<string[] | null>}
 */
async function translateTexts(language, texts) {
  const translator = await getTranslator(language);
  if (!translator) return null;

  try {
    return await Promise.all(texts.map((text) => translator.translate(text)));
  } catch {
    return null;
  }
}

/**
 * Получает и кэширует переводы UI-строк для целевого языка.
 *
 * @param {string} language
 * @returns {Promise<Record<string, string>>}
 */
async function resolveUiStrings(language) {
  if (uiCache.has(language)) {
    return uiCache.get(language);
  }

  const keys = Object.keys(UI.en);
  const translated = await translateTexts(language, keys.map((key) => UI.en[key]));

  if (translated) {
    const uiStrings = Object.fromEntries(keys.map((key, index) => [key, translated[index] || UI.en[key]]));
    uiCache.set(language, uiStrings);
    return uiStrings;
  }

  uiCache.set(language, UI.en);
  return UI.en;
}

/**
 * Получает и кэширует переводы названий категорий для целевого языка.
 *
 * @param {string} language
 * @returns {Promise<Map<string, string>>}
 */
async function resolveCategoryLabels(language) {
  if (categoryLabelCache.has(language)) {
    return categoryLabelCache.get(language);
  }

  const translated = await translateTexts(language, categories.map((category) => category.name));

  if (translated) {
    const labels = new Map(categories.map((category, index) => [category.key, translated[index] || category.name]));
    categoryLabelCache.set(language, labels);
    return labels;
  }

  const fallbackLabels = new Map(categories.map((category) => [category.key, category.name]));
  categoryLabelCache.set(language, fallbackLabels);
  return fallbackLabels;
}
