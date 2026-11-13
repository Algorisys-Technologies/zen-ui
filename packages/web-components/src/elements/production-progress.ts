import { ProductionProgress, type ProductionProgressProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

/**
 * <zen-production-progress label="WO-10042" target="500" good="361" scrap="19">
 *
 * The counts are number attributes; `segments` is json
 * (`segments='{"size":12,"count":42,"unit":"cartons"}'`) and a property.
 * `hide-text` defaults to false, so it is an ordinary boolean attribute.
 *
 * No slot: the bar is drawn from the counts.
 */
defineZenElement<ProductionProgressProps>({
  tag: "zen-production-progress",
  factory: ProductionProgress,
  attrs: {
    target: "number",
    good: "number",
    scrap: "number",
    label: "string",
    segments: "json",
    size: "string",
    "hide-text": "boolean",
  },
  props: ["segments"],
  childrenProp: false,
});
