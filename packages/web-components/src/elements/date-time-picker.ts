import { DateTimePicker, type DateTimePickerProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

// `value`/`defaultValue` are Date objects → JS properties. `disabled`
// (boolean | predicate): boolean as attribute, predicate as property.
defineZenElement<DateTimePickerProps>({
  tag: "zen-date-time-picker",
  factory: DateTimePicker,
  attrs: {
    placeholder: "string",
    disabled: "boolean",
    format: "string",
    "show-seconds": "boolean",
    "minute-step": "number",
  },
  props: ["value", "defaultValue", "disabled", "formatDate", "formatTime"],
  events: { onValueChange: "zen-value-change" },
  childrenProp: false,
});
