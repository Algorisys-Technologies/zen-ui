import { Carousel, type CarouselProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

// <zen-carousel label="Featured" per-view="2">…slides…</zen-carousel>
// Each light-DOM child becomes a slide, so the slot stays on. `arrows` and `dots`
// both default TRUE → JS properties (a boolean attribute could only add presence,
// never turn them off). `per-view` is numeric.
defineZenElement<CarouselProps>({
  tag: "zen-carousel",
  factory: Carousel,
  attrs: {
    label: "string",
    "per-view": "number",
  },
  props: ["arrows", "dots"],
});
