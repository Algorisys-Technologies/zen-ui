import { Input, type InputProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

// <zen-input type="email" placeholder="you@algorisys.com"></zen-input>
// `value` is a controlled string, so it stays an attribute (rule 5); native
// `input`/`change` also bubble from the inner <input>, but the value-change
// callbacks are wired as events too. onKeyDown/onBlur/onFocus mirror native
// events and are exposed as JS properties for imperative assignment.
defineZenElement<InputProps>({
  tag: "zen-input",
  factory: Input,
  attrs: {
    type: "string",
    value: "string",
    "default-value": "string",
    placeholder: "string",
    disabled: "boolean",
    "read-only": "boolean",
    required: "boolean",
    name: "string",
    "input-mode": "string",
    autocomplete: "string",
  },
  props: ["onKeyDown", "onBlur", "onFocus"],
  events: { onInput: "zen-input", onChange: "zen-change" },
  childrenProp: false,
});
