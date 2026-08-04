import { Splitter, type SplitterProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

/**
 * <zen-splitter default-sizes="[30,70]" panels='[{"min":20},{"min":30}]'>
 *
 * `panels` is json AND a property, exactly as Timeline's `items` is: an array
 * cannot be an attribute any other way, and a two-pane layout seeded from markup
 * is the common case. A panel's `content` is a Node, which JSON cannot express,
 * so a caller with real content sets `el.panels = […]` instead.
 *
 * No slot. The panes come from `panels`, and light-DOM children would have no
 * way to say which pane they belong to — a splitter's children are positional in
 * React only because a context registers them in order.
 */
defineZenElement<SplitterProps>({
  tag: "zen-splitter",
  factory: Splitter,
  attrs: {
    orientation: "string",
    panels: "json",
    sizes: "json",
    "default-sizes": "json",
    disabled: "boolean",
  },
  props: ["panels", "sizes", "defaultSizes", "onSizesChange", "onSizesCommit"],
  events: { onSizesChange: "zen-sizes-change", onSizesCommit: "zen-sizes-commit" },
  childrenProp: false,
});
