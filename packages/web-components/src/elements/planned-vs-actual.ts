import { PlannedVsActual, type CountPoint, type PlannedVsActualProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";
import { reviveEach, reviveKeys, revived } from "../lib/time";

/**
 * <zen-planned-vs-actual start="2026-11-13T00:30:00Z" end="2026-11-13T08:30:00Z"
 *   plan-total="2000" actual='[{"at":"…","value":330}]' unit="pcs">
 *
 * `start`, `end`, `now` and the `at` of every plan and actual point are revived
 * from ISO (or all-digit epoch) strings on build and on every update — see
 * lib/time.ts. An actual reading left a string would sort and step as NaN, and
 * the headline would report a gap measured against nothing.
 *
 * Read-only: no callbacks, no slot.
 */
defineZenElement<PlannedVsActualProps>({
  tag: "zen-planned-vs-actual",
  factory: revived<PlannedVsActualProps, Element>(PlannedVsActual, (p) => {
    const out = reviveKeys(p, ["start", "end", "now"]);
    if ("plan" in p) out.plan = reviveEach<CountPoint>(p.plan, ["at"]);
    if ("actual" in p) out.actual = reviveEach<CountPoint>(p.actual, ["at"]) as CountPoint[];
    return out;
  }),
  attrs: {
    start: "string",
    end: "string",
    now: "string",
    plan: "json",
    "plan-total": "number",
    actual: "json",
    unit: "string",
    tolerance: "number",
    "time-zone": "string",
    "hide-chart": "boolean",
  },
  props: ["start", "end", "now", "plan", "actual"],
  childrenProp: false,
});
