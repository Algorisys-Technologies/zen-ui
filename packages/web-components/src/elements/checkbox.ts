import { Checkbox, type CheckboxProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

// <zen-checkbox default-checked></zen-checkbox>
// Like zen-switch: `checked` is controlled (its presence hands state to the
// caller, and it can even be "indeterminate"), so it is a JS property — a boolean
// attribute could only ever add presence=true. `defaultChecked` is the
// uncontrolled seed and stays a boolean attribute.
//
// `input-id` lands on the inner checkbox <button> (a labelable element), so
// `<zen-label for>` names and toggles it — the host is a `display: contents`
// wrapper, and an id there is an id on something a label cannot name. Same
// attribute as <zen-input> and <zen-native-select>; the host's `id` stays the
// host's.
type CheckboxElementProps = Omit<CheckboxProps, "id"> & { inputId?: string };

const toFactory = ({ inputId, ...rest }: Partial<CheckboxElementProps>): Partial<CheckboxProps> => ({
  ...rest,
  // Checkbox clears the id itself when it is undefined.
  id: inputId,
});

defineZenElement<CheckboxElementProps>({
  tag: "zen-checkbox",
  factory: (props) => {
    const inner = Checkbox(toFactory(props) as CheckboxProps);
    return {
      el: inner.el,
      update: (next) => inner.update(toFactory(next)),
      destroy: () => inner.destroy(),
    };
  },
  attrs: {
    "default-checked": "boolean",
    size: "string",
    disabled: "boolean",
    required: "boolean",
    name: "string",
    value: "string",
    "input-id": "string",
  },
  props: ["checked"],
  events: { onCheckedChange: "zen-checked-change" },
  childrenProp: false,
});
