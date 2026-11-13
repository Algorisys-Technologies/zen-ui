import { ScanInput, type ScanInputProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

/**
 * <zen-scan-input label="Packing station" capture-global></zen-scan-input>
 *
 * Every scan fires `zen-scan` with `detail: [code, { source }]`. A listener can
 * hear a scan but cannot ANSWER one; to reject a code, assign the callback as a
 * property — `el.onScan = async (code) => (await known(code)) ? undefined :
 * "Unknown code"` — whose return (an error message, a promise of one, or
 * nothing for accepted) the field shows under itself. The element returns the
 * assigned callback's value through the event wrapper (lib/define.ts), so the
 * promise is awaited exactly as in vanilla. Functions are never attributes.
 *
 * vanilla's `onScan` is required and is called unguarded. An element nobody
 * has given a callback yet (only listening, or not even that) would show
 * "onScan is not a function" as the scan's error, so the factory is handed a
 * no-op in that case: such a scan is accepted, and still fires `zen-scan` when
 * someone listens.
 *
 * `allowTyping` and `clearOnScan` default to TRUE, so they are properties, not
 * boolean attributes (an absent attribute reads as false and would refuse every
 * typed code and stop clearing the field). `capture-global` defaults to false
 * and is an attribute; toggling it attaches and removes the document listener.
 * `scan-options` is a JSON attribute or a property. No slot.
 */
const noop = () => undefined;

// Every build sends the full prop set, so a missing `onScan` always means
// "none wired" — never "unchanged".
const withScan = <T extends Partial<ScanInputProps>>(p: T): T => ({ ...p, onScan: p.onScan ?? noop });

defineZenElement<ScanInputProps>({
  tag: "zen-scan-input",
  factory: (props) => {
    const inner = ScanInput(withScan(props));
    return {
      el: inner.el,
      // buildProps omits `onScan` when no one listens and none is assigned;
      // vanilla's update() merges, so a callback taken away is replaced with
      // the no-op here rather than left in place.
      update: (next) => inner.update(withScan(next)),
      destroy: () => inner.destroy(),
    };
  },
  attrs: {
    label: "string",
    placeholder: "string",
    "capture-global": "boolean",
    "scan-options": "json",
    disabled: "boolean",
  },
  props: ["allowTyping", "clearOnScan", "scanOptions"],
  events: { onScan: "zen-scan" },
  childrenProp: false,
});
