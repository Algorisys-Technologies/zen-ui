import {
  MicroBarChart,
  MicroBulletChart,
  MicroDeltaChart,
  MicroLineChart,
  MicroRadialChart,
  type MicroBarChartProps,
  type MicroBulletChartProps,
  type MicroDeltaChartProps,
  type MicroLineChartProps,
  type MicroRadialChartProps,
} from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

/**
 * Five elements rather than one with a `type` attribute. They do not share a
 * prop surface — a line takes a series, a bullet takes a value and a target, a
 * delta takes two numbers — so one element would have to accept the union and
 * ignore most of it, and neither the types nor the attribute list would tell an
 * HTML author which combination is meaningful.
 *
 * `values` is json: an array cannot be an attribute any other way, and seeding a
 * sparkline from markup is the common case.
 */

const COMMON = {
  width: "number",
  height: "number",
  color: "string",
  label: "string",
} as const;

defineZenElement<MicroLineChartProps>({
  tag: "zen-micro-line-chart",
  factory: MicroLineChart,
  attrs: { ...COMMON, area: "boolean", values: "json" },
  props: ["values"],
  childrenProp: false,
});

defineZenElement<MicroBarChartProps>({
  tag: "zen-micro-bar-chart",
  factory: MicroBarChart,
  attrs: { ...COMMON, values: "json" },
  props: ["values"],
  childrenProp: false,
});

defineZenElement<MicroBulletChartProps>({
  tag: "zen-micro-bullet-chart",
  factory: MicroBulletChart,
  attrs: { ...COMMON, value: "number", target: "number", min: "number", max: "number" },
  props: [],
  childrenProp: false,
});

defineZenElement<MicroDeltaChartProps>({
  tag: "zen-micro-delta-chart",
  factory: MicroDeltaChart,
  attrs: { ...COMMON, from: "number", to: "number" },
  props: [],
  childrenProp: false,
});

defineZenElement<MicroRadialChartProps>({
  tag: "zen-micro-radial-chart",
  factory: MicroRadialChart,
  attrs: { ...COMMON, value: "number", max: "number", "show-value": "boolean" },
  props: [],
  childrenProp: false,
});
