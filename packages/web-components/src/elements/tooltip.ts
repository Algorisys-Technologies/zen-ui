import { Tooltip, type TooltipProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

// The bubble body is the caller's main slot, and it is called `content`, not
// `children` -> childrenProp: "content". The `trigger` (the element the bubble
// anchors to) is a node set as a JS property. show()/hide()/isOpen are forwarded.
// `open` is a controlled boolean -> a JS property; `default-open` is the attribute.
defineZenElement<TooltipProps>({
  tag: "zen-tooltip",
  factory: Tooltip,
  attrs: {
    side: "string",
    "side-offset": "number",
    arrow: "boolean",
    "delay-duration": "number",
    "default-open": "boolean",
  },
  props: ["trigger", "open"],
  events: { onOpenChange: "zen-open-change" },
  childrenProp: "content",
});
