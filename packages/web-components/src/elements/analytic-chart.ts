import { AnalyticChart, type AnalyticChartProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

/**
 * <zen-analytic-chart type="bar" x="region" series='[{"key":"retail","label":"Retail"}]'
 *   data='[{"region":"North","retail":420}]'></zen-analytic-chart>
 *
 * Data-driven: no slot. `data`, `series` and `option` are json attributes for a
 * chart written in HTML, and JS properties for anything real (a property skips
 * the JSON round trip and keeps your row objects, which `zen-select`'s
 * `detail.row` then hands back).
 *
 * `title` is a JS PROPERTY ONLY, as on <zen-object>: as an attribute it is the
 * global `title`, which would hang a native tooltip over the whole chart. Set
 * `el.title = "…"` (it names the chart and captions its table) or use
 * `description`, which is an ordinary attribute.
 *
 * `legend` and `toolbar` are json, not boolean: legend's default is "shown when
 * there is more than one series" and toolbar's is TRUE, so an absent attribute
 * must mean "unset" rather than false. `height` as an attribute is px; a CSS
 * length ("20rem") is the property.
 *
 * Events: `zen-select` (detail: { row, index, seriesKey, value }) and
 * `zen-view-change` (detail: "chart" | "table"). Marks look and act clickable
 * only while something listens for `zen-select`.
 *
 * ECharts is an optional peer of the vanilla binding, loaded when the first
 * chart connects. Absent, the element shows its data as a table with a one-line
 * note instead of throwing: there is no error boundary around a custom element.
 */
defineZenElement<AnalyticChartProps>({
  tag: "zen-analytic-chart",
  factory: AnalyticChart,
  attrs: {
    type: "string",
    x: "string",
    y: "string",
    data: "json",
    series: "json",
    stacked: "boolean",
    horizontal: "boolean",
    total: "string",
    max: "number",
    target: "number",
    zoom: "boolean",
    legend: "json",
    description: "string",
    format: "string",
    "secondary-format": "string",
    currency: "string",
    locale: "string",
    toolbar: "json",
    view: "string",
    "default-view": "string",
    height: "number",
    renderer: "string",
    option: "json",
    "file-name": "string",
  },
  props: ["data", "series", "option", "title", "format", "secondaryFormat", "height"],
  events: { onSelect: "zen-select", onViewChange: "zen-view-change" },
  childrenProp: false,
});
