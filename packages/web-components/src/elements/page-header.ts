import { PageHeader, type PageHeaderProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

// <zen-page-header back-label="Back"></zen-page-header>
// PageHeaderProps omits `children`: the slots (title/subtitle/actions/info/
// breadcrumb) are all named Child props, so they are JS properties and the
// element takes no light-DOM slot. `backLabel` is the one plain string.
// `onBack` fires when the back affordance is pressed → a CustomEvent.
defineZenElement<PageHeaderProps>({
  tag: "zen-page-header",
  factory: PageHeader,
  attrs: { "back-label": "string" },
  props: ["title", "subtitle", "actions", "info", "breadcrumb"],
  events: { onBack: "zen-back" },
  childrenProp: false,
});
