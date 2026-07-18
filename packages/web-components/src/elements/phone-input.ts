import { PhoneInput, type PhoneInputProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

// <zen-phone-input></zen-phone-input> then el.value = { country: "+91", number: "" }
// `value`/`defaultValue` are PhoneValue objects and `countries` is an array, so all
// are JS properties, not attributes.
defineZenElement<PhoneInputProps>({
  tag: "zen-phone-input",
  factory: PhoneInput,
  attrs: {
    placeholder: "string",
    disabled: "boolean",
    name: "string",
  },
  props: ["value", "defaultValue", "countries"],
  events: { onValueChange: "zen-value-change" },
  childrenProp: false,
});
