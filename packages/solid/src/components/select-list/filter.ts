import type { SelectListItem } from "./select-list";

/**
 * Lives apart from select-list.tsx to mirror the React binding, where mixing a
 * helper in with the components trips react-refresh/only-export-components.
 */

const matches = (item: SelectListItem, q: string) =>
  item.label.toLowerCase().includes(q) ||
  (item.description?.toLowerCase().includes(q) ?? false);

/** Client-side filter over label + description. `external` hands it to the caller. */
export const filterItems = (
  items: SelectListItem[],
  query: string,
  external?: boolean,
): SelectListItem[] => {
  const q = query.trim().toLowerCase();
  if (external || !q) return items;
  return items.filter((i) => matches(i, q));
};
