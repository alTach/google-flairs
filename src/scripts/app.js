import { UI, categories } from "./constants.js";
import {
  flairItems,
  getAssociationCount,
  getAssociations,
  getCategory,
  getImageUrl,
  getShortestAssociation,
  languageOptions
} from "./flairs.js";

const DEFAULT_LANGUAGE = languageOptions.some(([code]) => code === "ru") ? "ru" : languageOptions[0]?.[0] || "en";

const state = {
  query: "",
  category: "all",
  language: DEFAULT_LANGUAGE,
  expandedKey: null,
  formatByKey: new Map(),
  visibleKeys: []
};

const elements = {
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

elements.language.innerHTML = languageOptions
  .map(
    ([code, label]) =>
      `<option value="${code}"${code === state.language ? " selected" : ""}>${label}</option>`
  )
  .join("");

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

function getFormat(key) {
  return state.formatByKey.get(key) || "svg";
}

function toggleFormat(key) {
  state.formatByKey.set(key, getFormat(key) === "svg" ? "img" : "svg");
}

function getVisibleFlairs() {
  const query = state.query.trim().toLowerCase();

  return flairItems.filter((item) => {
    const category = getCategory(item);
    const currentAssociations = getAssociations(item, state.language).map(({ text }) => text);
    const englishAssociations = getAssociations(item, "en").map(({ text }) => text);
    const searchBlob = [item.code, ...currentAssociations, ...englishAssociations].join(" ").toLowerCase();

    return (state.category === "all" || category.key === state.category) && (!query || searchBlob.includes(query));
  });
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

function renderFilters() {
  elements.filters.innerHTML = categories
    .map((category) => {
      const active = category.key === state.category;
      const background = active
        ? category.color
        : `color-mix(in srgb, ${category.color} 12%, white)`;
      const color = active ? "#ffffff" : `color-mix(in srgb, ${category.color} 74%, #0f172a)`;

      return `
        <button
          class="filter-chip"
          type="button"
          style="background:${background};border-color:color-mix(in srgb, ${category.color} 35%, #cbd5e1);color:${color}"
          data-category="${category.key}"
        >${categoryName(category)}</button>
      `;
    })
    .join("");
}

function renderGrid(visibleFlairs) {
  state.visibleKeys = visibleFlairs.map((item) => item.key);
  elements.grid.innerHTML = visibleFlairs
    .map((item) => {
      return renderCard(item);
    })
    .join("");
}

function render() {
  applyI18n();
  renderFilters();

  const visibleFlairs = getVisibleFlairs();
  renderGrid(visibleFlairs);

  elements.totalCount.textContent = String(flairItems.length);
  elements.visibleCount.textContent = String(visibleFlairs.length);
  elements.groupCount.textContent = String(languageOptions.length);
  elements.empty.classList.toggle("hidden", visibleFlairs.length > 0);
}

function renderCard(item) {
  const format = getFormat(item.key);
  const currentUrl = getImageUrl(item.image, format);
  const shortest = getShortestAssociation(item, state.language);
  const associations = getAssociations(item, state.language).map(({ text }) => text);
  const count = getAssociationCount(item, state.language);
  const category = getCategory(item);
  const expanded = state.expandedKey === item.key;
  const safeShortest = escapeHtml(shortest);
  const safeWords = associations.map(escapeHtml).join(", ");

  return `
    <article
      class="flair-card${expanded ? " is-expanded" : ""}"
      style="border-color:color-mix(in srgb, ${category.color} 24%, #cbd5e1)"
      data-card="${item.key}"
    >
      <button class="flair-card__preview" type="button">
        <img class="flair-card__image" src="${currentUrl}" alt="${escapeAttribute(shortest)}" loading="lazy" decoding="async" />
        <span class="flair-card__veil"></span>
      </button>
      <div class="flair-card__switch" role="tablist" aria-label="Image format">
        ${renderFormatButton(item.key, "svg")}
        ${renderFormatButton(item.key, "img")}
      </div>
      <div class="flair-card__body">
        <div class="flair-card__meta">
          <button class="flair-card__copy" type="button" data-action="copy" data-copy="${escapeAttribute(shortest)}">
            ${safeShortest}
          </button>
          <button class="flair-card__count" type="button" data-action="toggle-panel" data-key="${item.key}">+${count}</button>
        </div>
      </div>
      <div
        class="flair-card__panel${expanded ? " is-visible" : ""}"
        style="background-image:linear-gradient(180deg, rgba(15, 23, 42, 0.35), rgba(15, 23, 42, 0.82)), url('${currentUrl}')"
      >
        <button class="flair-card__close" type="button" aria-label="Close" data-action="close-panel">×</button>
        <p class="flair-card__hint">${t("revealHint")}</p>
        <p class="flair-card__panel-title">${t("associationsTitle")}</p>
        <p class="flair-card__words">${safeWords}</p>
      </div>
    </article>
  `;
}

function renderFormatButton(key, format) {
  const active = getFormat(key) === format;
  return `
    <button
      class="flair-card__switch-option${active ? " is-active" : ""}"
      type="button"
      role="tab"
      aria-selected="${active}"
      data-action="set-format"
      data-key="${key}"
      data-format="${format}"
    >${format}</button>
  `;
}

function updateCard(key) {
  const item = flairItems.find((candidate) => candidate.key === key);
  const currentCard = elements.grid.querySelector(`[data-card="${key}"]`);
  if (!item || !currentCard || !state.visibleKeys.includes(key)) return;

  currentCard.outerHTML = renderCard(item);
}

function setExpandedCard(key) {
  const previous = state.expandedKey;
  state.expandedKey = previous === key ? null : key;

  if (previous && previous !== state.expandedKey) {
    syncExpandedState(previous, false);
  }

  if (key) {
    syncExpandedState(key, state.expandedKey === key);
  }
}

function syncExpandedState(key, expanded) {
  const card = elements.grid.querySelector(`[data-card="${key}"]`);
  if (!card) return;

  card.classList.toggle("is-expanded", expanded);
  card.querySelector(".flair-card__panel")?.classList.toggle("is-visible", expanded);
}

function escapeAttribute(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function openImage(key) {
  const item = flairItems.find((candidate) => candidate.key === key);
  if (!item) return;
  const shortest = getShortestAssociation(item, state.language);
  elements.imageDialogMedia.src = getImageUrl(item.image, getFormat(key));
  elements.imageDialogMedia.alt = shortest;

  if (!elements.imageDialog.open) {
    elements.imageDialog.showModal();
  }
}

elements.search.addEventListener("input", (event) => {
  state.query = event.target.value;
  render();
});

elements.language.addEventListener("change", (event) => {
  state.language = event.target.value;
  render();
});

elements.filters.addEventListener("click", (event) => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  state.category = button.dataset.category;
  render();
});

elements.grid.addEventListener("click", async (event) => {
  const action = event.target.closest("[data-action]");
  const card = event.target.closest("[data-card]");

  if (action) {
    const { action: kind, key, copy, format } = action.dataset;

    if (kind === "set-format" && key && format) {
      if (getFormat(key) !== format) {
        state.formatByKey.set(key, format);
        updateCard(key);
      }
      return;
    }

    if (kind === "toggle-panel" && key) {
      setExpandedCard(key);
      return;
    }

    if (kind === "close-panel") {
      setExpandedCard(state.expandedKey);
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
  render();
}
