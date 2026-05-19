import { UI } from "../constants.js";
import { categories, flairItems, getCategory, getImageUrl, languageOptions } from "../flairs.js";
import { escapeAttribute, escapeHtml } from "./utils.js";

/**
 * Рендерит одну статистическую плитку во fallback-shell.
 *
 * @param {string} id
 * @param {string} i18nKey
 * @param {string} value
 * @returns {string}
 */
function renderStatCard(id, i18nKey, value) {
  return `
    <div class="stat-card">
      <strong class="stat-card__value" id="${id}">${escapeHtml(value)}</strong>
      <span class="stat-card__label" data-i18n="${i18nKey}">${escapeHtml(UI.en[i18nKey] || i18nKey)}</span>
    </div>
  `;
}

/**
 * Рендерит одну кнопку фильтра категории во fallback-shell.
 *
 * @param {{ key: string, name: string, color: string }} category
 * @returns {string}
 */
function renderFilterChip(category) {
  const active = category.key === "all";
  const background = active ? category.color : `color-mix(in srgb, ${category.color} 12%, white)`;
  const color = active ? "#ffffff" : `color-mix(in srgb, ${category.color} 74%, #0f172a)`;

  return `
    <button
      class="filter-chip"
      type="button"
      style="background:${background};border-color:color-mix(in srgb, ${category.color} 35%, #cbd5e1);color:${color}"
      data-category="${category.key}"
    >${escapeHtml(category.name)}</button>
  `;
}

/**
 * Рендерит одну заранее подготовленную flair-карточку для клиентского fallback-shell.
 *
 * @param {{
 *   key: string,
 *   code: string,
 *   image: string,
 *   searchEn: string,
 *   shortestEn: string,
 *   wordsEn: string,
 *   countEn: number
 * }} item
 * @returns {string}
 */
function renderCardMarkup(item) {
  const category = getCategory(item);

  return `
    <article
      class="flair-card"
      style="border-color:color-mix(in srgb, ${category.color} 24%, #cbd5e1)"
      data-card="${item.key}"
      data-category="${category.key}"
      data-code="${escapeAttribute(item.code)}"
      data-image="${item.image}"
      data-search-en="${escapeAttribute(item.searchEn)}"
      data-current-search="${escapeAttribute(item.searchEn)}"
      data-copy-en="${escapeAttribute(item.shortestEn)}"
      data-words-en="${escapeAttribute(item.wordsEn)}"
      data-count-en="${item.countEn}"
      data-format="svg"
    >
      <button class="flair-card__preview" type="button">
        <img class="flair-card__image" src="${getImageUrl(item.image, "svg")}" alt="${escapeAttribute(item.shortestEn)}" loading="lazy" decoding="async" />
        <span class="flair-card__veil"></span>
      </button>
      <div class="flair-card__switch" role="tablist" aria-label="Image format">
        <button class="flair-card__switch-option is-active" type="button" role="tab" aria-selected="true" data-action="set-format" data-key="${item.key}" data-format="svg">svg</button>
        <button class="flair-card__switch-option" type="button" role="tab" aria-selected="false" data-action="set-format" data-key="${item.key}" data-format="img">img</button>
      </div>
      <div class="flair-card__body">
        <div class="flair-card__meta">
          <button class="flair-card__copy" type="button" data-action="copy" data-copy="${escapeAttribute(item.shortestEn)}" data-role="copy">${escapeHtml(item.shortestEn)}</button>
          <button class="flair-card__count cursor-pointer" type="button" data-action="toggle-panel" data-key="${item.key}" data-role="count">+${item.countEn}</button>
        </div>
      </div>
      <div class="flair-card__panel">
        <button class="flair-card__close" type="button" aria-label="Close" data-action="close-panel">×</button>
        <p class="flair-card__hint" data-role="hint">${escapeHtml(UI.en.revealHint)}</p>
        <p class="flair-card__panel-title" data-role="panel-title">${escapeHtml(UI.en.associationsTitle)}</p>
        <p class="flair-card__words" data-role="words">${escapeHtml(item.wordsEn)}</p>
      </div>
    </article>
  `;
}

/**
 * Собирает полный HTML shell, если серверная Pug-разметка недоступна.
 *
 * @returns {string}
 */
export function renderAppShell() {
  return `
    <main class="page-shell">
      <section class="hero-grid">
        <div class="hero-panel surface">
          <span class="info-pill" id="sourceBadge">${escapeHtml(UI.en.sourceSnapshot)}</span>
          <div class="hero-panel__eyebrow" data-i18n="eyebrow">${escapeHtml(UI.en.eyebrow)}</div>
          <h1 class="hero-panel__title" data-i18n="title">${escapeHtml(UI.en.title)}</h1>
          <p class="hero-panel__lead" data-i18n="lead">${escapeHtml(UI.en.lead)}</p>
        </div>
        <aside class="stats-panel surface">
          ${renderStatCard("totalCount", "codesTotal", String(flairItems.length))}
          ${renderStatCard("visibleCount", "cardsVisible", String(flairItems.length))}
          ${renderStatCard("groupCount", "groups", String(languageOptions.length))}
          ${renderStatCard("langLabel", "language", "EN")}
        </aside>
      </section>
      <section class="controls surface">
        <label class="sr-only" for="search">Search</label>
        <input class="control-input" id="search" type="search" placeholder="${escapeAttribute(UI.en.search)}" autocomplete="off" />
        <label class="sr-only" for="language">Language</label>
        <select class="control-select" id="language" title="${escapeAttribute(UI.en.translatorHint)}">
          ${languageOptions.map(([code, label]) => `<option value="${code}"${code === "en" ? " selected" : ""}>${escapeHtml(label)}</option>`).join("")}
        </select>
      </section>
      <section class="filters-wrap">
        <div class="filters" id="filters" aria-label="Flair categories">
          ${categories.map(renderFilterChip).join("")}
        </div>
      </section>
      <section class="card-grid" id="grid" aria-live="polite">
        ${flairItems.map(renderCardMarkup).join("")}
      </section>
      <div class="empty-state hidden" id="empty" data-i18n="empty">${escapeHtml(UI.en.empty)}</div>
    </main>
    <div class="toast" id="toast" role="status" aria-live="polite">${escapeHtml(UI.en.copied)}</div>
    <dialog class="image-dialog" id="imageDialog">
      <form class="image-dialog__surface" method="dialog">
        <button class="image-dialog__close" type="submit" aria-label="${escapeAttribute(UI.en.close)}">×</button>
        <img class="image-dialog__media" id="imageDialogMedia" src="" alt="" />
      </form>
    </dialog>
  `;
}

/**
 * Гарантирует, что у страницы есть рабочий shell до привязки обработчиков.
 *
 * @returns {void}
 */
export function ensureShell() {
  if (document.querySelector("#grid")) return;
  document.body.innerHTML = renderAppShell();
}
