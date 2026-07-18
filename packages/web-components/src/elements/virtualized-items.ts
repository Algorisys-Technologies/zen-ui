import { VirtualizedItems, type VirtualizedItemsDenseProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

// Data-driven windowed list. `items` is the primary collection (json attr + JS prop);
// `children` is the render-prop that turns one item into a row and can only be set as
// a JS property. Typed against the dense variant (the HTML-authorable shape the
// factory's first overload accepts); the sparse-mode fields (total-count / getItem /
// onVisibleRange) are declared as attrs/props/events too so sparse callers also work.
defineZenElement<VirtualizedItemsDenseProps<unknown>>({
  tag: "zen-virtualized-items",
  factory: VirtualizedItems,
  attrs: {
    items: "json",
    "total-count": "number",
    "estimate-size": "number",
    "max-height": "number",
    overscan: "number",
  },
  props: ["items", "children", "getKey", "getItem"],
  events: { onVisibleRange: "zen-visible-range" },
  childrenProp: false,
});
