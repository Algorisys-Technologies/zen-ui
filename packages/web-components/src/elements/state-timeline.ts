import {
  StateTimeline,
  type StateSegmentInput,
  type StateTimelineProps,
  type TimelineEventInput,
} from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";
import { reviveEach, reviveKeys, revived } from "../lib/time";

/**
 * <zen-state-timeline label="Press 4" from="2026-11-13T06:00:00Z" to="2026-11-13T14:00:00Z"
 *   segments='[{"state":"running","start":"2026-11-13T06:00:00Z","end":null}]'>
 *
 * Every moment the factory takes is `Date | number`, and an attribute can only
 * hand over a string — so `from`, `to`, `now`, each segment's `start`/`end` and
 * each event's `at` are revived (ISO string -> Date, all-digit string -> epoch
 * ms; see lib/time.ts). A segment's `end: null` survives as null: it is "still
 * going", and turning it into the epoch would draw a stretch that ended in 1970.
 * Revival runs on every update too, not only at build — an attribute edit after
 * the first render must not hand the factory raw strings.
 *
 * `onSegmentClick` becomes `zen-segment-click` (detail: the laid-out segment).
 * Listening for it is what turns the stretches into buttons, exactly as passing
 * the callback does in vanilla. `isSegmentClickable` is a predicate, so it is a
 * property only.
 *
 * No slot: the strip comes from `segments`.
 */
const revive = (p: Partial<StateTimelineProps>): Partial<StateTimelineProps> => {
  const out = reviveKeys(p, ["from", "to", "now"]);
  if ("segments" in p) out.segments = reviveEach<StateSegmentInput>(p.segments, ["start", "end"]) as StateSegmentInput[];
  if ("events" in p) out.events = reviveEach<TimelineEventInput>(p.events, ["at"]);
  return out;
};

defineZenElement<StateTimelineProps>({
  tag: "zen-state-timeline",
  factory: revived<StateTimelineProps, Element>(StateTimeline, revive),
  attrs: {
    label: "string",
    segments: "json",
    from: "string",
    to: "string",
    now: "string",
    events: "json",
    "time-zone": "string",
    "selected-id": "string",
    "hide-axis": "boolean",
    size: "string",
  },
  props: ["segments", "from", "to", "now", "events", "isSegmentClickable"],
  events: { onSegmentClick: "zen-segment-click" },
  childrenProp: false,
});
