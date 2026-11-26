import {
  RadioGroup,
  RadioGroupItem,
  type RadioGroupProps,
  type RadioGroupItemProps,
} from "@algorisys/zen-ui-vanilla";
import { ARIA_LABEL_ATTRS, withAria, type AriaLabelProps } from "../lib/aria";
import { defineZenElement } from "../lib/define";

// <zen-radio-group default-value="pro"> …<zen-radio-group-item value="pro"/>… </zen-radio-group>
// The group renders caller markup (items + labels), so it keeps the default
// children slot. `value` is a controlled string.
defineZenElement<RadioGroupProps & AriaLabelProps>({
  tag: "zen-radio-group",
  factory: (props) => {
    const inner = RadioGroup(withAria(props) as RadioGroupProps);
    return {
      el: inner.el,
      update: (next) => inner.update(withAria(next) as Partial<RadioGroupProps>),
      destroy: () => inner.destroy(),
    };
  },
  attrs: {
    ...ARIA_LABEL_ATTRS,
    value: "string",
    "default-value": "string",
    disabled: "boolean",
    name: "string",
    required: "boolean",
    orientation: "string",
    label: "string",
    description: "string",
  },
  events: { onValueChange: "zen-value-change" },
});

// The item renders inert markup (the indicator dot); it ignores any children, so
// its light-DOM slot is discarded. `label` gives it its text — read when the
// element connects, so set it in the markup rather than toggling it later.
defineZenElement<RadioGroupItemProps & AriaLabelProps>({
  tag: "zen-radio-group-item",
  factory: (props) => {
    const inner = RadioGroupItem(withAria(props) as RadioGroupItemProps);
    return {
      el: inner.el,
      update: (next) => inner.update(withAria(next) as Partial<RadioGroupItemProps>),
      destroy: () => inner.destroy(),
    };
  },
  attrs: {
    ...ARIA_LABEL_ATTRS,
    value: "string",
    size: "string",
    disabled: "boolean",
    label: "string",
  },
  childrenProp: false,
});
