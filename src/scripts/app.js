import { loadLanguageMap } from "./flairs.js";
import { getCardRecords, getElements } from "./app/dom.js";
import { createI18n } from "./app/i18n.js";
import { ensureShell } from "./app/shell.js";
import { createCardController } from "./app/cards.js";
import { applyFilterStyles, applyI18n } from "./app/ui.js";

const state = {
  query: "",
  category: "all",
  language: "en"
};

ensureShell();

const elements = getElements();
const cardRecords = getCardRecords(elements.grid);
const i18n = createI18n();
const cards = createCardController({
  cardRecords,
  elements,
  state,
  t: (key) => i18n.t(key)
});

/**
 * Загружает переводы интерфейса и ассоциации карточек для выбранного языка.
 *
 * @param {string} language
 * @returns {Promise<void>}
 */
async function applyLanguage(language) {
  const requestId = i18n.beginLanguageRequest();
  const [uiStrings, categoryLabels, languageMap] = await Promise.all([
    i18n.resolveUiStrings(language),
    i18n.resolveCategoryLabels(language),
    language === "en" ? Promise.resolve(null) : loadLanguageMap(language)
  ]);

  if (!i18n.isLatestLanguageRequest(requestId)) {
    return;
  }

  state.language = i18n.setActiveLanguage({
    language,
    uiStrings,
    categoryLabels
  });

  applyI18n({ elements, state, t: i18n.t });
  applyFilterStyles({ elements, state, categoryName: i18n.categoryName });

  if (language === "en") {
    cards.applyEnglishCardContent();
  } else {
    cards.applyLanguageCardContent(languageMap);
  }

  cards.syncVisibility();
}

/**
 * Показывает временное toast-сообщение.
 *
 * @param {string} text
 * @returns {void}
 */
function showToast(text) {
  elements.toast.textContent = text;
  elements.toast.classList.add("is-visible");

  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    elements.toast.classList.remove("is-visible");
  }, 1200);
}

/**
 * Копирует текст в буфер обмена с fallback через `textarea`.
 *
 * @param {string} text
 * @returns {Promise<void>}
 */
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    document.body.append(area);
    area.select();
    document.execCommand("copy");
    area.remove();
  }
}

/**
 * Подписывает все обработчики после появления shell-разметки в DOM.
 *
 * @returns {void}
 */
function bindEvents() {
  elements.search.addEventListener("input", (event) => {
    state.query = event.target.value;
    cards.syncVisibility();
  });

  elements.language.addEventListener("change", async (event) => {
    await applyLanguage(event.target.value);
  });

  elements.filters.addEventListener("click", (event) => {
    const button = event.target.closest("[data-category]");
    if (!button) return;

    state.category = button.dataset.category;
    applyFilterStyles({ elements, state, categoryName: i18n.categoryName });
    cards.syncVisibility();
  });

  elements.grid.addEventListener("click", async (event) => {
    const action = event.target.closest("[data-action]");
    const card = event.target.closest("[data-card]");

    if (action) {
      const { action: kind, key, copy, format } = action.dataset;

      if (kind === "set-format" && key && format) {
        cards.setFormat(key, format);
        return;
      }

      if (kind === "toggle-panel" && key) {
        cards.setExpandedCard(key);
        return;
      }

      if (kind === "close-panel") {
        cards.closeExpandedCard();
        return;
      }

      if (kind === "copy" && copy) {
        await copyText(copy);
        showToast(`${i18n.t("copied")}: ${copy}`);
        return;
      }
    }

    if (card) {
      if (card.classList.contains("is-expanded")) {
        return;
      }

      cards.openImage(card.dataset.card);
    }
  });

  elements.imageDialog?.addEventListener("click", (event) => {
    const surface = event.target.closest(".image-dialog__surface");
    if (!surface) {
      elements.imageDialog.close();
    }
  });

  elements.imageDialog?.addEventListener("close", () => {
    elements.imageDialogMedia.removeAttribute("src");
    elements.imageDialogMedia.removeAttribute("alt");
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") {
      return;
    }

    if (elements.imageDialog?.open) {
      elements.imageDialog.close();
      return;
    }

    if (cards.closeExpandedCard()) {
      event.preventDefault();
    }
  });
}

/**
 * Инициализирует приложение после готовности статического HTML или fallback-shell.
 *
 * @returns {Promise<void>}
 */
export async function initApp() {
  bindEvents();
  applyI18n({ elements, state, t: i18n.t });
  applyFilterStyles({ elements, state, categoryName: i18n.categoryName });
  cards.syncCardMedia();
  cards.syncVisibility();
}
