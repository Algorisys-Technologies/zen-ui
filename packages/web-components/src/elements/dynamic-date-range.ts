import { DynamicDateRange, type DynamicDateRangeProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

// A date range described as a semantic period (`{ operator, count }`), not two
// fixed dates. `value`/`defaultValue`/`now` are objects/Dates → JS properties.
// `operators` restricts the operator list — a string[] the listbox renders from,
// so it is the primary data collection (json attr + prop).
defineZenElement<DynamicDateRangeProps>({
  tag: "zen-dynamic-date-range",
  factory: DynamicDateRange,
  attrs: {
    "week-starts-on": "number",
    placeholder: "string",
    disabled: "boolean",
    operators: "json",
  },
  props: ["value", "defaultValue", "operators", "now", "formatDate"],
  events: { onValueChange: "zen-value-change" },
  childrenProp: false,
});
