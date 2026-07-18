import { Combobox, type ComboboxProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

// Searchable single-select. `options` is the primary data collection (json attr
// + prop). `onSearch`/`onCreate` are functions that RETURN data to the component
// (a Promise of options, a new option), so they are JS properties, not events —
// an event wrapper would discard their return value.
defineZenElement<ComboboxProps>({
  tag: "zen-combobox",
  factory: Combobox,
  attrs: {
    value: "string",
    "default-value": "string",
    placeholder: "string",
    "search-placeholder": "string",
    "empty-message": "string",
    "debounce-ms": "number",
    creatable: "boolean",
    "create-label": "string",
    width: "string",
    disabled: "boolean",
    options: "json",
  },
  props: ["options", "onSearch", "onCreate"],
  events: { onValueChange: "zen-value-change" },
  childrenProp: false,
});
