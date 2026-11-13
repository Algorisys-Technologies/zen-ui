import { ColumnMapper, type ColumnMapperProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

/**
 * <zen-column-mapper rows='[["Order","SKU"],["WO-1","BR-4471"]]' fields='[…]'>
 *
 * Data-driven: no slot. `rows` is the file's rows, header first — what
 * `parseDelimited(text)` returns, which is re-exported from this package's
 * vanilla dependency. `rows`, `fields`, `mapping` and `default-mapping` are
 * json attributes and JS properties; set the property for anything read from a
 * file, since a spreadsheet does not belong in an attribute.
 *
 * `mapping` is controlled, as everywhere in this binding: set it again from
 * `zen-change` (detail: [mapping, validation]) or leave it unset and the
 * element keeps its own, starting from `default-mapping` or the automatic
 * match. `validation.ok` is the "can import" answer.
 *
 * Numbers and dates in the preview are read in the locale of the
 * <zen-locale-provider> around the element — a German export's "1.200,5" is a
 * number only under de-DE.
 */
defineZenElement<ColumnMapperProps>({
  tag: "zen-column-mapper",
  factory: ColumnMapper,
  attrs: {
    rows: "json",
    fields: "json",
    mapping: "json",
    "default-mapping": "json",
    "preview-rows": "number",
  },
  props: ["rows", "fields", "mapping", "defaultMapping"],
  events: { onChange: "zen-change" },
  childrenProp: false,
});
