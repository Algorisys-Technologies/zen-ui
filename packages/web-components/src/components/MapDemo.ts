/* eslint-disable @typescript-eslint/no-explicit-any */
import "leaflet/dist/leaflet.css";
import type { MapMarker } from "@algorisys/zen-ui-vanilla";
import { DemoPage } from "./demo-helpers";

/**
 * Map demo — the web-components port. <zen-map> lazily imports leaflet (an
 * optional peer). `zoom` / `height` are attributes; `center` (a coordinate tuple)
 * and `markers` are JS properties. Import leaflet's CSS once in your app.
 */

const MARKERS: MapMarker[] = [
  { position: [19.076, 72.8777], label: "Mumbai" },
  { position: [18.5204, 73.8567], label: "Pune" },
];

/**
 * Leaflet's default marker icons reference asset URLs that bundlers rewrite, so
 * markers render blank. Point them at the CDN once — leaflet is a singleton, so
 * every marker built afterwards picks these up. Mirrors the React demo.
 */
function fixMarkerIcons(): void {
  import("leaflet").then((mod: any) => {
    const L = mod.default ?? mod;
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
  });
}

export default function MapDemo(): HTMLElement {
  fixMarkerIcons();

  return DemoPage({
    title: "Map",
    description:
      "Leaflet map. leaflet is an optional peer dep, dynamically imported on first render — no framework wrapper, the vanilla port drives Leaflet's imperative API directly. Import Leaflet's CSS once in your app: import \"leaflet/dist/leaflet.css\".",
    sections: [
      {
        title: "1. Map with markers",
        codeTitle: "center / zoom / markers",
        code: `<zen-map zoom="7" height="320"></zen-map>

const map = document.querySelector("zen-map");
map.center = [19.076, 72.8777];
map.markers = [
  { position: [19.076, 72.8777], label: "Mumbai" },
  { position: [18.5204, 73.8567], label: "Pune" },
];`,
        render: () => {
          const wrap = document.createElement("div");
          wrap.style.width = "100%";
          const map = document.createElement("zen-map");
          map.setAttribute("zoom", "7");
          map.setAttribute("height", "320");
          (map as unknown as { center: [number, number] }).center = [18.9, 73.2];
          (map as unknown as { markers: MapMarker[] }).markers = MARKERS;
          wrap.append(map);
          return wrap;
        },
      },
    ],
  });
}
