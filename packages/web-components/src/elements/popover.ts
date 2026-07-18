import { Popover, type PopoverProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

// Anchored panel. open()/close()/isOpen are forwarded onto the element.
// `trigger` and `anchor` are element/component nodes, so they are JS properties.
// `open` is a controlled boolean (presence hands state to the caller) -> a JS
// property; its `default-open` counterpart is a plain boolean attribute.
defineZenElement<PopoverProps>({
  tag: "zen-popover",
  factory: Popover,
  attrs: {
    side: "string",
    align: "string",
    "side-offset": "number",
    "default-open": "boolean",
  },
  props: ["trigger", "anchor", "open"],
  events: { onOpenChange: "zen-open-change" },
  childrenProp: "children",
});
