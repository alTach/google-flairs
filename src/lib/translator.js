import { UI, categories } from './constants.js';

let translatorInstance = null;
let currentTargetLang = null;

/**
 * Try to get or create a Chrome Built-in AI Translator.
 * Returns null if unavailable.
 */
async function getOrCreateNativeTranslator(targetLanguage) {
  if (targetLanguage === currentTargetLang && translatorInstance) {
    return translatorInstance;
  }

  translatorInstance = null;
  currentTargetLang = targetLanguage;

  // 1. Modern API: global `Translator` (Chrome 138+)
  if (typeof Translator !== 'undefined') {
    try {
      const availability = await Translator.availability({
        sourceLanguage: 'en',
        targetLanguage,
      });
      if (availability === 'readily' || availability === 'after-download') {
        const t = await Translator.create({ sourceLanguage: 'en', targetLanguage });
        translatorInstance = t;
        return t;
      }
    } catch (err) {
      console.debug('[Translator API]:', err);
    }
  }

  // 2. Legacy: `self.translation` (Chrome 131–137)
  try {
    const api = self.translation;
    if (api) {
      const can = await api.canTranslate({ sourceLanguage: 'en', targetLanguage });
      if (can === 'readily' || can === 'after-download') {
        const t = await api.createTranslator({ sourceLanguage: 'en', targetLanguage });
        if (t.ready) await t.ready;
        translatorInstance = t;
        return t;
      }
    }
  } catch (err) {
    console.debug('[self.translation]:', err);
  }

  // 3. Oldest: `self.ai.translator` (early origin trial)
  try {
    const api = self.ai?.translator;
    if (api) {
      const caps = await api.capabilities();
      const can = caps.languagePairAvailable('en', targetLanguage);
      if (can === 'readily' || can === 'after-download') {
        const t = await api.create({ sourceLanguage: 'en', targetLanguage });
        if (t.ready) await t.ready;
        translatorInstance = t;
        return t;
      }
    }
  } catch (err) {
    console.debug('[self.ai.translator]:', err);
  }

  return null;
}

/**
 * Translate text via Google Translate REST API (fallback).
 */
async function translateViaRest(text, targetLanguage) {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLanguage}&dt=t&q=${encodeURIComponent(text)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  return json[0].map(s => s[0]).join('');
}

/**
 * Translate a single string.
 * 1) Chrome AI Translator (native, on-device)
 * 2) Google Translate REST API (fallback)
 * 3) Original text (if everything fails)
 */
export async function translateText(text, targetLanguage) {
  if (targetLanguage === 'en' || !text) return text;

  // Try native first
  try {
    const native = await getOrCreateNativeTranslator(targetLanguage);
    if (native) return await native.translate(text);
  } catch (err) {
    console.debug('[native translate]:', err);
  }

  // Fallback to REST
  try {
    return await translateViaRest(text, targetLanguage);
  } catch (err) {
    console.debug('[REST translate]:', err);
  }

  return text;
}

/**
 * Batch translate: tries native for all, falls back to REST per-string.
 */
async function batchTranslate(strings, targetLanguage) {
  // Try native translator first (much faster for batch)
  try {
    const native = await getOrCreateNativeTranslator(targetLanguage);
    if (native) {
      return await Promise.all(strings.map(s => native.translate(s)));
    }
  } catch (err) {
    console.debug('[native batch]:', err);
  }

  // Fallback: REST per-string
  return Promise.all(strings.map(s => translateViaRest(s, targetLanguage).catch(() => s)));
}

/**
 * Translate all UI strings.
 */
export async function translateUiStrings(language) {
  const baseUi = UI.en;
  if (language === 'en') return baseUi;

  const keys = Object.keys(baseUi);
  const values = keys.map(k => baseUi[k]);

  try {
    const results = await batchTranslate(values, language);
    const translated = { ...baseUi };
    keys.forEach((k, i) => { translated[k] = results[i]; });
    return translated;
  } catch (err) {
    console.error('UI translation failed:', err);
    return baseUi;
  }
}

/**
 * Translate category filter labels.
 */
export async function translateCategories(language) {
  if (language === 'en') return categories;

  const names = categories.map(c => c.name);

  try {
    const results = await batchTranslate(names, language);
    return categories.map((c, i) => ({ ...c, name: results[i] }));
  } catch (err) {
    console.error('Categories translation failed:', err);
    return categories;
  }
}
