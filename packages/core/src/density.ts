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
export const DENSITIES: readonly Density[] = ["compact", "comfortable", "touch"];

const SCHEDULE_ROW: Record<Density, number> = { compact: 28, comfortable: 36, touch: 48 };
const GANTT_BAR: Record<Density, number> = { compact: 14, comfortable: 18, touch: 32 };
const LANE_BAR: Record<Density, number> = { compact: 12, comfortable: 16, touch: 32 };
// A calendar block is its lane less 6px: touch's 54 makes a 48px block.
const CALENDAR_LANE: Record<Density, number> = { compact: 24, comfortable: 30, touch: 54 };

/** A Gantt row, or ProductionSchedule's least row height. */
export const scheduleRowPx = (density: Density = "comfortable", explicit?: number): number =>
  explicit ?? SCHEDULE_ROW[density];
/** A Gantt bar's height. */
export const ganttBarPx = (density: Density = "comfortable"): number => GANTT_BAR[density];
/** One lane's bar in ProductionSchedule. */
export const laneBarPx = (density: Density = "comfortable"): number => LANE_BAR[density];
/** A PlanningCalendar lane. */
export const calendarLanePx = (density: Density = "comfortable", explicit?: number): number =>
  explicit ?? CALENDAR_LANE[density];
