import { MultiCombobox, type MultiComboboxProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

// Multi-select sibling of Combobox. `options` is the primary data collection.
// `value`/`defaultValue` are string[] (arrays cannot be attributes) so they are
// JS properties. `showClearAll` defaults TRUE, so it is a prop — a boolean
// attribute could only ever add presence=true, never the false a caller needs.
defineZenElement<MultiComboboxProps>({
  tag: "zen-multi-combobox",
  factory: MultiCombobox,
  attrs: {
    placeholder: "string",
    "search-placeholder": "string",
    "empty-message": "string",
    "debounce-ms": "number",
    creatable: "boolean",
    "create-label": "string",
    width: "string",
    "max-displayed": "number",
    disabled: "boolean",
    options: "json",
  },
  props: ["options", "value", "defaultValue", "onSearch", "onCreate", "showClearAll"],
  events: { onValueChange: "zen-value-change" },
  childrenProp: false,
});
