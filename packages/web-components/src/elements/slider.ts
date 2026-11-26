import { Slider, type SliderProps } from "@algorisys/zen-ui-vanilla";
import { ARIA_LABEL_ATTRS, withAria, type AriaLabelProps } from "../lib/aria";
import { defineZenElement } from "../lib/define";

// <zen-slider value="[50]" max="100" step="1"></zen-slider>
// `value` is ALWAYS an array (single-thumb is [n], range is [lo, hi]) — the
// primary data collection, so a `json` attribute for inline authoring plus a
// `value` property (like tabs). `defaultValue` is an array and `marks` is an
// array of objects, so both are JS properties.
defineZenElement<SliderProps & AriaLabelProps>({
  tag: "zen-slider",
  factory: (props) => {
    const inner = Slider(withAria(props) as SliderProps);
    return {
      el: inner.el,
      update: (next) => inner.update(withAria(next) as Partial<SliderProps>),
      destroy: () => inner.destroy(),
    };
  },
  attrs: {
    ...ARIA_LABEL_ATTRS,
    value: "json",
    min: "number",
    max: "number",
    step: "number",
    disabled: "boolean",
    orientation: "string",
    name: "string",
  },
  props: ["value", "defaultValue", "marks"],
  events: { onValueChange: "zen-value-change", onValueCommit: "zen-value-commit" },
  childrenProp: false,
});
