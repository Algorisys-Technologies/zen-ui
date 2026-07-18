import { Textarea, type TextareaProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

// <zen-textarea rows="4" placeholder="Tell us more…"></zen-textarea>
// Same shape as zen-input: controlled `value` as an attribute, value-change
// callbacks as events, and the native-mirroring handlers as JS properties.
defineZenElement<TextareaProps>({
  tag: "zen-textarea",
  factory: Textarea,
  attrs: {
    value: "string",
    "default-value": "string",
    placeholder: "string",
    disabled: "boolean",
    "read-only": "boolean",
    required: "boolean",
    name: "string",
    rows: "number",
    cols: "number",
    "max-length": "number",
  },
  props: ["onKeyDown", "onBlur", "onFocus"],
  events: { onInput: "zen-input", onChange: "zen-change" },
  childrenProp: false,
});
