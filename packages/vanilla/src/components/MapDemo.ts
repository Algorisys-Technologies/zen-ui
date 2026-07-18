/* eslint-disable @typescript-eslint/no-explicit-any */
import "leaflet/dist/leaflet.css";
import { Map, type MapMarker } from "./map/map";
import { DemoPage } from "./demo-helpers";

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
        code: `Map({
  center: [19.076, 72.8777],
  zoom: 7,
  markers: [
    { position: [19.076, 72.8777], label: "Mumbai" },
    { position: [18.5204, 73.8567], label: "Pune" },
  ],
})`,
        render: () => {
          const wrap = document.createElement("div");
          wrap.style.width = "100%";
          wrap.append(Map({ center: [18.9, 73.2], zoom: 7, markers: MARKERS, height: 320 }).el);
          return wrap;
        },
      },
    ],
  });
}
