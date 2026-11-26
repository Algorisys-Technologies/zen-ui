import { Switch, type SwitchProps } from "@algorisys/zen-ui-vanilla";
import { ARIA_LABEL_ATTRS, withAria, type AriaLabelProps } from "../lib/aria";
import { defineZenElement } from "../lib/define";

// <zen-switch default-checked></zen-switch>
// `checked` is a controlled prop (its presence hands state to the caller), so it
// is a JS property, not an attribute — a boolean attribute could only ever be
// "present -> controlled-true", never controlled-false or uncontrolled.
defineZenElement<SwitchProps & AriaLabelProps>({
  tag: "zen-switch",
  factory: (props) => {
    const inner = Switch(withAria(props) as SwitchProps);
    return {
      el: inner.el,
      update: (next) => inner.update(withAria(next) as Partial<SwitchProps>),
      destroy: () => inner.destroy(),
    };
  },
  attrs: {
    ...ARIA_LABEL_ATTRS,
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
