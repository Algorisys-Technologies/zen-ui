import {
  SidebarProvider, Sidebar, SidebarHeader, SidebarHeaderLabel, SidebarMenuBadge, SidebarContent,
  SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton,
  SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton, SidebarTrigger,
  type SidebarProviderProps, type SidebarProps, type SidebarHeaderProps,
  type SidebarHeaderLabelProps, type SidebarGroupLabelProps,
  type SidebarMenuButtonProps, type SidebarMenuSubProps, type SidebarMenuSubButtonProps,
  type SidebarTriggerProps,
} from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

// The provider owns the collapse state and hands a context object to the parts.
// `children` is a FUNCTION `(ctx) => Child`, not slottable markup, so the slot is
// off and it is exposed as a JS property instead. `collapsed` is the controlled
// boolean (its presence hands ownership to the caller); `defaultCollapsed`
// defaults false, so it is a plain boolean attribute. `collapse-mode` is
// "icon" | "labelled" | "hidden". `overlay` is JSON because it is `true` OR `{ below }`:
// `overlay="true"`, or `overlay='{"below":900}'`.
defineZenElement<SidebarProviderProps>({
  tag: "zen-sidebar-provider",
  factory: SidebarProvider,
  attrs: { "default-collapsed": "boolean", "collapse-mode": "string", overlay: "json" },
  props: ["collapsed", "children"],
  events: { onCollapsedChange: "zen-collapsed-change" },
  childrenProp: false,
});

// Every part that reacts to collapse takes the provider's context as `sidebar` —
// a JS object, never an attribute.
defineZenElement<SidebarProps>({
  tag: "zen-sidebar",
  factory: Sidebar,
  props: ["sidebar"],
});

// The header's `sidebar` is optional: with it, on a rail the header centres
// its toggle and its text fades: read, not shown.
defineZenElement<SidebarHeaderProps>({
  tag: "zen-sidebar-header",
  factory: SidebarHeader,
  props: ["sidebar"],
});

defineZenElement<SidebarHeaderLabelProps>({
  tag: "zen-sidebar-header-label",
  factory: SidebarHeaderLabel,
  props: ["sidebar"],
});

// Pure-display structural parts — only slot children.
defineZenElement({ tag: "zen-sidebar-menu-badge", factory: SidebarMenuBadge });
defineZenElement({ tag: "zen-sidebar-content", factory: SidebarContent });
defineZenElement({ tag: "zen-sidebar-footer", factory: SidebarFooter });
defineZenElement({ tag: "zen-sidebar-group", factory: SidebarGroup });
defineZenElement({ tag: "zen-sidebar-menu", factory: SidebarMenu });
defineZenElement({ tag: "zen-sidebar-menu-item", factory: SidebarMenuItem });
defineZenElement({ tag: "zen-sidebar-menu-sub-item", factory: SidebarMenuSubItem });

defineZenElement<SidebarGroupLabelProps>({
  tag: "zen-sidebar-group-label",
  factory: SidebarGroupLabel,
  props: ["sidebar"],
});

// `active`/`disabled` default false → boolean attrs; `onClick` mirrors the native
// bubbling click → JS property.
defineZenElement<SidebarMenuButtonProps>({
  tag: "zen-sidebar-menu-button",
  factory: SidebarMenuButton,
  attrs: {
    as: "string",
    active: "boolean",
    disabled: "boolean",
    type: "string",
    href: "string",
    target: "string",
    rel: "string",
  },
  props: ["sidebar", "onClick"],
});

// `label` is `string | Node` and `icon` is a Child → JS properties. `open` is the
// controlled boolean; `defaultOpen`/`active` default false → boolean attrs.
// `badge` is a count or status ("29"): a string attribute.
defineZenElement<SidebarMenuSubProps>({
  tag: "zen-sidebar-menu-sub",
  factory: SidebarMenuSub,
  attrs: {
    "default-open": "boolean",
    active: "boolean",
    badge: "string",
  },
  props: ["sidebar", "label", "icon", "open"],
  events: { onOpenChange: "zen-open-change" },
});

// A leaf row — no `sidebar` context needed.
defineZenElement<SidebarMenuSubButtonProps>({
  tag: "zen-sidebar-menu-sub-button",
  factory: SidebarMenuSubButton,
  attrs: {
    as: "string",
    active: "boolean",
    disabled: "boolean",
    type: "string",
    href: "string",
    target: "string",
    rel: "string",
  },
  props: ["onClick"],
});

defineZenElement<SidebarTriggerProps>({
  tag: "zen-sidebar-trigger",
  factory: SidebarTrigger,
  attrs: { as: "string" },
  props: ["sidebar", "onClick"],
});
