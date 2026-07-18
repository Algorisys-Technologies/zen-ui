import { ShellBar, type ShellBarProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

// The global application header. `items` (custom action icons that overflow into
// a menu) and `profile` are data — authorable inline as JSON or set as JS
// properties (`el.items = [...]`) for richer node-valued labels. `menuItems`
// (the product-switcher) and `logo` are node/array props only.
//
//   <zen-shell-bar primary-title="Orders" searchable
//     items='[{"id":"a","label":"Add","icon":"plus"}]'></zen-shell-bar>
//
// `searchable` defaults false → boolean attr. The click-style callbacks map to
// CustomEvents.
defineZenElement<ShellBarProps>({
  tag: "zen-shell-bar",
  factory: ShellBar,
  attrs: {
    "primary-title": "string",
    "secondary-title": "string",
    searchable: "boolean",
    "search-placeholder": "string",
    "notification-count": "number",
    "overflow-label": "string",
    items: "json",
    profile: "json",
  },
  props: ["logo", "menuItems", "profile", "items"],
  events: {
    onSearch: "zen-search",
    onNotificationsClick: "zen-notifications-click",
    onLogoClick: "zen-logo-click",
  },
});
