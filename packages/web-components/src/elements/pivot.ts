import {
  PivotWorkbench,
  PivotGrid,
  PivotDropZone,
  PivotFieldChip,
  PivotFilterMenu,
  type PivotWorkbenchProps,
  type PivotGridProps,
  type PivotDropZoneProps,
  type PivotFieldChipProps,
  type PivotFilterMenuProps,
} from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

// The pivot family. PIVOT_ZONES / PIVOT_AGGREGATIONS are consts, not components.
// Layout / data / callback-rich props are complex, so they are JS properties;
// `fields` (the primary collection) also gets a json attr for HTML authoring.

// showBuilder defaults TRUE, so it is a JS prop — a boolean attribute could not
// express the false a caller needs.
defineZenElement<PivotWorkbenchProps>({
  tag: "zen-pivot-workbench",
  factory: PivotWorkbench,
  attrs: {
    "total-rows": "number",
    "total-cols": "number",
    fields: "json",
  },
  props: ["fields", "initialLayout", "showBuilder", "loadMembers"],
  events: {
    onLayoutApply: "zen-layout-apply",
    onClearFilters: "zen-clear-filters",
  },
  // Renders the caller's grid as children — keep the default slot.
});

defineZenElement<PivotGridProps>({
  tag: "zen-pivot-grid",
  factory: PivotGrid,
  attrs: {
    "total-rows": "number",
    "total-cols": "number",
    "row-header-depth": "number",
    "col-header-depth": "number",
    "row-height": "number",
    "col-width": "number",
    "row-header-width": "number",
    label: "string",
  },
  props: ["layout", "getCell", "getRowHeader", "getColHeader"],
  events: { onVisibleRangeChange: "zen-visible-range-change" },
  childrenProp: false,
});

defineZenElement<PivotDropZoneProps>({
  tag: "zen-pivot-drop-zone",
  factory: PivotDropZone,
  attrs: {
    // `id` is the zone id ("rows"/"columns"/…) — reflected through the host's id
    // attribute, whose native accessor already reads/writes the same attribute.
    id: "string",
    title: "string",
    icon: "string",
    "hide-title": "boolean",
    horizontal: "boolean",
    "is-empty": "boolean",
  },
  // Renders caller content into the zone — keep the default slot.
});

defineZenElement<PivotFieldChipProps>({
  tag: "zen-pivot-field-chip",
  factory: PivotFieldChip,
  attrs: {
    "field-key": "string",
    fields: "json",
    "has-active-filter": "boolean",
    zone: "string",
    aggregation: "string",
    "single-select": "boolean",
    disabled: "boolean",
  },
  props: ["fields", "selection", "filters", "loadMembers", "dragHandleProps"],
  events: {
    onSelectionChange: "zen-selection-change",
    onRemove: "zen-remove",
    onAggregationChange: "zen-aggregation-change",
    onMoveToZone: "zen-move-to-zone",
  },
  childrenProp: false,
});

defineZenElement<PivotFilterMenuProps>({
  tag: "zen-pivot-filter-menu",
  factory: PivotFilterMenu,
  attrs: {
    "column-key": "string",
    label: "string",
    "trigger-class": "string",
    "single-select": "boolean",
  },
  props: ["selection", "formatValue", "loadOptions", "triggerChildren"],
  events: { onChange: "zen-change" },
  childrenProp: false,
});
