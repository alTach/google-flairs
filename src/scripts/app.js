import { UI } from "./constants.js";
import {
  categories,
  flairItems,
  getCategory,
  getImageUrl,
  getShortestAssociation,
  languageOptions,
  loadLanguageMap,
  normalize
} from "./flairs.js";

const state = {
  query: "",
  category: "all",
  language: "en"
};

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll('"', "&quot;");
}

ensureShell();

const elements = getElements();

const cardRecords = Array.from(elements.grid.querySelectorAll("[data-card]")).map((card) => ({
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

function getElements() {
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

function ensureShell() {
  if (document.querySelector("#grid")) return;

  document.body.innerHTML = renderAppShell();
}

function renderAppShell() {
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
        <select class="control-select" id="language" title="Uses browser Translator API when available">
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
        <button class="image-dialog__close" type="submit" aria-label="Close">×</button>
        <img class="image-dialog__media" id="imageDialogMedia" src="" alt="" />
      </form>
    </dialog>
  `;
}

function renderStatCard(id, i18nKey, value) {
  return `
    <div class="stat-card">
      <strong class="stat-card__value" id="${id}">${escapeHtml(value)}</strong>
      <span class="stat-card__label" data-i18n="${i18nKey}">${escapeHtml(i18nKey)}</span>
    </div>
  `;
}

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
      data-label-en="${escapeAttribute(category.name)}"
      data-label-ru="${escapeAttribute(category.ru || category.name)}"
    >${escapeHtml(category.name)}</button>
  `;
}

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
          <button class="flair-card__count" type="button" data-action="toggle-panel" data-key="${item.key}" data-role="count">+${item.countEn}</button>
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

function t(key) {
  const lang = state.language === "ru" ? "ru" : "en";
  return UI[lang]?.[key] || UI.en[key] || key;
}

function categoryName(category) {
  return state.language === "ru" ? category.ru || category.name : category.name;
}

function showToast(text) {
  elements.toast.textContent = text;
  elements.toast.classList.add("is-visible");

  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    elements.toast.classList.remove("is-visible");
  }, 1200);
}

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

function getFormat(card) {
  return card.dataset.format || "svg";
}

function getRecord(key) {
  return cardRecords.find((record) => record.key === key) || null;
}

function applyI18n() {
  document.documentElement.lang = state.language;
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });

  elements.search.placeholder = t("search");
  elements.langLabel.textContent = state.language.toUpperCase();
  elements.sourceBadge.textContent = t("sourceSnapshot");
}

