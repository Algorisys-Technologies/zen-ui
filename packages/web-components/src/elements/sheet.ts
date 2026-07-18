import { Sheet, type SheetProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

// Imperative slide-in panel: open()/close()/isOpen are forwarded onto the element.
// `showCloseButton` and `dismissable` default TRUE, so they are JS properties — a
// boolean attribute can only add presence (true), never express the false a caller
// wants.
defineZenElement<SheetProps>({
  tag: "zen-sheet",
  factory: Sheet,
  attrs: {
    side: "string",
    title: "string",
    description: "string",
  },
  props: ["footer", "showCloseButton", "dismissable"],
  events: { onOpenChange: "zen-open-change" },
  childrenProp: "children",
});
