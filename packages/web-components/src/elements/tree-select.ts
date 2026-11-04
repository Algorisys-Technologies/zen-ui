import { TreeSelect, type TreeSelectProps, type ZenComponent } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

/**
 * <zen-label for="account">Account</zen-label>
 * <zen-tree-select input-id="account" default-value="hdfc" leaves-only show-path
 *   placeholder="Pick an account"></zen-tree-select>
 *
 *   field.items = accounts;   // the tree: a JS property (or a JSON attribute for static markup)
 *   field.addEventListener("zen-value-change", (e) => { const [id, node] = e.detail; … });
 *
 * `value` is controlled (the page answers `zen-value-change` by setting it);
 * `default-value` seeds an uncontrolled one. An attribute cannot say null, so a
 * controlled field cannot be cleared from outside: use `default-value` unless
 * the page owns the value.
 *
 * `input-id` and `aria-label` / `aria-labelledby` land on the inner <input>:
 * every zen element is a `display: contents` host, and an id on the host is an
 * id on something `<label for>` cannot name. The factory's own prop is `id`;
 * the attribute is named for where it goes, so the host's `id` stays the
 * host's.
 */
type TreeSelectElementProps = Omit<TreeSelectProps, "id" | "aria-label" | "aria-labelledby"> & {
  inputId?: string;
  ariaLabel?: string;
  ariaLabelledby?: string;
};

const toFactory = ({ inputId, ariaLabel, ariaLabelledby, ...rest }: Partial<TreeSelectElementProps>): Partial<TreeSelectProps> => ({
  ...rest,
  id: inputId,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
});

defineZenElement<TreeSelectElementProps>({
  tag: "zen-tree-select",
  factory: (props) => {
    // No tree yet (`items` usually lands after the element is appended): throw,
    // and the element stays empty and builds when the data arrives (lib/define).
    if (!Array.isArray(props.items)) throw new Error("zen-tree-select: items is not set yet");
    const handle = TreeSelect(toFactory(props) as TreeSelectProps);
    return {
      el: handle.el,
      update: (next) => handle.update(toFactory(next)),
      destroy: () => handle.destroy(),
    } satisfies ZenComponent<TreeSelectElementProps>;
  },
  attrs: {
    items: "json",
    value: "string",
    "default-value": "string",
    placeholder: "string",
    "leaves-only": "boolean",
    "show-path": "boolean",
    "path-separator": "string",
    "default-expanded": "json",
    "empty-message": "string",
    invalid: "boolean",
    disabled: "boolean",
    width: "string",
    "input-id": "string",
    "aria-label": "string",
    "aria-labelledby": "string",
  },
  props: ["items"],
  events: { onValueChange: "zen-value-change" },
  childrenProp: false,
});
