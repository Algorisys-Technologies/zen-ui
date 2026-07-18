import { Rating, type RatingProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

// Star rating. `value` is a controlled number (string/number controlled props are
// fine as attrs), `defaultValue` its uncontrolled seed. `allowClear` defaults TRUE,
// so it is a JS prop.
defineZenElement<RatingProps>({
  tag: "zen-rating",
  factory: Rating,
  attrs: {
    value: "number",
    "default-value": "number",
    max: "number",
    "allow-half": "boolean",
    label: "string",
    "show-value": "boolean",
    size: "string",
    disabled: "boolean",
    "read-only": "boolean",
    name: "string",
  },
  props: ["allowClear"],
  events: { onValueChange: "zen-value-change" },
  childrenProp: false,
});
