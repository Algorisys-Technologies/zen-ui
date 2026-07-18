import { Accordion, type AccordionProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

// Data-driven from `items` (authorable inline as JSON or as `el.items = [...]`).
// `collapsible` defaults to false, so it is a plain boolean attribute.
// `value` / `defaultValue` are `string | string[]` (an array in "multiple" mode),
// which a primitive attribute cannot express, so they are JS properties.
defineZenElement<AccordionProps>({
  tag: "zen-accordion",
  factory: Accordion,
  attrs: {
    items: "json",
    type: "string",
    collapsible: "boolean",
  },
  props: ["items", "value", "defaultValue"],
  events: { onValueChange: "zen-value-change" },
  childrenProp: false,
});
