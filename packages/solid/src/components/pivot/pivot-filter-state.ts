export type PivotFilterSelection =
  | { kind: "include"; values: string[] }
  | { kind: "all"; optionSearch?: string; exclude: string[] };

export type PivotFilters = Record<string, PivotFilterSelection>;

export type SortDirection = "asc" | "desc";

/** Server-side sort on a filterable column. */
export type PivotSort = {
  column: string;
  direction: SortDirection;
};

export type PivotFilterOptionsBody = {
  values: string[];
  hasMore: boolean;
  total: number;
};

function dedupe(values: string[]): string[] {
  return [...new Set(values.filter((value) => value !== ""))];
}

/** Normalizes a selection: trims search, dedupes value lists. */
export function normalizePivotFilterSelection(
  selection: PivotFilterSelection,
): PivotFilterSelection {
  if (selection.kind === "include") {
    return { kind: "include", values: dedupe(selection.values) };
  }
  const search = selection.optionSearch?.trim();
  return {
    kind: "all",
    ...(search ? { optionSearch: search } : {}),
    exclude: dedupe(selection.exclude),
  };
}

/** Whether a selection has any UI presence worth persisting or displaying. */
export function hasPivotSelection(
  selection: PivotFilterSelection | undefined,
): boolean {
  if (!selection) {
    return false;
  }
  return true;
}

/** Whether a selection actually narrows list results server-side. */
export function isPivotFilterActive(
  selection: PivotFilterSelection | undefined,
): boolean {
  if (!selection) {
    return false;
  }
  if (selection.kind === "include") {
    return true;
  }
  return Boolean(selection.optionSearch?.trim()) || selection.exclude.length > 0;
}

/** Whether a specific value is currently selected in the dropdown. */
export function isPivotValueSelected(
  selection: PivotFilterSelection | undefined,
  value: string,
): boolean {
  if (!selection) {
    return true;
  }
  if (selection.kind === "include") {
    return selection.values.includes(value);
  }
  return !selection.exclude.includes(value);
}

export function hasActivePivotFilters(filters: PivotFilters): boolean {
  return Object.values(filters).some(isPivotFilterActive);
}
