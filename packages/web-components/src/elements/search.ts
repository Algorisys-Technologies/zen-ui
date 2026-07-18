import { Search, type SearchProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

// <zen-search placeholder="Search components" size="md"></zen-search>
// Controlled `value` (string) as an attribute; onValueChange/onClear are the
// component's own callbacks, not native events, so they fire as CustomEvents.
defineZenElement<SearchProps>({
  tag: "zen-search",
  factory: Search,
  attrs: {
    value: "string",
    "default-value": "string",
    size: "string",
    "clear-label": "string",
    placeholder: "string",
    disabled: "boolean",
    name: "string",
  },
  events: { onValueChange: "zen-value-change", onClear: "zen-clear" },
  childrenProp: false,
});
