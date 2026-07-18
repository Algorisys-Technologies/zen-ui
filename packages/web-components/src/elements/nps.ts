import { NPS, type NPSProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

// Net Promoter Score strip. `showBucket` defaults TRUE, so it is a JS prop.
defineZenElement<NPSProps>({
  tag: "zen-nps",
  factory: NPS,
  attrs: {
    value: "number",
    "default-value": "number",
    label: "string",
    "low-label": "string",
    "high-label": "string",
    disabled: "boolean",
    "read-only": "boolean",
    name: "string",
  },
  props: ["showBucket"],
  events: { onValueChange: "zen-value-change" },
  childrenProp: false,
});
