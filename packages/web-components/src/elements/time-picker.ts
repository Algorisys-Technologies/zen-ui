import { TimePicker, type TimePickerProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

// Segmented time input. The emitted value is always "HH:MM" (or "HH:MM:SS");
// `format` only changes what the user sees.
defineZenElement<TimePickerProps>({
  tag: "zen-time-picker",
  factory: TimePicker,
  attrs: {
    value: "string",
    "default-value": "string",
    format: "string",
    "show-seconds": "boolean",
    "minute-step": "number",
    disabled: "boolean",
    "read-only": "boolean",
    name: "string",
  },
  events: { onValueChange: "zen-value-change" },
  childrenProp: false,
});
