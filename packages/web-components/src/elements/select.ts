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
    invalid: "boolean",
    options: "json",
    required: "boolean",
    "default-open": "boolean",
  },
  props: ["options"],
  /* onChange is the Solid binding's name for the same change; as an element it
     is the one `zen-value-change` event, so the two are not doubled up. */
  events: { onValueChange: "zen-value-change", onOpenChange: "zen-open-change" },
  childrenProp: false,
});
