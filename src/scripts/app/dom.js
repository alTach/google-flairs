/**
 * Собирает основные DOM-элементы, с которыми работает приложение.
 *
 * @returns {{
 *   grid: HTMLElement | null,
 *   empty: HTMLElement | null,
 *   search: HTMLInputElement | null,
 *   language: HTMLSelectElement | null,
 *   filters: HTMLElement | null,
 *   totalCount: HTMLElement | null,
 *   visibleCount: HTMLElement | null,
 *   groupCount: HTMLElement | null,
 *   langLabel: HTMLElement | null,
 *   toast: HTMLElement | null,
 *   sourceBadge: HTMLElement | null,
 *   imageDialog: HTMLDialogElement | null,
 *   imageDialogMedia: HTMLImageElement | null
 * }}
 */
export function getElements() {
  return {
    grid: document.querySelector("#grid"),
    empty: document.querySelector("#empty"),
    search: document.querySelector("#search"),
    language: document.querySelector("#language"),
    filters: document.querySelector("#filters"),
    totalCount: document.querySelector("#totalCount"),
    visibleCount: document.querySelector("#visibleCount"),
    groupCount: document.querySelector("#groupCount"),
    langLabel: document.querySelector("#langLabel"),
    toast: document.querySelector("#toast"),
    sourceBadge: document.querySelector("#sourceBadge"),
    imageDialog: document.querySelector("#imageDialog"),
    imageDialogMedia: document.querySelector("#imageDialogMedia")
  };
}

/**
 * Кэширует полезные DOM-ссылки для каждой карточки в сетке.
 *
 * @param {HTMLElement} grid
 * @returns {Array<{
 *   key: string,
 *   card: HTMLElement,
 *   code: string,
 *   image: string,
 *   previewImage: HTMLImageElement,
 *   copyButton: HTMLElement | null,
 *   countButton: HTMLElement | null,
 *   panel: HTMLElement | null,
 *   panelWords: HTMLElement | null,
 *   panelHint: HTMLElement | null,
 *   panelTitle: HTMLElement | null
 * }>}
 */
export function getCardRecords(grid) {
  return Array.from(grid.querySelectorAll("[data-card]")).map((card) => ({
    key: card.dataset.card,
    card,
    code: card.dataset.code,
    image: card.dataset.image,
    previewImage: card.querySelector(".flair-card__image"),
    copyButton: card.querySelector("[data-role='copy']"),
    countButton: card.querySelector("[data-role='count']"),
    panel: card.querySelector(".flair-card__panel"),
    panelWords: card.querySelector("[data-role='words']"),
    panelHint: card.querySelector("[data-role='hint']"),
    panelTitle: card.querySelector("[data-role='panel-title']")
  }));
}
