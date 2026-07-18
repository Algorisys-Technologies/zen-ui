/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { cn } from "../../lib/cn";

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

const DEFAULT_TILES = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const DEFAULT_ATTR = "&copy; OpenStreetMap contributors";

export const Map = ({
  center,
  zoom = 13,
  markers = [],
  height = 320,
  tileUrl = DEFAULT_TILES,
  attribution = DEFAULT_ATTR,
  className,
}: MapProps) => {
  const [rl, setRl] = React.useState<any>(null);

  React.useEffect(() => {
    let alive = true;
    import("react-leaflet")
      .then((m) => {
        if (alive) setRl(m);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  if (!rl) {
    return (
      <div
        className={cn(
          "zen-flex zen-items-center zen-justify-center zen-rounded-zen-md zen-border zen-border-zen-border zen-text-sm zen-text-zen-muted-fg",
          className,
        )}
        style={{ height }}
      >
        Loading map…
      </div>
    );
  }

  const { MapContainer, TileLayer, Marker, Popup } = rl;

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className={cn("zen-rounded-zen-md", className)}
      style={{ height, width: "100%" }}
    >
      <TileLayer url={tileUrl} attribution={attribution} />
      {markers.map((mk, i) => (
        <Marker key={i} position={mk.position}>
          {mk.label ? <Popup>{mk.label}</Popup> : null}
        </Marker>
      ))}
    </MapContainer>
  );
};
Map.displayName = "Map";
