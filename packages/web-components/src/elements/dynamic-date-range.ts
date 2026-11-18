import { DynamicDateRange, type DynamicDateRangeProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

// A date range described as a semantic period (`{ operator, count }`), not two
// fixed dates. `value`/`defaultValue`/`now` are objects/Dates → JS properties.
// `operators` restricts the operator list — a string[] the listbox renders from,
// so it is the primary data collection (json attr + prop).
//
// `el.value = undefined` CLEARS the field and hands it back to its own state,
// as `update({ value: undefined })` does on the factory. That update is not
// idempotent, and the element re-sends every property it holds on EVERY update
// — so without the guard below, one clear would be repeated by every later
// update (an attribute change, a first listener) and wipe out whatever the user
// picked since. `value` therefore reaches the factory only from an actual
// assignment to `el.value`.
const TAG = "zen-dynamic-date-range";

/** True for exactly the synchronous update an `el.value = …` assignment runs. */
let assigningValue = false;

defineZenElement<DynamicDateRangeProps>({
  tag: TAG,
  factory: (props) => {
    const inner = DynamicDateRange(props);
    return {
      el: inner.el,
      update: (next) => {
        if ("value" in next && !assigningValue) {
          const { value: _resent, ...rest } = next;
          next = rest;
        }
        inner.update(next);
      },
      destroy: () => inner.destroy(),
    };
  },
  attrs: {
    "week-starts-on": "number",
    placeholder: "string",
    disabled: "boolean",
    operators: "json",
  },
  props: ["value", "defaultValue", "operators", "now", "formatDate"],
  events: { onValueChange: "zen-value-change" },
  childrenProp: false,
});

// Wrap the `value` accessor define.ts installed, so the update its setter runs
// (synchronously) is the one that passes `value` on.
const ctor = typeof customElements === "undefined" ? undefined : customElements.get(TAG);
const accessor = ctor && Object.getOwnPropertyDescriptor(ctor.prototype, "value");
if (ctor && accessor?.set) {
  const set = accessor.set;
  Object.defineProperty(ctor.prototype, "value", {
    configurable: true,
    get: accessor.get,
    set(this: HTMLElement, v: unknown) {
      assigningValue = true;
      try {
        set.call(this, v);
      } finally {
        assigningValue = false;
      }
    },
  });
}
