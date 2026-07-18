import { SelectDialog, type SelectDialogProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

// The list picker. `items` is the primary collection (json attr + JS prop).
// `searchable` and `showClearAll` default TRUE, so they are JS props — a boolean
// attribute could only ever add presence, never the false a caller needs. The
// handle (open/close/isOpen) auto-forwards.
defineZenElement<SelectDialogProps>({
  tag: "zen-select-dialog",
  factory: SelectDialog,
  attrs: {
    title: "string",
    description: "string",
    items: "json",
    multiple: "boolean",
    "search-placeholder": "string",
    "empty-text": "string",
    "confirm-label": "string",
    "cancel-label": "string",
    "clear-label": "string",
  },
  props: ["items", "selectedIds", "searchable", "showClearAll"],
  events: {
    onConfirm: "zen-confirm",
    onSearch: "zen-search",
    onOpenChange: "zen-open-change",
  },
  childrenProp: false,
});
