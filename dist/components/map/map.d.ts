import { type JSX } from "solid-js";
/**
 * Map — Leaflet map wrapping `leaflet` (an OPTIONAL peer dependency).
 * Lazy-loaded so it never weighs on consumers who don't map.
 *
 * The React binding needs `react-leaflet` on top of `leaflet`; Leaflet itself is
 * framework-agnostic, so Solid drives it directly and only `leaflet` is needed.
 * Install `leaflet`, and import its CSS once in your app:
 * `import "leaflet/dist/leaflet.css"`.
 *
 *   <Map center={[19.07, 72.87]} zoom={12}
 *        markers={[{ position: [19.07, 72.87], label: "Office" }]} />
 *
 * If `leaflet` is not installed the dynamic import is caught and an install
 * hint is rendered — the surrounding tree keeps working.
 */
export interface MapMarker {
    position: [number, number];
    label?: JSX.Element;
}
export interface MapProps {
    center: [number, number];
    zoom?: number;
    markers?: MapMarker[];
    height?: number | string;
    tileUrl?: string;
    attribution?: string;
    class?: string;
}
export declare const Map: (props: MapProps) => JSX.Element;
//# sourceMappingURL=map.d.ts.map