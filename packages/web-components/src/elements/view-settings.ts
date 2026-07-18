import { ViewSettingsDialog, type ViewSettingsDialogProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

// Sort / group / filter settings dialog. It has three co-equal data collections
// (sortItems / groupItems / filterGroups), so none is a single "primary" — all are
// JS props, no json attr. The handle (open/close/isOpen) auto-forwards.
defineZenElement<ViewSettingsDialogProps>({
  tag: "zen-view-settings-dialog",
  factory: ViewSettingsDialog,
  attrs: {
    title: "string",
    description: "string",
    "confirm-label": "string",
    "cancel-label": "string",
    "reset-label": "string",
    "sort-tab-label": "string",
    "group-tab-label": "string",
    "filter-tab-label": "string",
  },
  props: ["sortItems", "groupItems", "filterGroups", "value"],
  events: {
    onConfirm: "zen-confirm",
    onOpenChange: "zen-open-change",
  },
  childrenProp: false,
});
