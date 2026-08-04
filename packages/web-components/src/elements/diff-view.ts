import { DiffView, type DiffViewProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

/**
 * <zen-diff-view before='{"status":"pending"}' after='{"status":"approved"}'>
 *
 * `before` and `after` are STRING attributes, not json, and that is deliberate.
 * The component accepts a raw string that is not JSON — a line of prose out of an
 * nvarchar audit column — and shows it as the text it is; its own `parseSnapshot`
 * does the parsing and never throws. Declaring them `json` here would hand that
 * job to the attribute coercion instead, which logs an error and yields undefined
 * on anything unparseable, so `before="cancelled by operator"` would render as
 * "not set" and print to the console. Measured against coerce(): that is exactly
 * what `json` does with it.
 *
 * A caller holding real objects sets the properties (`el.before = {…}`), which is
 * the normal path from a framework template anyway.
 *
 * No slot: the rows come from the two snapshots.
 */
defineZenElement<DiffViewProps>({
  tag: "zen-diff-view",
  factory: DiffView,
  attrs: {
    before: "string",
    after: "string",
    keys: "json",
    labels: "json",
    headings: "json",
    // Defaults to TRUE — json, so absent means "unset" rather than false.
    "changed-only": "json",
    density: "string",
    "empty-message": "string",
  },
  props: ["before", "after", "keys", "labels", "headings", "format", "parse", "emptyMessage"],
  childrenProp: false,
});
