/**
 * State timeline — a machine's state record laid out on a window of time.
 * The pure half of StateTimeline.
 *
 *   bun run check:state-timeline
 *
 * Rules, each of which a shop-floor screen has got wrong somewhere:
 *
 *  - Positions are true to duration, as fractions of the window. A 40-second
 *    stop in a shift stays 0.14% wide; rounding it away hides exactly the short
 *    stops that add up to a bad shift.
 *  - A hole in the record becomes an explicit `unknown` segment (`gap: true`),
 *    never absorbed by its neighbours. A dead collector must read as "nothing
 *    known", not as an hour of running.
 *  - The future is empty. An open segment (`end` null) runs to `now`, and
 *    nothing — not even "no data" — is laid out after `now`.
 *  - Overlapping records do not stack: the later start cuts the earlier short.
 *
 * Times are epoch milliseconds or Dates. Fractions (`left`, `width`) are of the
 * whole window, 0..1.
 */
import { MACHINE_STATES, machineStateTone, type MachineState, type MachineStateTone } from "./machine-state";
import type { MessageKey } from "./messages";

type Time = Date | number;
const ms = (t: Time) => (typeof t === "number" ? t : t.getTime());

export interface StateSegmentInput {
  /** Kept on the laid-out segment, so a click can be traced back to the record. */
  id?: string;
  state: MachineState;
  /** Overrides the state's own tone. */
  tone?: MachineStateTone;
  /** A cause or note ("Jam at infeed"); shown instead of the state's name. */
  label?: string;
  start: Time;
  /** null or omitted: still going — runs to `now`. */
  end?: Time | null;
}

export interface StateTimelineWindow {
  from: Time;
  to: Time;
  /** Defaults to the current time. Nothing is laid out after it. */
  now?: Time;
}

export interface StateSegment {
  id: string;
  state: MachineState;
  tone: MachineStateTone;
  label?: string;
  /** Clipped to the window and to now. */
  start: number;
  end: number;
  durationMs: number;
  /** Fractions of the window. */
  left: number;
  width: number;
  /** A hole in the record, filled as no data. */
  gap: boolean;
  /** Still going: its end is `now`, not a recorded end. */
  open: boolean;
}

export function layoutStateTimeline(segments: StateSegmentInput[], window: StateTimelineWindow): StateSegment[] {
  const from = ms(window.from);
  const to = ms(window.to);
  const now = ms(window.now ?? Date.now());
  const span = to - from;
  const limit = Math.min(to, now);
  if (!(span > 0) || limit <= from) return [];

  const sorted = segments
    .map((s, i) => ({ s, i, start: ms(s.start) }))
    .sort((a, b) => a.start - b.start || a.i - b.i);

  const make = (
    start: number,
    end: number,
    rest: Pick<StateSegment, "id" | "state" | "tone" | "gap" | "open"> & { label?: string },
  ): StateSegment => ({
    ...rest,
    start,
    end,
    durationMs: end - start,
    left: (start - from) / span,
    width: (end - start) / span,
  });
  const gap = (start: number, end: number) =>
    make(start, end, { id: `gap-${start}`, state: "unknown", tone: "unknown", gap: true, open: false });

  const out: StateSegment[] = [];
  let cursor = from;
  sorted.forEach(({ s, i, start: rawStart }, k) => {
    const open = s.end == null;
    let end = open ? now : ms(s.end as Time);
    const next = sorted[k + 1];
    if (next && next.start < end) end = next.start; // the later start wins
    const start = Math.max(rawStart, from, cursor);
    end = Math.min(end, limit);
    if (!(end > start)) return;
    if (start > cursor) out.push(gap(cursor, start));
    out.push(
      make(start, end, {
        id: s.id ?? `seg-${i}`,
        state: s.state,
        tone: s.tone ?? machineStateTone(s.state),
        label: s.label,
        gap: false,
        open: open && end === now,
      }),
    );
    cursor = end;
  });
  if (cursor < limit) out.push(gap(cursor, limit));
  return out;
}

