import { Slider, type SliderProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

// <zen-slider value="[50]" max="100" step="1"></zen-slider>
// `value` is ALWAYS an array (single-thumb is [n], range is [lo, hi]) — the
// primary data collection, so a `json` attribute for inline authoring plus a
// `value` property (like tabs). `defaultValue` is an array and `marks` is an
// array of objects, so both are JS properties.
defineZenElement<SliderProps>({
  tag: "zen-slider",
  factory: Slider,
  attrs: {
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
