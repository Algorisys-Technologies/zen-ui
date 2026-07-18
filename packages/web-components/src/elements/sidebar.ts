import {
  SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarFooter,
  SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton,
  SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton, SidebarTrigger,
  type SidebarProviderProps, type SidebarProps, type SidebarGroupLabelProps,
  type SidebarMenuButtonProps, type SidebarMenuSubProps, type SidebarMenuSubButtonProps,
  type SidebarTriggerProps,
} from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

// The provider owns the collapse state and hands a context object to the parts.
// `children` is a FUNCTION `(ctx) => Child`, not slottable markup, so the slot is
// off and it is exposed as a JS property instead. `collapsed` is the controlled
// boolean (its presence hands ownership to the caller); `defaultCollapsed`
// defaults false, so it is a plain boolean attribute.
defineZenElement<SidebarProviderProps>({
  tag: "zen-sidebar-provider",
  factory: SidebarProvider,
  attrs: { "default-collapsed": "boolean" },
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

// Pure-display structural parts — only slot children.
defineZenElement({ tag: "zen-sidebar-header", factory: SidebarHeader });
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
defineZenElement<SidebarMenuSubProps>({
  tag: "zen-sidebar-menu-sub",
  factory: SidebarMenuSub,
  attrs: {
    "default-open": "boolean",
    active: "boolean",
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
