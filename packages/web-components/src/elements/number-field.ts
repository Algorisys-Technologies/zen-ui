import { NumberField, type NumberFieldProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

// <zen-number-field min="0" max="100" step="1"></zen-number-field>
// `value` is a controlled number (or null when cleared) — a number attribute.
defineZenElement<NumberFieldProps>({
  tag: "zen-number-field",
  factory: NumberField,
  attrs: {
    value: "number",
    "default-value": "number",
    min: "number",
    max: "number",
    step: "number",
    disabled: "boolean",
    name: "string",
    placeholder: "string",
    required: "boolean",
    "read-only": "boolean",
  },
  events: { onValueChange: "zen-value-change" },
  childrenProp: false,
});
