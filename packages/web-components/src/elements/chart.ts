import { Chart, type ChartProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

// Data-driven SVG chart. `series` is the primary collection (json attr + JS prop);
// `data` and `colors` are JS-only arrays. CHART_PALETTE is a const, not a component.
defineZenElement<ChartProps>({
  tag: "zen-chart",
  factory: Chart,
  attrs: {
    type: "string",
    "x-key": "string",
    height: "number",
    series: "json",
  },
  props: ["data", "series", "colors"],
  childrenProp: false,
});
