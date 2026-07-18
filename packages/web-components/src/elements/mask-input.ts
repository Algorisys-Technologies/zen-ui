import { MaskInput, type MaskInputProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

// <zen-mask-input mask="99-9999"></zen-mask-input>
// `rules` is a MaskRules config object (symbols and their matchers), so it is a
// JS property, not an attribute. `value` is the MASKED string (controlled).
defineZenElement<MaskInputProps>({
  tag: "zen-mask-input",
  factory: MaskInput,
  attrs: {
    mask: "string",
    "placeholder-char": "string",
    value: "string",
    "default-value": "string",
    placeholder: "string",
    disabled: "boolean",
    name: "string",
  },
  props: ["rules"],
  events: { onValueChange: "zen-value-change" },
  childrenProp: false,
});
