import { ShiftNavigator, type ShiftNavigatorProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";
import { reviveKeys, revived } from "../lib/time";

/**
 * <zen-shift-navigator time-zone="Asia/Kolkata"
 *   shifts='[{"id":"A","start":"06:00","end":"14:00","label":"Morning"},…]'>
 *
 * A shift's `start`/`end` are wall-clock "HH:MM" strings and a ShiftRef's `day`
 * a "YYYY-MM-DD" string — the factory wants strings there, so they are NOT
 * revived. `now` is the only moment, revived from ISO (or an all-digit epoch)
 * on build and on every update; see lib/time.ts.
 *
 * `onChange` becomes `zen-change`, whose detail is the pair [ref, window] — a
 * CustomEvent carries one payload, and the window (epoch ms) is what a caller
 * loads data for. Controlled use is the vanilla contract: set `value` (property
 * or json attribute) back from the handler. Left unset, the element keeps its
 * own position, starting from `default-value` or the current shift.
 *
 * No slot.
 */
defineZenElement<ShiftNavigatorProps>({
  tag: "zen-shift-navigator",
  factory: revived<ShiftNavigatorProps, Element>(ShiftNavigator, (p) => reviveKeys(p, ["now"])),
  attrs: {
    shifts: "json",
    "time-zone": "string",
    value: "json",
    "default-value": "json",
    "allow-future": "boolean",
    now: "string",
  },
  props: ["shifts", "value", "defaultValue", "now"],
  events: { onChange: "zen-change" },
  childrenProp: false,
});
