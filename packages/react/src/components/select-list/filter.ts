import type { SelectListItem } from "./select-list";

/**
 * Lives apart from select-list.tsx so that file only exports components: mixing
 * a helper in trips react-refresh/only-export-components and costs the module
 * its fast refresh.
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
