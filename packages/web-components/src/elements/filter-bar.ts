import { FilterBar, type FilterBarProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

// The List Report filter area. `fields` is the primary collection (json attr + JS
// prop) — note each field carries a `render` fn that a json attr cannot express, so
// json authoring seeds only labels/ids and callers set the JS prop for real controls.
// `adaptable`, `collapsible` and `defaultExpanded` default TRUE, so they are JS props.
defineZenElement<FilterBarProps>({
  tag: "zen-filter-bar",
  factory: FilterBar,
  attrs: {
    fields: "json",
    "go-label": "string",
    "clear-label": "string",
    "adapt-label": "string",
  },
  props: ["fields", "variant", "visibleIds", "adaptable", "collapsible", "defaultExpanded"],
  events: {
    onGo: "zen-go",
    onClear: "zen-clear",
    onVisibleIdsChange: "zen-visible-ids-change",
  },
  childrenProp: false,
});
