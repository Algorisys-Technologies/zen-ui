import { ScrollArea, ScrollBar, type ScrollBarProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

// <zen-scroll-area class="zen-h-48 zen-w-64">…</zen-scroll-area>
// ScrollAreaProps is just BaseProps — no primitives of its own; it only slots
// content (and, in the factory API, a ScrollBar child for the horizontal axis).
defineZenElement({ tag: "zen-scroll-area", factory: ScrollArea });

// The horizontal-axis bar. On its own it is inert markup; `orientation` defaults
// to "vertical" and it renders no caller content.
defineZenElement<ScrollBarProps>({
  tag: "zen-scroll-bar",
  factory: ScrollBar,
  attrs: { orientation: "string" },
  childrenProp: false,
});
