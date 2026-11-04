import { FilterBuilder, type FilterBuilderProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

/**
 * <zen-filter-builder aria-label="Invoice filter" max-depth="3"></zen-filter-builder>
 *
 *   builder.fields = fields;
 *   builder.value = filter;
 *   builder.addEventListener("zen-value-change", (e) => (builder.value = filter = e.detail));
 *
 * `fields` and `value` are data, so JS properties (or JSON attributes for static
 * markup). Setting `value` makes it controlled, as everywhere: an edit is
 * reported as `zen-value-change` and drawn once the page sets `value` back.
 * Leave `value` unset and give `default-value` (or `defaultValue`) for a builder
 * that keeps its own tree. Setting `value` again reconciles by node id inside
 * the factory, so the row being typed into keeps its input and focus, and a
 * value set from outside is never reported back.
 *
 * `show-summary` defaults to true, so it is a JSON attribute
 * (`show-summary="false"`). `formatValue` is a function: a JS property. The
 * builder's name has to reach the inner `role="group"`, not the
 * `display: contents` host, so `aria-label` is forwarded to it.
 */
type FilterBuilderElementProps = Omit<FilterBuilderProps, "aria-label"> & { ariaLabel?: string };

const toProps = (p: Partial<FilterBuilderElementProps>): Partial<FilterBuilderProps> => {
  const { ariaLabel, ...rest } = p;
  const out: Partial<FilterBuilderProps> = { ...rest };
  if ("ariaLabel" in p) out["aria-label"] = ariaLabel;
  return out;
};

defineZenElement<FilterBuilderElementProps>({
  tag: "zen-filter-builder",
  factory: (props) => {
    const inner = FilterBuilder(toProps(props) as FilterBuilderProps);
    return {
      el: inner.el,
      update: (next) => inner.update(toProps(next)),
      destroy: () => inner.destroy(),
    };
  },
  attrs: {
    fields: "json",
    value: "json",
    "default-value": "json",
    "max-depth": "number",
    "show-summary": "json",
    "aria-label": "string",
  },
  props: ["fields", "value", "defaultValue", "formatValue"],
  events: { onValueChange: "zen-value-change" },
  childrenProp: false,
});
