import { Theme, type ThemeProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

// `name` is the theme id ("default" | "zen-theme" | "dark"), not a label — it
// maps straight onto the `data-theme` attribute the tokens are keyed by.
defineZenElement<ThemeProps>({
  tag: "zen-theme",
  factory: Theme,
  attrs: {
    name: "string",
    transparent: "boolean",
  },
});
