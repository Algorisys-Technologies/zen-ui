import { Likert, type LikertProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

// Agree/disagree scale. `options` is the primary collection (json attr + JS prop);
// an option may carry a `renderOption` fn that json cannot express, so callers set
// the JS prop when marks are custom nodes. `value` is a controlled string.
defineZenElement<LikertProps>({
  tag: "zen-likert",
  factory: Likert,
  attrs: {
    value: "string",
    "default-value": "string",
    question: "string",
    options: "json",
    layout: "string",
    "min-label": "string",
    "max-label": "string",
    disabled: "boolean",
    "read-only": "boolean",
    name: "string",
  },
  props: ["options"],
  events: { onValueChange: "zen-value-change" },
  childrenProp: false,
});
