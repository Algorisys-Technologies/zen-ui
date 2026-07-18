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
  },
  props: ["footer", "dismissable", "showCloseButton"],
  events: { onOpenChange: "zen-open-change" },
  childrenProp: "children",
});
