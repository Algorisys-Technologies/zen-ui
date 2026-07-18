import { InputOTP, type InputOTPProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

// <zen-input-otp max-length="6"></zen-input-otp>
// `value` is a controlled string. `groupSizes` is an array, `separator` a Node,
// `pasteTransformer` a function and `style` an object — all JS properties.
// onChange is the deprecated alias of onValueChange; both fire as events.
defineZenElement<InputOTPProps>({
  tag: "zen-input-otp",
  factory: InputOTP,
  attrs: {
    value: "string",
    "default-value": "string",
    "max-length": "number",
    disabled: "boolean",
    "border-color": "string",
    "focus-border-color": "string",
    "slot-class-name": "string",
    "container-class-name": "string",
  },
  props: ["groupSizes", "separator", "pasteTransformer", "style"],
  events: {
    onValueChange: "zen-value-change",
    onChange: "zen-change",
    onComplete: "zen-complete",
  },
  childrenProp: false,
});
