import {
  DynamicPage, DynamicPageTitle, DynamicPageHeader, DynamicPageFooter,
  type DynamicPageProps, type DynamicPageTitleProps, type DynamicPageHeaderProps,
} from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

// A page whose header snaps as the content scrolls. The sub-parts are direct
// children slots. `headerExpanded` is the controlled boolean; `headerPinnable`
// and `showFooter` default TRUE, and `defaultHeaderExpanded` defaults TRUE too —
// all three are JS properties, because a boolean attribute can only add presence
// (true), never the false a caller needs.
defineZenElement<DynamicPageProps>({
  tag: "zen-dynamic-page",
  factory: DynamicPage,
  props: ["headerExpanded", "defaultHeaderExpanded", "headerPinnable", "showFooter"],
  events: { onHeaderExpandedChange: "zen-header-expanded-change" },
});

// Title: all slots are named Child props (heading/subheading/actions/…), plus a
// `children` slot for extra title content.
defineZenElement<DynamicPageTitleProps>({
  tag: "zen-dynamic-page-title",
  factory: DynamicPageTitle,
  props: ["heading", "subheading", "actions", "breadcrumbs", "expandedContent", "snappedContent"],
});

// Header: the pin/unpin control's accessible names are plain strings.
defineZenElement<DynamicPageHeaderProps>({
  tag: "zen-dynamic-page-header",
  factory: DynamicPageHeader,
  attrs: {
    "pin-label": "string",
    "unpin-label": "string",
  },
});

// Footer carries no props of its own — it only slots its action bar.
defineZenElement({ tag: "zen-dynamic-page-footer", factory: DynamicPageFooter });
