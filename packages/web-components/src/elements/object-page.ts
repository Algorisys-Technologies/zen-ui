import { ObjectPageLayout, type ObjectPageLayoutProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

// The object detail page: a sticky title, a header that scrolls away, and a
// scroll-spy anchor bar. `sections` is the primary collection — inline as JSON, or
// set `el.sections = [...]` for node-valued titles/content. `selected-section-id`
// is the controlled active section (setting it scrolls there); `header`/`title`
// are Child slots; `showAnchorBar` defaults TRUE → JS property. `children` is the
// title bar's trailing content, so the slot stays on.
defineZenElement<ObjectPageLayoutProps>({
  tag: "zen-object-page-layout",
  factory: ObjectPageLayout,
  attrs: {
    "selected-section-id": "string",
    "default-selected-section-id": "string",
    "anchor-bar-label": "string",
    sections: "json",
  },
  props: ["sections", "header", "title", "showAnchorBar"],
  events: { onSelectedSectionChange: "zen-selected-section-change" },
});
