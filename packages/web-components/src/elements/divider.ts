import { Separator, type SeparatorProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

// `decorative` defaults TRUE, so it is a JS property — a boolean attribute could
// only ever add presence (true), never express the false a semantic separator needs.
defineZenElement<SeparatorProps>({
  tag: "zen-separator",
  factory: Separator,
  attrs: { orientation: "string" },
  props: ["decorative"],
});
