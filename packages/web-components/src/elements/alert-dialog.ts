import { AlertDialog, type AlertDialogProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

// Imperative, like the vanilla factory: the handle's open()/close()/isOpen are
// forwarded onto the element. Unlike Dialog there is no dismissable / close-button
// affordance — a destructive confirm must be answered, not dodged.
defineZenElement<AlertDialogProps>({
  tag: "zen-alert-dialog",
  factory: AlertDialog,
  attrs: {
    title: "string",
    description: "string",
  },
  props: ["footer"],
  events: { onOpenChange: "zen-open-change" },
  childrenProp: "children",
});
