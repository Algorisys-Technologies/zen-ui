/**
 * Shift calendar — the pure half of ShiftNavigator, and of every screen that
 * reports by shift.
 *
 *   bun run check:shifts
 *
 * A shift is a wall-clock window ("22:00"–"06:00") in the PLANT's timezone. A
 * shift crossing midnight belongs to the day it starts. On a daylight-saving
 * change it keeps its wall-clock times and its length changes. A pattern may
 * have gaps (a single day shift); there is then no shift in the gap.
 *
 * A shift on a day is a `ShiftRef`: `{ id, day: "YYYY-MM-DD" }` — the plant's
 * calendar day it starts on, not a UTC date.
 */

export interface ShiftDef {
  id: string;
  /** "HH:MM", 24-hour, wall clock in the plant's zone. */
  start: string;
  /** "HH:MM". At or before `start` means it ends the next day. */
  end: string;
  /** Shown instead of the id ("Night"). */
  label?: string;
}

export interface ShiftRef {
  id: string;
  /** The plant's calendar day the shift starts on. */
  day: string;
}

export interface ShiftWindow {
  start: number;
  end: number;
}

const minutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + (m || 0);
};
const crossesMidnight = (s: ShiftDef) => minutes(s.end) <= minutes(s.start);

/** "YYYY-MM-DD" plus n days, by the calendar (no time zone involved). */
export function addPlantDays(day: string, n: number): string {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

const formats = new Map<string, Intl.DateTimeFormat>();
function partsIn(t: number, timeZone: string | undefined) {
  const key = timeZone ?? "";
  let f = formats.get(key);
  if (!f) {
    f = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    });
    formats.set(key, f);
  }
  const p = Object.fromEntries(f.formatToParts(t).map((x) => [x.type, x.value]));
  return { y: +p.year, mo: +p.month, d: +p.day, h: +p.hour, mi: +p.minute, s: +p.second };
}

/** The zone's offset from UTC at instant `t`, in ms. */
function offsetAt(t: number, timeZone: string | undefined): number {
  const p = partsIn(t, timeZone);
  return Date.UTC(p.y, p.mo - 1, p.d, p.h, p.mi, p.s) - Math.floor(t / 1000) * 1000;
}

/** The instant a wall-clock time on a day occurs in a zone. One correction pass settles a DST change. */
export function wallClockToInstant(day: string, hhmm: string, timeZone?: string): number {
  const [y, m, d] = day.split("-").map(Number);
  const guess = Date.UTC(y, m - 1, d) + minutes(hhmm) * 60_000;
  const first = guess - offsetAt(guess, timeZone);
  return guess - offsetAt(first, timeZone);
}

/** The plant's calendar day an instant falls on. */
export function plantDayOf(t: number, timeZone?: string): string {
  const p = partsIn(t, timeZone);
  return `${p.y}-${String(p.mo).padStart(2, "0")}-${String(p.d).padStart(2, "0")}`;
}

const ordered = (shifts: readonly ShiftDef[]) => [...shifts].sort((a, b) => minutes(a.start) - minutes(b.start));

export function shiftWindow(ref: ShiftRef, shifts: readonly ShiftDef[], timeZone?: string): ShiftWindow | null {
  const def = shifts.find((s) => s.id === ref.id);
  if (!def) return null;
  return {
    start: wallClockToInstant(ref.day, def.start, timeZone),
    end: wallClockToInstant(crossesMidnight(def) ? addPlantDays(ref.day, 1) : ref.day, def.end, timeZone),
  };
}

/**
 * The shift an instant falls in (start inclusive, end exclusive), or null in a
 * gap — unless `orNext` / `orPrevious` asks for the nearest one instead.
 */
export function shiftAt(
  at: Date | number,
  shifts: readonly ShiftDef[],
  timeZone?: string,
  options: { orNext?: boolean; orPrevious?: boolean } = {},
): ShiftRef | null {
  const t = typeof at === "number" ? at : at.getTime();
  const today = plantDayOf(t, timeZone);
  const refs: { ref: ShiftRef; w: ShiftWindow }[] = [];
  for (const day of [addPlantDays(today, -1), today, addPlantDays(today, 1)]) {
    for (const s of shifts) {
      const ref = { id: s.id, day };
      const w = shiftWindow(ref, shifts, timeZone);
      if (w) refs.push({ ref, w });
    }
  }
  const inside = refs.find((r) => r.w.start <= t && t < r.w.end);
  if (inside) return inside.ref;
  if (options.orNext) {
    const after = refs.filter((r) => r.w.start > t).sort((a, b) => a.w.start - b.w.start)[0];
    if (after) return after.ref;
  }
  if (options.orPrevious) {
    const before = refs.filter((r) => r.w.end <= t).sort((a, b) => b.w.end - a.w.end)[0];
    if (before) return before.ref;
  }
  return null;
}

/** The shift after `ref` in the pattern: later the same day, else the first of the next day. */
export function nextShift(ref: ShiftRef, shifts: readonly ShiftDef[]): ShiftRef | null {
  const list = ordered(shifts);
  const i = list.findIndex((s) => s.id === ref.id);
  if (i < 0) return null;
  return i + 1 < list.length ? { id: list[i + 1].id, day: ref.day } : { id: list[0].id, day: addPlantDays(ref.day, 1) };
}

/** The shift before `ref`: earlier the same day, else the last of the day before. */
export function previousShift(ref: ShiftRef, shifts: readonly ShiftDef[]): ShiftRef | null {
  const list = ordered(shifts);
  const i = list.findIndex((s) => s.id === ref.id);
  if (i < 0) return null;
  return i > 0 ? { id: list[i - 1].id, day: ref.day } : { id: list[list.length - 1].id, day: addPlantDays(ref.day, -1) };
}
