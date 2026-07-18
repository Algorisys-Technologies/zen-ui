import { PasswordInput, type PasswordInputProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

// <zen-password-input placeholder="Password" autocomplete="current-password"></zen-password-input>
// `type` is owned by the component (it flips password/text), so it is not a prop.
defineZenElement<PasswordInputProps>({
  tag: "zen-password-input",
  factory: PasswordInput,
  attrs: {
    value: "string",
    "default-value": "string",
    placeholder: "string",
    disabled: "boolean",
    required: "boolean",
    name: "string",
    autocomplete: "string",
    "show-label": "string",
    "hide-label": "string",
  },
  events: { onInput: "zen-input", onChange: "zen-change" },
  childrenProp: false,
});
