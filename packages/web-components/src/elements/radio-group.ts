import {
  RadioGroup,
  RadioGroupItem,
  type RadioGroupProps,
  type RadioGroupItemProps,
} from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

// <zen-radio-group default-value="pro"> …<zen-radio-group-item value="pro"/>… </zen-radio-group>
// The group renders caller markup (items + labels), so it keeps the default
// children slot. `value` is a controlled string.
defineZenElement<RadioGroupProps>({
  tag: "zen-radio-group",
  factory: RadioGroup,
  attrs: {
    value: "string",
    "default-value": "string",
    disabled: "boolean",
    name: "string",
    required: "boolean",
    orientation: "string",
  },
  events: { onValueChange: "zen-value-change" },
});

// The item renders inert markup (the indicator dot); it ignores any children, so
// its light-DOM slot is discarded.
defineZenElement<RadioGroupItemProps>({
  tag: "zen-radio-group-item",
  factory: RadioGroupItem,
  attrs: {
    value: "string",
    size: "string",
    disabled: "boolean",
  },
  childrenProp: false,
});
