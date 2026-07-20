import { DirectionProvider, type DirectionProviderProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

// `dir` is the reading direction ("ltr" | "rtl"). Note the element sets `dir`
// on its own inner wrapper rather than on itself — the custom element is not
// the styling boundary here, the wrapper is.
defineZenElement<DirectionProviderProps>({
  tag: "zen-direction-provider",
  factory: DirectionProvider,
  attrs: {
    dir: "string",
  },
});
