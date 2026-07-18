import { ValueHelp, type ValueHelpProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

// The F4 lookup dialog. `items` is the primary collection (json attr + JS prop).
// `open` is controlled (its presence hands state to the caller) so it is a JS prop;
// `searchable` defaults TRUE so it is a JS prop too. The handle auto-forwards.
defineZenElement<ValueHelpProps>({
  tag: "zen-value-help",
  factory: ValueHelp,
  attrs: {
    title: "string",
    description: "string",
    items: "json",
    multiple: "boolean",
    "search-placeholder": "string",
    "empty-text": "string",
    "confirm-label": "string",
    "cancel-label": "string",
    "select-tab-label": "string",
    "conditions-tab-label": "string",
    "add-condition-label": "string",
  },
  props: ["open", "items", "selectedIds", "conditions", "searchable"],
  events: {
    onOpenChange: "zen-open-change",
    onConfirm: "zen-confirm",
    onSearch: "zen-search",
  },
  childrenProp: false,
});
