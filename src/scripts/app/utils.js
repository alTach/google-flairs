/**
 * Экранирует специальные HTML-символы для безопасной вставки текста.
 *
 * @param {unknown} value
 * @returns {string}
 */
export function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

/**
 * Экранирует значение для безопасной вставки внутрь HTML-атрибута.
 *
 * @param {unknown} value
 * @returns {string}
 */
export function escapeAttribute(value) {
  return escapeHtml(value).replaceAll('"', "&quot;");
}
