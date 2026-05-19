import { categories } from "../constants.js";

/**
 * Применяет переведённые UI-строки и aria-атрибуты к текущему документу.
 *
 * @param {{
 *   elements: {
 *     search: HTMLInputElement,
 *     language: HTMLSelectElement,
 *     langLabel: HTMLElement,
 *     sourceBadge: HTMLElement
 *   },
 *   state: { language: string },
 *   t: (key: string) => string
 * }} options
 * @returns {void}
 */
export function applyI18n({ elements, state, t }) {
  document.documentElement.lang = state.language;
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });

  elements.search.placeholder = t("search");
  elements.language.title = t("translatorHint");
  elements.langLabel.textContent = state.language.toUpperCase();
  elements.sourceBadge.textContent = t("sourceSnapshot");
  document.querySelectorAll(".image-dialog__close, .flair-card__close").forEach((button) => {
    button.setAttribute("aria-label", t("close"));
  });
}

/**
 * Обновляет подписи фильтров и их активные стили для текущего языка.
 *
 * @param {{
 *   elements: { filters: HTMLElement },
 *   state: { category: string },
 *   categoryName: (category: { key: string, name: string }) => string
 * }} options
 * @returns {void}
 */
export function applyFilterStyles({ elements, state, categoryName }) {
  elements.filters.querySelectorAll("[data-category]").forEach((button) => {
    const category = categories.find((item) => item.key === button.dataset.category);
    if (!category) return;

    const active = button.dataset.category === state.category;
    const background = active
      ? category.color
      : `color-mix(in srgb, ${category.color} 12%, white)`;
    const color = active ? "#ffffff" : `color-mix(in srgb, ${category.color} 74%, #0f172a)`;

    button.style.background = background;
    button.style.borderColor = `color-mix(in srgb, ${category.color} 35%, #cbd5e1)`;
    button.style.color = color;
    button.textContent = categoryName(category);
  });
}
