/**
 * Shared conventions for virtualized, windowed list/grid fetches.
 * Prefer these constants over ad-hoc timeouts so pivot grids, filter
 * dropdowns, and future large lists stay consistent.
 */

/** Debounce after scroll settles before fetching the next data window. */
export const VIRTUAL_SCROLL_FETCH_DEBOUNCE_MS = 200;

/** Default server page size for sliding row/value windows (TM1-style segments). */
export const VIRTUAL_SCROLL_WINDOW_PAGE_SIZE = 50;
