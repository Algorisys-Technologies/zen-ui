import * as React from "react";
/**
 * Map — Leaflet map wrapping `react-leaflet` + `leaflet` (OPTIONAL peer
 * dependencies). Lazy-loaded so it never weighs on consumers who don't map.
 * Install `react-leaflet` and `leaflet`, and import Leaflet's CSS once in your
 * app: `import "leaflet/dist/leaflet.css"`.
 *
 *   <Map center={[19.07, 72.87]} zoom={12}
 *        markers={[{ position: [19.07, 72.87], label: "Office" }]} />
 */
export interface MapMarker {
    position: [number, number];
    label?: React.ReactNode;
}
export interface MapProps {
    center: [number, number];
    zoom?: number;
    markers?: MapMarker[];
    height?: number | string;
    tileUrl?: string;
    attribution?: string;
    className?: string;
}
export declare const Map: {
    ({ center, zoom, markers, height, tileUrl, attribution, className, }: MapProps): React.JSX.Element;
    displayName: string;
};
//# sourceMappingURL=map.d.ts.map