import { Checkbox, type CheckboxProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

// <zen-checkbox default-checked></zen-checkbox>
// Like zen-switch: `checked` is controlled (its presence hands state to the
// caller, and it can even be "indeterminate"), so it is a JS property — a boolean
// attribute could only ever add presence=true. `defaultChecked` is the
// uncontrolled seed and stays a boolean attribute.
defineZenElement<CheckboxProps>({
  tag: "zen-checkbox",
  factory: Checkbox,
  attrs: {
    "default-checked": "boolean",
    size: "string",
    disabled: "boolean",
    required: "boolean",
    name: "string",
    value: "string",
  },
  props: ["checked"],
  events: { onCheckedChange: "zen-checked-change" },
  childrenProp: false,
});
