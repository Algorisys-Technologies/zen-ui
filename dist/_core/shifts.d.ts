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
/** "YYYY-MM-DD" plus n days, by the calendar (no time zone involved). */
export declare function addPlantDays(day: string, n: number): string;
/** The instant a wall-clock time on a day occurs in a zone. One correction pass settles a DST change. */
export declare function wallClockToInstant(day: string, hhmm: string, timeZone?: string): number;
/** The plant's calendar day an instant falls on. */
export declare function plantDayOf(t: number, timeZone?: string): string;
export declare function shiftWindow(ref: ShiftRef, shifts: readonly ShiftDef[], timeZone?: string): ShiftWindow | null;
/**
 * The shift an instant falls in (start inclusive, end exclusive), or null in a
 * gap — unless `orNext` / `orPrevious` asks for the nearest one instead.
 */
export declare function shiftAt(at: Date | number, shifts: readonly ShiftDef[], timeZone?: string, options?: {
    orNext?: boolean;
    orPrevious?: boolean;
}): ShiftRef | null;
/** The shift after `ref` in the pattern: later the same day, else the first of the next day. */
export declare function nextShift(ref: ShiftRef, shifts: readonly ShiftDef[]): ShiftRef | null;
/** The shift before `ref`: earlier the same day, else the last of the day before. */
export declare function previousShift(ref: ShiftRef, shifts: readonly ShiftDef[]): ShiftRef | null;
