import { DateRangePicker, type DateRangePickerProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

// `value`/`defaultValue` are `{ from?, to? }` DateRange objects → JS properties.
// `disabled` (boolean | predicate): boolean as attribute, predicate as property.
defineZenElement<DateRangePickerProps>({
  tag: "zen-date-range-picker",
  factory: DateRangePicker,
  attrs: {
    placeholder: "string",
    disabled: "boolean",
    "number-of-months": "number",
    "cancel-label": "string",
    "done-label": "string",
  },
  props: ["value", "defaultValue", "disabled", "formatDate"],
  events: { onValueChange: "zen-value-change" },
  childrenProp: false,
});
