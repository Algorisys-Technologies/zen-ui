import { ContextMenu, type ContextMenuProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

// The menu a right-click opens. The element WRAPS its trigger area's content:
// its light-DOM children become the area (`children`), and the host's `class`
// lands on the area, as for every element. `items` takes the same specs as
// <zen-dropdown-menu> (json attr for static menus, JS prop when items act).
// `content-class` is the menu panel's class. Listen for `zen-context-menu` to
// read what was right-clicked and set `items` before the menu opens (the
// event's detail is the MouseEvent; detail.preventDefault() keeps it shut).
// The handle's close()/isOpen auto-forward.
defineZenElement<ContextMenuProps>({
  tag: "zen-context-menu",
  factory: ContextMenu,
  attrs: {
    disabled: "boolean",
    "content-class": "string",
    items: "json",
  },
  props: ["items"],
  events: {
    onOpenChange: "zen-open-change",
    onContextMenu: "zen-context-menu",
    onCloseAutoFocus: "zen-close-auto-focus",
  },
});
