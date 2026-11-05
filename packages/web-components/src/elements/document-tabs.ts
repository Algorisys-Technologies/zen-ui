import { DocumentTabs, type DocumentTabsProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

/**
 * <zen-document-tabs active-id="si12"></zen-document-tabs>
 *
 *   strip.tabs = [{ id: "si12", label: "SI/26/00012", description: "Sales Invoice", dirty: true }, …];
 *   strip.addEventListener("zen-select", (e) => (strip.activeId = e.detail));
 *   strip.addEventListener("zen-close", (e) => (strip.tabs = strip.tabs.filter((t) => t.id !== e.detail)));
 *   strip.addEventListener("zen-pin-change", (e) => { const [id, pinned] = e.detail; … });
 *
 * `tabs` is the data (a JS property, or a JSON attribute for static markup);
 * `activeId` is controlled, as in every binding: a select is reported and the
 * page answers by setting `active-id`. The close and pin buttons follow their
 * events, exactly as they follow `onClose` / `onPinChange` elsewhere: a strip
 * nobody listens to for `zen-close` draws no close buttons. `panelId` and
 * `closeLabel` are functions, so JS properties.
 *
 * Setting `tabs` again reconciles by tab id inside the factory, so a re-render
 * keeps each surviving tab's elements and the focus on them.
 */
defineZenElement<DocumentTabsProps>({
  tag: "zen-document-tabs",
  factory: DocumentTabs,
  attrs: {
    tabs: "json",
    "active-id": "string",
    label: "string",
    "all-tabs-label": "string",
  },
  props: ["tabs", "panelId", "closeLabel"],
  events: { onSelect: "zen-select", onClose: "zen-close", onPinChange: "zen-pin-change" },
  childrenProp: false,
});
