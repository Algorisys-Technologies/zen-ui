/**
 * Capacity — the pure half of CapacityHeatmap.
 *
 *   bun run check:capacity
 *
 * Load is booked ÷ available. Over is strictly above 100% (with a
 * floating-point allowance); "high" from 85% by default. Work booked where
 * there is no capacity is "no-capacity" — the worst case, not a division by
 * zero. No work and no capacity is "closed". Totals sum hours, then divide.
 */

export type CapacityStatus = "free" | "ok" | "high" | "over" | "no-capacity" | "closed";

export interface CapacityCell {
  booked: number;
  available: number;
  /** booked ÷ available; null without capacity. */
  load: number | null;
  status: CapacityStatus;
}

const hours = (n: number) => (Number.isFinite(n) && n > 0 ? n : 0);

export function capacityCell(booked: number, available: number, options: { high?: number } = {}): CapacityCell {
  const b = hours(booked);
  const a = hours(available);
  if (a === 0) return { booked: b, available: a, load: null, status: b > 0 ? "no-capacity" : "closed" };
  const load = b / a;
  const eps = 1e-9;
  const status: CapacityStatus =
    b === 0 ? "free" : load > 1 + eps ? "over" : load >= (options.high ?? 0.85) - eps ? "high" : "ok";
  return { booked: b, available: a, load, status };
}

export interface CapacityGridInput {
  rows: { id: string }[];
  periods: { id: string }[];
  cells: { row: string; period: string; booked: number; available: number }[];
  high?: number;
}

export interface CapacityGrid {
  cells: Record<string, Record<string, CapacityCell>>;
  rowTotals: Record<string, CapacityCell>;
  periodTotals: Record<string, CapacityCell>;
  total: CapacityCell;
  /** Cells over capacity or with work and no capacity. */
  overCount: number;
}

export function capacityGrid(i: CapacityGridInput): CapacityGrid {
  const opts = { high: i.high };
  const raw = new Map<string, { booked: number; available: number }>();
  for (const c of i.cells) {
    const k = `${c.row}\u0000${c.period}`;
    const prev = raw.get(k) ?? { booked: 0, available: 0 };
    raw.set(k, { booked: prev.booked + hours(c.booked), available: prev.available + hours(c.available) });
  }
  const cells: CapacityGrid["cells"] = {};
  const rowSum: Record<string, { booked: number; available: number }> = {};
  const colSum: Record<string, { booked: number; available: number }> = {};
  let all = { booked: 0, available: 0 };
  let overCount = 0;
  for (const row of i.rows) {
    cells[row.id] = {};
    for (const p of i.periods) {
      const v = raw.get(`${row.id}\u0000${p.id}`) ?? { booked: 0, available: 0 };
      const cell = capacityCell(v.booked, v.available, opts);
      cells[row.id][p.id] = cell;
      if (cell.status === "over" || cell.status === "no-capacity") overCount++;
      const rs = (rowSum[row.id] ??= { booked: 0, available: 0 });
      rs.booked += cell.booked;
      rs.available += cell.available;
      const cs = (colSum[p.id] ??= { booked: 0, available: 0 });
      cs.booked += cell.booked;
      cs.available += cell.available;
      all = { booked: all.booked + cell.booked, available: all.available + cell.available };
    }
  }
  const total = (s: { booked: number; available: number }) => capacityCell(s.booked, s.available, opts);
  return {
    cells,
    rowTotals: Object.fromEntries(Object.entries(rowSum).map(([k, s]) => [k, total(s)])),
    periodTotals: Object.fromEntries(Object.entries(colSum).map(([k, s]) => [k, total(s)])),
    total: total(all),
    overCount,
  };
}
