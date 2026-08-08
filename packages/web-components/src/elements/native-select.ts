import { NativeSelect, type NativeSelectProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

// <zen-native-select name="dept_id" options='[{"value":"1","label":"Sales"}]'>
//
// Data-driven from `options`, like every other list family here, so
// `childrenProp` is false. `options` is authorable inline as JSON or set as a
// property.
//
// `value` is the CONTROLLED prop and stays a JS property: a string attribute
// could carry it, but the pattern this binding follows is that the controlled
// half is a property and the uncontrolled seed is the attribute.
defineZenElement<NativeSelectProps>({
  tag: "zen-native-select",
  factory: NativeSelect,
  attrs: {
    options: "json",
    "default-value": "string",
    name: "string",
    disabled: "boolean",
    required: "boolean",
  },
  props: ["options", "value"],
  events: { onChange: "zen-change" },
  childrenProp: false,
});
