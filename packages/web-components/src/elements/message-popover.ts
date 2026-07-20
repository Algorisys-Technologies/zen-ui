import { MessagePopover, type MessagePopoverProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

// `messages` is structured data, so it comes in as a property rather than an
// attribute — the same treatment DataTable's rows and columns get.
defineZenElement<MessagePopoverProps>({
  tag: "zen-message-popover",
  factory: MessagePopover,
  attrs: {
    "empty-message": "string",
    "max-body-height": "number",
    "trigger-label": "string",
    "disable-navigation": "boolean",
  },
});
