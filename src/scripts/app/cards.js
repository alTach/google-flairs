import { getImageUrl, getShortestAssociation, normalize } from "../flairs.js";

/**
 * Создаёт контроллер карточек: фильтрация, переключение формата, панель и модалка.
 *
 * @param {{
 *   cardRecords: Array<{
 *     key: string,
 *     card: HTMLElement,
 *     code: string,
 *     image: string,
 *     previewImage: HTMLImageElement,
 *     copyButton: HTMLElement | null,
 *     countButton: HTMLElement | null,
 *     panel: HTMLElement | null,
 *     panelWords: HTMLElement | null,
 *     panelHint: HTMLElement | null,
 *     panelTitle: HTMLElement | null
 *   }>,
 *   elements: Record<string, HTMLElement | HTMLDialogElement | null>,
 *   state: { query: string, category: string, language: string },
 *   t: (key: string) => string
 * }} options
 * @returns {object}
 */
export function createCardController({ cardRecords, elements, state, t }) {
  /**
   * Возвращает текущий формат изображения у карточки.
   *
   * @param {HTMLElement} card
   * @returns {string}
   */
  function getFormat(card) {
    return card.dataset.format || "svg";
  }

  /**
   * Находит кэшированную запись карточки по ключу.
   *
   * @param {string} key
   * @returns {object | null}
   */
  function getRecord(key) {
    return cardRecords.find((record) => record.key === key) || null;
  }

  /**
   * Помечает карточки как готовые к показу после загрузки preview-изображения.
   *
   * @param {string} [targetKey]
   * @returns {void}
   */
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

  /**
   * Возвращает список карточек, подходящих под текущий поиск и категорию.
   *
   * @returns {Array<object>}
   */
  function getVisibleRecords() {
    const query = normalize(state.query);

    return cardRecords.filter(({ card }) => {
      const searchBlob = `${card.dataset.searchEn || ""} ${card.dataset.currentSearch || ""}`.trim();
      const matchesCategory = state.category === "all" || card.dataset.category === state.category;
      const matchesQuery = !query || searchBlob.includes(query);
      return matchesCategory && matchesQuery;
    });
  }

  /**
   * Обновляет видимость карточек и счётчик найденных элементов.
   *
   * @returns {void}
   */
  function syncVisibility() {
    const visibleRecords = getVisibleRecords();
    const visibleKeys = new Set(visibleRecords.map(({ key }) => key));

    cardRecords.forEach(({ key, card }) => {
      card.classList.toggle("hidden", !visibleKeys.has(key));
    });

    elements.visibleCount.textContent = String(visibleRecords.length);
    elements.empty.classList.toggle("hidden", visibleRecords.length > 0);
  }

  /**
   * Переключает одну карточку между `svg` и `img` без перерендера всей сетки.
   *
   * @param {string} key
   * @param {string} format
   * @returns {void}
   */
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

  /**
   * Открывает или закрывает встроенную панель ассоциаций у карточки.
   *
   * @param {string} key
   * @returns {void}
   */
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

  /**
   * Закрывает любую открытую панель карточки.
   *
   * @returns {boolean}
   */
  function closeExpandedCard() {
    let didClose = false;

    cardRecords.forEach(({ card, panel }) => {
      if (card.classList.contains("is-expanded") || panel?.classList.contains("is-visible")) {
        didClose = true;
      }

      card.classList.remove("is-expanded");
      panel?.classList.remove("is-visible");
    });

    return didClose;
  }

  /**
   * Открывает текущее изображение карточки в общем dialog-окне.
   *
   * @param {string} key
   * @returns {void}
   */
  function openImage(key) {
    const record = getRecord(key);
    if (!record) return;

    elements.imageDialogMedia.src = getImageUrl(record.image, getFormat(record.card));
    elements.imageDialogMedia.alt = record.copyButton?.dataset.copy || record.code;

    if (!elements.imageDialog.open) {
      elements.imageDialog.showModal();
    }
  }

  /**
   * Восстанавливает текст карточек из заранее вшитого английского набора.
   *
   * @returns {void}
   */
  function applyEnglishCardContent() {
    cardRecords.forEach(({ card, code, copyButton, countButton, panelWords, previewImage, panelHint, panelTitle }) => {
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
      if (panelHint) {
        panelHint.textContent = t("revealHint");
      }
      if (panelTitle) {
        panelTitle.textContent = t("associationsTitle");
      }
    });
  }

  /**
   * Обновляет текст карточек ассоциациями из активного языкового пакета.
   *
   * @param {Map<string, Array<{text: string}>>} languageMap
   * @returns {void}
   */
  function applyLanguageCardContent(languageMap) {
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
  }

  return {
    syncCardMedia,
    syncVisibility,
    setFormat,
    setExpandedCard,
    closeExpandedCard,
    openImage,
    applyEnglishCardContent,
    applyLanguageCardContent
  };
}
