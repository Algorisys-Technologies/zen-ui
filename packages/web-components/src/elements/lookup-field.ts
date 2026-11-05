import { LookupField, type LookupFieldProps, type ZenComponent } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

/**
 * <zen-label for="item">Item</zen-label>
 * <zen-lookup-field input-id="item" placeholder="Code, name or group"></zen-lookup-field>
 *
 *   field.columns = [{ key: "code", header: "Code", width: "7rem" }, { key: "name", header: "Item" }];
 *   field.rows = items;                       // or field.onSearch = (q, signal) => api.items(q, { signal })
 *   field.rowKey = (i) => i.code;
 *   field.rowLabel = (i) => `${i.code} · ${i.name}`;
 *   field.addEventListener("zen-value-change", (e) => { field.value = e.detail; });  // the row, whole, or null
 *   field.onValueHelp = (q) => openValueHelp(q);   // F4, and the search button
 *
 * `rows`, `columns`, `value`, `defaultValue`, `rowKey`, `rowLabel`, `onSearch`
 * and `onValueHelp` are JS properties: rows are objects and the rest are
 * functions, none of which an attribute can carry. Setting `value` (null
 * included) makes the field controlled; leave it unset for an uncontrolled
 * one seeded by `defaultValue`.
 *
 * `input-id` and `aria-label` / `aria-labelledby` land on the inner <input>, as
 * on <zen-tree-select>: every zen element is a `display: contents` host, and an
 * id on the host is an id on something `<label for>` cannot name.
 */
type LookupFieldElementProps = Omit<LookupFieldProps<unknown>, "id" | "aria-label" | "aria-labelledby"> & {
  inputId?: string;
  ariaLabel?: string;
  ariaLabelledby?: string;
};

const toFactory = ({ inputId, ariaLabel, ariaLabelledby, ...rest }: Partial<LookupFieldElementProps>): Partial<LookupFieldProps<unknown>> => ({
  ...rest,
  id: inputId,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
});

defineZenElement<LookupFieldElementProps>({
  tag: "zen-lookup-field",
  factory: (props) => {
    // No columns or key yet (they usually land after the element is appended):
    // throw, and the element stays empty and builds when they arrive (lib/define).
    if (!Array.isArray(props.columns) || typeof props.rowKey !== "function") {
      throw new Error("zen-lookup-field: columns and rowKey are not set yet");
    }
    const handle = LookupField(toFactory(props) as LookupFieldProps<unknown>);
    return {
      el: handle.el,
      update: (next) => handle.update(toFactory(next)),
      destroy: () => handle.destroy(),
    } satisfies ZenComponent<LookupFieldElementProps>;
  },
  attrs: {
    "min-query-length": "number",
    debounce: "number",
    "max-rows": "number",
    placeholder: "string",
    "empty-message": "string",
    invalid: "boolean",
    disabled: "boolean",
    width: "string",
    "list-width": "string",
    "input-id": "string",
    "aria-label": "string",
    "aria-labelledby": "string",
  },
  props: ["columns", "rows", "value", "defaultValue", "rowKey", "rowLabel", "onSearch", "onValueHelp"],
  events: { onValueChange: "zen-value-change" },
  childrenProp: false,
});
