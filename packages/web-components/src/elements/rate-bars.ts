import { RateBars, type CountPoint, type RateBarsProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";
import { reviveEach, reviveKeys, revived } from "../lib/time";

/**
 * <zen-rate-bars readings='[{"at":"…","value":0},…]' from="…" to="…"
 *   bucket-ms="120000" target="300" unit="pcs" time-zone="Asia/Kolkata">
 *
 * `from`, `to`, `now`, each reading's `at` and each state segment's
 * `start`/`end` are revived from ISO (or all-digit epoch) strings on build and
 * on every update — see lib/time.ts. A segment's `end: null` stays null: it is
 * the stretch still going.
 *
 * Read-only: no callbacks, no slot.
 */
type Segment = NonNullable<RateBarsProps["segments"]>[number];

defineZenElement<RateBarsProps>({
  tag: "zen-rate-bars",
  factory: revived<RateBarsProps, Element>(RateBars, (p) => {
    const out = reviveKeys(p, ["from", "to", "now"]);
    if ("readings" in p) out.readings = reviveEach<CountPoint>(p.readings, ["at"]) as CountPoint[];
    if ("segments" in p) out.segments = reviveEach<Segment>(p.segments, ["start", "end"]);
    return out;
  }),
  attrs: {
    readings: "json",
    segments: "json",
    from: "string",
    to: "string",
    "bucket-ms": "number",
    now: "string",
    target: "number",
    unit: "string",
    "time-zone": "string",
  },
  props: ["readings", "segments", "from", "to", "now"],
  childrenProp: false,
});
