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
export declare function orderForLocale(locale?: string): DateOrder;
/** A real calendar date, or null (31/02, month 13, day 0). Time is midnight, local. */
export declare function makeDate(year: number, month: number, day: number): Date | null;
/** "26" -> 2026: a two-digit year is the nearest one to today, within 50 years either way. */
export declare function expandYear(yy: number, today: Date): number;
/** Months added, the day clamped to the month's end: 31 Jan + 1 month is 28 (or 29) Feb. */
export declare function addMonths(d: Date, months: number): Date;
export declare function addDays(d: Date, days: number): Date;
/**
 * What a typed text means: a date, null for nothing typed, or "invalid" for
 * text that is not a date (shown to the user, never silently changed).
 */
export declare function parseDateInput(text: string, order: DateOrder, today: Date): Date | null | "invalid";
/** A date as the field shows it, in the order: 15/03/2026, 03/15/2026, 2026-03-15. */
export declare function formatDateInput(d: Date, order: DateOrder): string;
/** The pattern to show as a placeholder and a hint: DD/MM/YYYY. */
export declare function patternFor(order: DateOrder): string;