/** Time per state, in vocabulary order, states with none left out. */
export function stateTimelineTotals(segments: StateSegment[]): { state: MachineState; ms: number }[] {
  const sum = new Map<MachineState, number>();
  for (const s of segments) sum.set(s.state, (sum.get(s.state) ?? 0) + s.durationMs);
  return MACHINE_STATES.filter((s) => (sum.get(s) ?? 0) > 0).map((state) => ({ state, ms: sum.get(state) as number }));
}

export interface TimelineEventInput {
  id: string;
  at: Time;
  /** What happened ("Batch 2 started"). */
  label: string;
}

export interface TimelineEvent {
  id: string;
  at: number;
  label: string;
  left: number;
}

/** Events inside the window, in time order, placed by fraction. */
export function layoutTimelineEvents(events: TimelineEventInput[], window: StateTimelineWindow): TimelineEvent[] {
  const from = ms(window.from);
  const to = ms(window.to);
  const span = to - from;
  if (!(span > 0)) return [];
  return events
    .map((e) => ({ id: e.id, label: e.label, at: ms(e.at) }))
    .filter((e) => e.at >= from && e.at <= to)
    .sort((a, b) => a.at - b.at)
    .map((e) => ({ ...e, left: (e.at - from) / span }));
}

const MIN = 60_000;
const HOUR = 60 * MIN;
const TICK_STEPS = [MIN, 5 * MIN, 10 * MIN, 15 * MIN, 30 * MIN, HOUR, 2 * HOUR, 3 * HOUR, 6 * HOUR, 12 * HOUR, 24 * HOUR];

const clockFormat = new Map<string, Intl.DateTimeFormat>();
/** Milliseconds since local midnight at `t`, in `timeZone` (undefined: the browser's). */
function localMsOfDay(t: number, timeZone: string | undefined): number {
  const key = timeZone ?? "";
  let fmt = clockFormat.get(key);
  if (!fmt) {
    fmt = new Intl.DateTimeFormat("en-GB", { timeZone, hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" });
    clockFormat.set(key, fmt);
  }
  const p = Object.fromEntries(fmt.formatToParts(t).map((x) => [x.type, x.value]));
  return ((Number(p.hour) * 60 + Number(p.minute)) * 60 + Number(p.second)) * 1000 + (t % 1000);
}

export interface TimelineTicks {
  stepMs: number;
  ticks: { at: number; left: number }[];
}

/**
 * Round times along a window: the smallest step from 1 min to 24 h that leaves
 * at most `maxTicks` intervals, aligned to round times in `timeZone` (an IANA
 * name; undefined is the browser's). Both ends are included when they fall on a
 * boundary. A DST change inside the window shifts the labels after it by the
 * change — the ticks stay evenly spaced, which is what a time axis needs.
 */
export function timelineTicks(
  from: Time,
  to: Time,
  options: { maxTicks?: number; timeZone?: string } = {},
): TimelineTicks {
  const a = ms(from);
  const b = ms(to);
  const span = b - a;
  const max = options.maxTicks ?? 8;
  if (!(span > 0)) return { stepMs: 0, ticks: [] };
  const stepMs = TICK_STEPS.find((s) => span / s <= max) ?? TICK_STEPS[TICK_STEPS.length - 1];
  const into = localMsOfDay(a, options.timeZone) % stepMs;
  const ticks: { at: number; left: number }[] = [];
  for (let at = into === 0 ? a : a + (stepMs - into); at <= b; at += stepMs) {
    ticks.push({ at, left: (at - a) / span });
  }
  return { stepMs, ticks };
}

/**
 * Which catalogue message says a duration, and with what values: "42s",
 * "5m 10s", "25m", "1h 12m", "4h". Seconds stop mattering past an hour.
 */
export function durationMessage(durationMs: number): { key: MessageKey; values: Record<string, number> } {
  const total = Math.max(0, Math.floor(durationMs / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  // A zero tail is noise: "25m", not "25m 0s".
  if (h > 0) return m > 0 ? { key: "stateTimeline.durationHours", values: { h, m } } : { key: "stateTimeline.durationHoursOnly", values: { h } };
  if (m > 0) return s > 0 ? { key: "stateTimeline.durationMinutes", values: { m, s } } : { key: "stateTimeline.durationMinutesOnly", values: { m } };
  return { key: "stateTimeline.durationSeconds", values: { s } };
}
