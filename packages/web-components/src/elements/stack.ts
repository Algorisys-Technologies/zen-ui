import { Stack, type StackProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

// `gap`/`padding` are number | CSS-length; exposed as strings so any CSS length
// works from HTML (a bare number is read as px by the factory when set via JS).
defineZenElement<StackProps>({
  tag: "zen-stack",
  factory: Stack,
  attrs: {
    direction: "string",
    align: "string",
    justify: "string",
    wrap: "boolean",
    gap: "string",
    padding: "string",
  },
});
