import { DropdownMenu, type DropdownMenuProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

// Action-menu on a trigger. `items` is the primary collection (json attr + JS prop);
// each item may carry an onSelect fn, which json cannot express, so json authoring
// suits static menus and callers set the JS prop when items act. `trigger` is the
// caller's trigger element (a JS prop). `open` is controlled -> JS prop; `side` and
// `align` are enums -> string attrs. The handle (open/close/isOpen) auto-forwards.
defineZenElement<DropdownMenuProps>({
  tag: "zen-dropdown-menu",
  factory: DropdownMenu,
  attrs: {
    side: "string",
    align: "string",
    "side-offset": "number",
    "default-open": "boolean",
    items: "json",
  },
  props: ["trigger", "items", "open"],
  events: { onOpenChange: "zen-open-change" },
  childrenProp: false,
});
