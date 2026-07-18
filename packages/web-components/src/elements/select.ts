import { Select, type SelectProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

// Data-driven listbox. `options` is the primary data collection — author it
// inline as JSON, or set el.options = [...] as a JS property.
//
//   <zen-select placeholder="Pick one"
//     options='[{"value":"a","label":"Apple"}]'></zen-select>
defineZenElement<SelectProps>({
  tag: "zen-select",
  factory: Select,
  attrs: {
    value: "string",
    "default-value": "string",
    placeholder: "string",
    disabled: "boolean",
    name: "string",
    label: "string",
    "error-message": "string",
    options: "json",
  },
  props: ["options"],
  events: { onValueChange: "zen-value-change" },
  childrenProp: false,
});
