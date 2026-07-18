import {
  FlexibleColumnLayout, type FlexibleColumnLayoutProps,
} from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

// <zen-flexible-column-layout layout="TwoColumnsMidExpanded"></zen-flexible-column-layout>
// Controlled: `layout` is an enum string the app drives. The columns are Child
// slots (JS properties) — a stray light-DOM child would render as an unsized
// fourth column, so there is no children slot. `onLayoutChange` reports the
// rendered result (a notification, not a value to echo back) → a CustomEvent.
defineZenElement<FlexibleColumnLayoutProps>({
  tag: "zen-flexible-column-layout",
  factory: FlexibleColumnLayout,
  attrs: { layout: "string" },
  props: ["startColumn", "midColumn", "endColumn"],
  events: { onLayoutChange: "zen-layout-change" },
  childrenProp: false,
});
