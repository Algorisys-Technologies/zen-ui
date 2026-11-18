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
//
// `input-id` lands on the inner <input> for the same reason, so `<zen-label
// for>` can name it (as on <zen-native-select>, <zen-tree-select> and
// <zen-date-input>); the host's own `id` stays the host's.
type InputElementProps = Omit<InputProps, "id"> & { ariaInvalid?: string; inputId?: string };

function toProps(p: Partial<InputElementProps>): Partial<InputProps> {
  const { ariaInvalid, inputId, ...rest } = p;
  const out: Partial<InputProps> = { ...rest };
  // Sent even when unset, so a removed attribute overwrites the merged value.
  if ("ariaInvalid" in p) out["aria-invalid"] = ariaInvalid ?? undefined;
  if ("inputId" in p) out.id = inputId ?? undefined;
  return out;
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
        if ("inputId" in next && next.inputId == null) inner.el.removeAttribute("id");
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
    "input-id": "string",
  },
  props: ["onKeyDown", "onBlur", "onFocus"],
  events: { onInput: "zen-input", onChange: "zen-change" },
  childrenProp: false,
});