function applyFilterStyles() {
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

function syncCardMedia(targetKey) {
  const records = targetKey ? cardRecords.filter((record) => record.key === targetKey) : cardRecords;

  records.forEach(({ card, previewImage }) => {
    const markReady = () => card.classList.add("is-media-ready");

    if (previewImage.complete && previewImage.naturalWidth > 0) {
      markReady();
      return;
    }

    card.classList.remove("is-media-ready");
    previewImage.addEventListener("load", markReady, { once: true });
    previewImage.addEventListener("error", markReady, { once: true });
  });
}

function getVisibleRecords() {
  const query = normalize(state.query);

  return cardRecords.filter(({ card }) => {
    const searchBlob = `${card.dataset.searchEn || ""} ${card.dataset.currentSearch || ""}`.trim();
    const matchesCategory = state.category === "all" || card.dataset.category === state.category;
    const matchesQuery = !query || searchBlob.includes(query);
    return matchesCategory && matchesQuery;
  });
}

function syncVisibility() {
  const visibleRecords = getVisibleRecords();
  const visibleKeys = new Set(visibleRecords.map(({ key }) => key));

  cardRecords.forEach(({ key, card }) => {
    card.classList.toggle("hidden", !visibleKeys.has(key));
  });

  elements.visibleCount.textContent = String(visibleRecords.length);
  elements.empty.classList.toggle("hidden", visibleRecords.length > 0);
}

function setFormat(key, format) {
  const record = getRecord(key);
  if (!record || getFormat(record.card) === format) return;

  record.card.dataset.format = format;
  record.card.classList.remove("is-media-ready");
  record.previewImage.src = getImageUrl(record.image, format);
  record.previewImage.alt = record.copyButton?.dataset.copy || record.code;

  const markReady = () => record.card.classList.add("is-media-ready");
  record.previewImage.addEventListener("load", markReady, { once: true });
  record.previewImage.addEventListener("error", markReady, { once: true });

  record.card.querySelectorAll("[data-action='set-format']").forEach((button) => {
    const active = button.dataset.format === format;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-selected", String(active));
  });
}

function setExpandedCard(key) {
  const record = getRecord(key);
  const shouldExpand = !!record && !record.card.classList.contains("is-expanded");

  cardRecords.forEach(({ card, panel }) => {
    card.classList.remove("is-expanded");
    panel?.classList.remove("is-visible");
  });

  if (record && shouldExpand) {
    record.card.classList.add("is-expanded");
    record.panel?.classList.add("is-visible");
  }
}

function openImage(key) {
  const record = getRecord(key);
  if (!record) return;

  elements.imageDialogMedia.src = getImageUrl(record.image, getFormat(record.card));
  elements.imageDialogMedia.alt = record.copyButton?.dataset.copy || record.code;

  if (!elements.imageDialog.open) {
    elements.imageDialog.showModal();
  }
}

async function applyLanguage(language) {
  state.language = language;
  applyI18n();
  applyFilterStyles();

  if (language === "en") {
    cardRecords.forEach(({ card, code, copyButton, countButton, panelWords, previewImage }) => {
      const copy = card.dataset.copyEn || code;
      const count = card.dataset.countEn || "0";
      const words = card.dataset.wordsEn || "";

      card.dataset.currentSearch = card.dataset.searchEn || "";
      if (copyButton) {
        copyButton.textContent = copy;
        copyButton.dataset.copy = copy;
      }
      if (countButton) {
        countButton.textContent = `+${count}`;
      }
      if (panelWords) {
        panelWords.textContent = words;
      }
      if (previewImage) {
        previewImage.alt = copy;
      }
    });

    cardRecords.forEach(({ panelHint, panelTitle }) => {
      if (panelHint) panelHint.textContent = UI.en.revealHint;
      if (panelTitle) panelTitle.textContent = UI.en.associationsTitle;
    });

    syncVisibility();
    return;
  }

  const languageMap = await loadLanguageMap(language);

  cardRecords.forEach(({ key, code, card, copyButton, countButton, panelWords, previewImage, panelHint, panelTitle }) => {
    const associations = languageMap.get(key) || [];
    const copyFallback = card.dataset.copyEn || code;
    const wordsFallback = card.dataset.wordsEn || "";
    const countFallback = card.dataset.countEn || "0";
    const hasAssociations = associations.length > 0;
    const copy = hasAssociations ? getShortestAssociation(associations, copyFallback) : copyFallback;
    const words = hasAssociations ? associations.map(({ text }) => text).join(", ") : wordsFallback;
    const count = hasAssociations ? associations.length : countFallback;
    const search = hasAssociations
      ? [code, ...associations.map(({ text }) => text)].join(" ").toLowerCase()
      : card.dataset.searchEn || "";

    card.dataset.currentSearch = search;

    if (copyButton) {
      copyButton.textContent = copy;
      copyButton.dataset.copy = copy;
    }
    if (countButton) {
      countButton.textContent = `+${count}`;
    }
    if (panelWords) {
      panelWords.textContent = words;
    }
    if (previewImage) {
      previewImage.alt = copy;
    }
    if (panelHint) {
      panelHint.textContent = t("revealHint");
    }
    if (panelTitle) {
      panelTitle.textContent = t("associationsTitle");
    }
  });

  syncVisibility();
}

elements.search.addEventListener("input", (event) => {
  state.query = event.target.value;
  syncVisibility();
});

elements.language.addEventListener("change", async (event) => {
  await applyLanguage(event.target.value);
});

elements.filters.addEventListener("click", (event) => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  state.category = button.dataset.category;
  applyFilterStyles();
  syncVisibility();
});

elements.grid.addEventListener("click", async (event) => {
  const action = event.target.closest("[data-action]");
  const card = event.target.closest("[data-card]");

  if (action) {
    const { action: kind, key, copy, format } = action.dataset;

    if (kind === "set-format" && key && format) {
      setFormat(key, format);
      return;
    }

    if (kind === "toggle-panel" && key) {
      setExpandedCard(key);
      return;
    }

    if (kind === "close-panel") {
      const ownerCard = action.closest("[data-card]");
      if (ownerCard) {
        ownerCard.classList.remove("is-expanded");
        ownerCard.querySelector(".flair-card__panel")?.classList.remove("is-visible");
      }
      return;
    }

    if (kind === "copy" && copy) {
      await copyText(copy);
      showToast(`${t("copied")}: ${copy}`);
      return;
    }
  }

  if (card) {
    openImage(card.dataset.card);
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

export async function initApp() {
  applyI18n();
  applyFilterStyles();
  syncCardMedia();
  syncVisibility();
}
