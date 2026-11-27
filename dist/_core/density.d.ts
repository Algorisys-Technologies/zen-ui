/**
 * Component density — the opt-in `density` prop on the schedules,
 * PlanningCalendar, SpreadsheetGrid and Tree.
 *
 *   bun run check:density
 *
 * The same three names as the `data-density` tokens (tokens.css). This is a
 * PROP rather than a reading of that attribute on purpose: these components
 * never followed data-density, and starting to would reflow every app that
 * already sets data-density="touch" for its controls. A prop changes only the
 * component it is set on.
 *
 * "comfortable" is the default and is exactly the size each component always
 * drew. "touch" reaches 48px targets, like data-density="touch" for controls.
 * An explicit size (rowHeight, laneHeight) wins over density. The classes for
 * SpreadsheetGrid and Tree live in variants.ts, which Uno scans.
 */
export type Density = "compact" | "comfortable" | "touch";
export declare const DENSITIES: readonly Density[];
/** A Gantt row, or ProductionSchedule's least row height. */
export declare const scheduleRowPx: (density?: Density, explicit?: number) => number;
/** A Gantt bar's height. */
export declare const ganttBarPx: (density?: Density) => number;
/** One lane's bar in ProductionSchedule. */
export declare const laneBarPx: (density?: Density) => number;
/** A PlanningCalendar lane. */
export declare const calendarLanePx: (density?: Density, explicit?: number) => number;
