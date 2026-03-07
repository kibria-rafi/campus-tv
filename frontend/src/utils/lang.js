/**
 * Pick a localized string from a bilingual object { bn, en }.
 * Prefers the requested language; falls back to the other if absent/empty.
 *
 * @param {object|null|undefined} obj  - e.g. { bn: 'শিরোনাম', en: 'Title' }
 * @param {'bn'|'en'} lang             - preferred language
 * @returns {string}
 */
export function pickLang(obj, lang) {
  if (!obj) return '';
  const preferred = lang === 'bn' ? obj.bn : obj.en;
  if (preferred && typeof preferred === 'string' && preferred.trim()) {
    return preferred;
  }
  const fallback = lang === 'bn' ? obj.en : obj.bn;
  return (fallback && typeof fallback === 'string' ? fallback : '') || '';
}

/**
 * Strip all HTML tags, returning plain text.
 * Safe for snippets / share text.
 */
export function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').trim();
}

/**
 * Return true when an HTML string contains no meaningful text.
 * Handles blank tags like <p><br></p> and whitespace-only content.
 */
export function isHtmlEmpty(html) {
  if (!html) return true;
  return stripHtml(html) === '';
}
