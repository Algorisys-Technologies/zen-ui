import { InputOTP, type InputOTPProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

// <zen-input-otp max-length="6"></zen-input-otp>
// `value` is a controlled string. `groupSizes` is an array, `separator` a Node
// and `pasteTransformer` a function — all JS properties.
//
// The factory's `style` prop is deliberately NOT among them: on a custom element
// `style` is already HTMLElement's own, and declaring it here replaced that with
// an accessor returning undefined, so connectedCallback threw on every instance
// and the OTP page rendered nothing. define.ts refuses the collision now, so this
// line is belt and braces — but the prop was never reachable anyway. Style the
// element with `class`, or with its real inline style.
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
  props: ["groupSizes", "separator", "pasteTransformer"],
  events: {
    onValueChange: "zen-value-change",
    onChange: "zen-change",
    onComplete: "zen-complete",
  },
  childrenProp: false,
});
