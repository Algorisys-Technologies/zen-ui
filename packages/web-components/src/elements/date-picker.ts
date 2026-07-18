import {
  Calendar,
  DatePicker,
  type CalendarProps,
  type DatePickerProps,
} from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

// `selected`/`value`/`defaultValue` are Date | Date[] | DateRange objects — not
// serialisable to an attribute — so they are JS properties.
// `disabled` is boolean | ((d: Date) => boolean): the boolean case is an
// attribute (HTML `disabled`), the predicate case is settable as a JS property;
// both are declared so either authoring style reaches the factory.
defineZenElement<CalendarProps>({
  tag: "zen-calendar",
  factory: Calendar,
  attrs: {
    mode: "string",
    "number-of-months": "number",
    disabled: "boolean",
  },
  props: ["selected", "disabled"],
  events: { onSelect: "zen-select" },
  childrenProp: false,
});

defineZenElement<DatePickerProps>({
  tag: "zen-date-picker",
  factory: DatePicker,
  attrs: {
    placeholder: "string",
    disabled: "boolean",
  },
  props: ["value", "defaultValue", "disabled", "formatDate"],
  events: { onValueChange: "zen-value-change" },
  childrenProp: false,
});
