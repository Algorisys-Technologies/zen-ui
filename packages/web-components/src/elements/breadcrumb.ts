import {
  Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage,
  BreadcrumbSeparator, BreadcrumbEllipsis,
  type BreadcrumbProps, type BreadcrumbLinkProps,
} from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

// <zen-breadcrumb><zen-breadcrumb-list>…</zen-breadcrumb-list></zen-breadcrumb>
// `separator` is a Child (a node), so it is a JS property, not an attribute.
defineZenElement<BreadcrumbProps>({
  tag: "zen-breadcrumb",
  factory: Breadcrumb,
  props: ["separator"],
});

// Structural parts carry no props of their own — they only slot children.
defineZenElement({ tag: "zen-breadcrumb-list", factory: BreadcrumbList });
defineZenElement({ tag: "zen-breadcrumb-item", factory: BreadcrumbItem });
defineZenElement({ tag: "zen-breadcrumb-page", factory: BreadcrumbPage });

// The link's `as`/`href`/`target`/`rel` are plain strings; `onClick` mirrors the
// native bubbling click, so it stays a JS property (the native event bubbles
// through the host already).
defineZenElement<BreadcrumbLinkProps>({
  tag: "zen-breadcrumb-link",
  factory: BreadcrumbLink,
  attrs: {
    as: "string",
    href: "string",
    target: "string",
    rel: "string",
  },
  props: ["onClick"],
});

defineZenElement({ tag: "zen-breadcrumb-separator", factory: BreadcrumbSeparator });

// Renders fixed inner markup ("…" + an sr-only "More"); it never slots caller
// content, so it takes no children.
defineZenElement({ tag: "zen-breadcrumb-ellipsis", factory: BreadcrumbEllipsis, childrenProp: false });
