import { Map, type MapProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

// Leaflet map (leaflet is a lazily-imported optional peer). `markers` is the primary
// collection (json attr + JS prop); `center` is a coordinate tuple set as a JS prop.
// `height` is exposed as a number (px) — the common case; a string height (e.g.
// "50vh") must be set via the JS property path.
defineZenElement<MapProps>({
  tag: "zen-map",
  factory: Map,
  attrs: {
    zoom: "number",
    markers: "json",
    height: "number",
    "tile-url": "string",
    attribution: "string",
  },
  props: ["center", "markers"],
  childrenProp: false,
});
