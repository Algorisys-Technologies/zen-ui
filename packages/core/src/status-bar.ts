/**
 * Status bar layout — the pure half of StatusBar.
 *
 *   bun run check:status-bar
 *
 * Which items show, on which side, and which give way when the bar is too
 * narrow: the lowest `priority` first, and between equals the one later in the
 * list, since the list order is the author's order of importance.
 */

export type StatusBarAlign = "start" | "end";

export interface StatusBarLayoutItem {
  id: string;
  align?: StatusBarAlign;
  /** Higher stays longer when the bar is narrow. Default 0. */
  priority?: number;
  hidden?: boolean;
}

export function statusBarSides<T extends StatusBarLayoutItem>(items: readonly T[]): { start: T[]; end: T[] } {
  const start: T[] = [];
  const end: T[] = [];
  for (const it of items) {
    if (it.hidden) continue;
    (it.align === "end" ? end : start).push(it);
  }
  return { start, end };
}

/**
 * The ids to collapse, in the order they give way, so the rest fit in `room`
 * pixels with `gap` pixels between neighbours. A width not measured yet counts
 * as 0. `room <= 0` means the bar has not been measured (not in the document,
 * display:none, a server render), and hides nothing.
 */
export function statusBarCollapse(
  items: readonly StatusBarLayoutItem[],
  widths: Readonly<Record<string, number>>,
  room: number,
  gap: number,
): string[] {
  if (!(room > 0)) return [];
  const shown = items.filter((it) => !it.hidden);
  const total = (xs: readonly StatusBarLayoutItem[]) =>
    xs.reduce((sum, it) => sum + (widths[it.id] ?? 0), 0) + gap * Math.max(0, xs.length - 1);

  // Give-way order: lowest priority first; later in the list first among equals.
  const order = shown
    .map((it, i) => ({ it, i }))
    .sort((a, b) => (a.it.priority ?? 0) - (b.it.priority ?? 0) || b.i - a.i)
    .map((x) => x.it);

  const out: string[] = [];
  let left = shown;
  for (const it of order) {
    if (total(left) <= room) break;
    out.push(it.id);
    left = left.filter((x) => x !== it);
  }
  return out;
}
