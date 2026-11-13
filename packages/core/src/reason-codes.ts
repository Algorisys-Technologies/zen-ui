/**
 * Reason codes — the pure half of ReasonCodePicker.
 *
 *   bun run check:reason-codes
 *
 * Categories keep the plant's own order (common ones first, on purpose). Search
 * matches label, code and description; every typed word must match somewhere,
 * in any order, ignoring case and accents.
 */

export interface ReasonCode {
  id: string;
  label: string;
  /** The plant's short code ("M12"). Operators who know it type it. */
  code?: string;
  category?: string;
  /** A longer explanation, searched but shown only where there is room. */
  description?: string;
}

/** Categories in the order first listed, with how many reasons each has. */
export function reasonCategories(reasons: readonly ReasonCode[]): { id: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const r of reasons) if (r.category) counts.set(r.category, (counts.get(r.category) ?? 0) + 1);
  return [...counts].map(([id, count]) => ({ id, count }));
}

const fold = (s: string) => s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

export function filterReasons<R extends ReasonCode>(
  reasons: readonly R[],
  options: { category?: string; query?: string },
): R[] {
  const words = fold(options.query ?? "").split(/\s+/).filter(Boolean);
  return reasons.filter((r) => {
    if (options.category && r.category !== options.category) return false;
    if (words.length === 0) return true;
    const hay = fold([r.label, r.code ?? "", r.description ?? ""].join(" "));
    return words.every((w) => hay.includes(w));
  });
}
