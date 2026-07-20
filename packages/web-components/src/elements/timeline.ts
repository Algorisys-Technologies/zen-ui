import { Timeline, type TimelineProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

/**
 * <zen-timeline items='[…]'>
 *
 * `items` is json AND a property. An array cannot be an attribute any other way,
 * and a history seeded from markup is the common case for this component — but
 * an item may carry a `children` Node, which JSON cannot express, so a caller
 * with a rich body sets `el.items = […]` instead.
 *
 * No slot: the events come from `items`, so light-DOM children are discarded
 * rather than silently appended beside the list.
 */
defineZenElement<TimelineProps>({
  tag: "zen-timeline",
  factory: Timeline,
  attrs: { items: "json", density: "string", "empty-message": "string" },
  props: ["items", "emptyMessage"],
  childrenProp: false,
});
