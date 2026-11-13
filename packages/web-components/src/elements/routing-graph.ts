import { RoutingGraph, type RoutingGraphProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

/**
 * <zen-routing-graph steps='[…]' links='[{"from":"cut","to":"bend"}]'>
 *
 * Data-driven: no slot. `steps` and `links` are json attributes and JS
 * properties. Read-only with step status until something listens for
 * `zen-links-change` (detail: the new links) — that listener is what makes it
 * editable, as `onLinksChange` does on the factory. The element PROPOSES:
 * `links` changes only when you set it again, which keeps undo yours.
 *
 * `selected` is controlled the same way, with `zen-select` (detail: the step
 * id, or undefined when deselected); leave it unset and the element keeps its
 * own selection. `label` names the graph ("Routing" by default).
 */
defineZenElement<RoutingGraphProps>({
  tag: "zen-routing-graph",
  factory: RoutingGraph,
  attrs: {
    steps: "json",
    links: "json",
    selected: "string",
    label: "string",
  },
  props: ["steps", "links"],
  events: { onLinksChange: "zen-links-change", onSelect: "zen-select" },
  childrenProp: false,
});
