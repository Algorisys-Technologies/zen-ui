import { Dialog, type DialogProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

// Imperative, like the vanilla factory: the handle's open()/close()/isOpen are
// forwarded onto the element, so `document.querySelector("zen-dialog").open()`.
// `dismissable` and `showCloseButton` default TRUE, so they are JS properties —
// a boolean attribute can only add presence (true), never express the false a
// caller actually wants.
defineZenElement<DialogProps>({
  tag: "zen-dialog",
  factory: Dialog,
  attrs: {
    title: "string",
    description: "string",
    // `variant="paper"` turns the panel into a document sheet — top-anchored,
    // wider, and scrolling the viewport rather than the panel. A plain string
    // attribute because it is authored declaratively and defaults to "default".
    variant: "string",
  },
  props: ["footer", "dismissable", "showCloseButton"],
  events: { onOpenChange: "zen-open-change" },
  childrenProp: "children",
});
