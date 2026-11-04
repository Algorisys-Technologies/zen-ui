/**
 * Typing a date: the pure half of DateInput, shared by every binding.
 *
 *   bun run check:date-input
 *
 * Clerks type dates; they do not click through calendars. What they type is
 * read in the locale's order (day first in India and most of the world, month
 * first in the US), with or without separators, and with the shortcuts desktop
 * business software has always had:
 *
 *   15/03/2026  15-3-26  15.03.2026  150326  15032026  1503 (this year)  15 (this month)
 *   2026-03-15                      ISO, whatever the locale
 *   t  today     y  yesterday       +7  -1  (days)   +2w  +1m  -1y
 *
 * A date that does not exist (31/02) is refused rather than rolled over into
 * March, which is what `new Date(2026, 1, 31)` would quietly do.
 */

export type DateOrder = "dmy" | "mdy" | "ymd";

/** The order a locale writes a date in, from Intl: "en-IN" is dmy, "en-US" mdy, "ja-JP" ymd. */
export function orderForLocale(locale?: string): DateOrder {
  try {
    const parts = new Intl.DateTimeFormat(locale, { year: "numeric", month: "2-digit", day: "2-digit" })
      .formatToParts(new Date(2026, 2, 15))
      .filter((p) => p.type === "year" || p.type === "month" || p.type === "day")
      .map((p) => p.type[0]);
    const order = parts.join("");
    return order === "mdy" || order === "ymd" ? order : "dmy";
  } catch {
    return "dmy";
  }
}

/** A real calendar date, or null (31/02, month 13, day 0). Time is midnight, local. */
export function makeDate(year: number, month: number, day: number): Date | null {
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return null;
  if (month < 1 || month > 12 || day < 1 || year < 1 || year > 9999) return null;
  const d = new Date(year, month - 1, day);
  d.setFullYear(year); // years under 100 would otherwise be read as 19xx
  return d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day ? d : null;
}

/** "26" -> 2026: a two-digit year is the nearest one to today, within 50 years either way. */
export function expandYear(yy: number, today: Date): number {
  const now = today.getFullYear();
  const century = Math.floor(now / 100) * 100;
  let y = century + yy;
  if (y > now + 50) y -= 100;
  else if (y <= now - 50) y += 100;
  return y;
}

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

/** Months added, the day clamped to the month's end: 31 Jan + 1 month is 28 (or 29) Feb. */
export function addMonths(d: Date, months: number): Date {
  const target = new Date(d.getFullYear(), d.getMonth() + months, 1);
  const last = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  return new Date(target.getFullYear(), target.getMonth(), Math.min(d.getDate(), last));
}

export function addDays(d: Date, days: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + days);
}

/**
 * What a typed text means: a date, null for nothing typed, or "invalid" for
 * text that is not a date (shown to the user, never silently changed).
 */
export function parseDateInput(text: string, order: DateOrder, today: Date): Date | null | "invalid" {
  const t = text.trim().toLowerCase();
  if (t === "") return null;
  const base = startOfDay(today);

  // Shortcuts.
  if (t === "t" || t === "today") return base;
  if (t === "y" || t === "yesterday") return addDays(base, -1);
  if (t === "tomorrow") return addDays(base, 1);
  const rel = /^([+-])\s*(\d{1,4})\s*([dwmy]?)$/.exec(t);
  if (rel) {
    const n = Number(rel[2]) * (rel[1] === "-" ? -1 : 1);
    switch (rel[3]) {
      case "w": return addDays(base, n * 7);
      case "m": return addMonths(base, n);
      case "y": return addMonths(base, n * 12);
      default: return addDays(base, n);
    }
  }

  // ISO, whatever the locale.
  const iso = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(t);
  if (iso) return makeDate(+iso[1], +iso[2], +iso[3]) ?? "invalid";

  const yearOf = (s: string | undefined) =>
    s === undefined ? base.getFullYear() : s.length <= 2 ? expandYear(+s, base) : +s;

  // With separators: up to three numbers.
  if (/[/\-. ]/.test(t)) {
    const parts = t.split(/[/\-. ]+/).filter(Boolean);
    if (parts.length < 2 || parts.length > 3 || parts.some((p) => !/^\d{1,4}$/.test(p))) return "invalid";
    let d: string, m: string, y: string | undefined;
    if (order === "ymd") {
      if (parts.length === 2) [m, d] = parts;
      else [y, m, d] = parts;
    } else if (order === "mdy") [m, d, y] = parts;
    else [d, m, y] = parts;
    return makeDate(yearOf(y), +m!, +d!) ?? "invalid";
  }

  // Digits only: a day (1–2), day and month (4), or a whole date (6 or 8).
  if (!/^\d+$/.test(t)) return "invalid";
  if (t.length <= 2) return makeDate(base.getFullYear(), base.getMonth() + 1, +t) ?? "invalid";
  if (order === "ymd") {
    if (t.length === 4) return makeDate(base.getFullYear(), +t.slice(0, 2), +t.slice(2)) ?? "invalid";
    if (t.length === 6) return makeDate(expandYear(+t.slice(0, 2), base), +t.slice(2, 4), +t.slice(4)) ?? "invalid";
    if (t.length === 8) return makeDate(+t.slice(0, 4), +t.slice(4, 6), +t.slice(6)) ?? "invalid";
    return "invalid";
  }
  const [a, b] = [t.slice(0, 2), t.slice(2, 4)];
  const [d, m] = order === "mdy" ? [b, a] : [a, b];
  if (t.length === 4) return makeDate(base.getFullYear(), +m, +d) ?? "invalid";
  if (t.length === 6) return makeDate(expandYear(+t.slice(4), base), +m, +d) ?? "invalid";
  if (t.length === 8) return makeDate(+t.slice(4), +m, +d) ?? "invalid";
  return "invalid";
}

const pad = (n: number, w = 2) => String(n).padStart(w, "0");

/** A date as the field shows it, in the order: 15/03/2026, 03/15/2026, 2026-03-15. */
export function formatDateInput(d: Date, order: DateOrder): string {
  const [y, m, day] = [pad(d.getFullYear(), 4), pad(d.getMonth() + 1), pad(d.getDate())];
  if (order === "ymd") return `${y}-${m}-${day}`;
  if (order === "mdy") return `${m}/${day}/${y}`;
  return `${day}/${m}/${y}`;
}

/** The pattern to show as a placeholder and a hint: DD/MM/YYYY. */
export function patternFor(order: DateOrder): string {
  return order === "ymd" ? "YYYY-MM-DD" : order === "mdy" ? "MM/DD/YYYY" : "DD/MM/YYYY";
}
