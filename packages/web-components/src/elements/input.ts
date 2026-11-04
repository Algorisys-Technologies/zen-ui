import { Input, type InputProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

// <zen-input type="email" placeholder="you@algorisys.com"></zen-input>
// `value` is a controlled string, so it stays an attribute (rule 5); native
// `input`/`change` also bubble from the inner <input>, but the value-change
// callbacks are wired as events too. onKeyDown/onBlur/onFocus mirror native
// events and are exposed as JS properties for imperative assignment.
//
// `aria-invalid` is an attribute forwarded to the INNER <input>, which is what
// a screen reader reads (the host is a `display: contents` wrapper, as
// <zen-tile-grid>'s aria-label is forwarded): `aria-invalid="true"` marks the
// field and gives it the error border, as Input's does. Removing the attribute
// removes it from the input too.
type InputElementProps = InputProps & { ariaInvalid?: string };

function toProps(p: Partial<InputElementProps>): Partial<InputProps> {
  const { ariaInvalid, ...rest } = p;
  // Sent even when unset, so a removed attribute overwrites the merged value.
  return "ariaInvalid" in p ? { ...rest, "aria-invalid": ariaInvalid ?? undefined } : rest;
}

defineZenElement<InputElementProps>({
  tag: "zen-input",
  factory: (props) => {
    const inner = Input(toProps(props) as InputProps);
    return {
      el: inner.el,
      update: (next) => {
        inner.update(toProps(next));
        // vanilla's update() merges, and an undefined prop is skipped rather
        // than removed: clear it here when the attribute goes.
        if ("ariaInvalid" in next && next.ariaInvalid == null) inner.el.removeAttribute("aria-invalid");
      },
      destroy: () => inner.destroy(),
    };
  },
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
    "aria-invalid": "string",
  },
  props: ["onKeyDown", "onBlur", "onFocus"],
  events: { onInput: "zen-input", onChange: "zen-change" },
  childrenProp: false,
});
