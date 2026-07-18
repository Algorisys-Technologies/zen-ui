import { Switch, type SwitchProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

// <zen-switch default-checked></zen-switch>
// `checked` is a controlled prop (its presence hands state to the caller), so it
// is a JS property, not an attribute — a boolean attribute could only ever be
// "present -> controlled-true", never controlled-false or uncontrolled.
defineZenElement<SwitchProps>({
  tag: "zen-switch",
  factory: Switch,
  attrs: {
    "default-checked": "boolean",
    disabled: "boolean",
    required: "boolean",
    name: "string",
    value: "string",
    size: "string",
  },
  props: ["checked"],
  events: { onCheckedChange: "zen-checked-change" },
  childrenProp: false,
});
