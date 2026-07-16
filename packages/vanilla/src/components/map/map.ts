/* eslint-disable @typescript-eslint/no-explicit-any */
import { cn } from "../../lib/cn";
import { Disposer, toNodes, type Child, type ZenComponent } from "../../lib/component";

/**
 * Map — Leaflet map. `leaflet` is an OPTIONAL peer dependency, dynamically
 * imported so it never weighs on consumers who don't map. React's Map lazy-loads
 * `react-leaflet` + `leaflet`; with no framework there is no wrapper library to
 * load, so this drives Leaflet's imperative API directly. Same public shape:
 *
 *   Map({ center: [19.07, 72.87], zoom: 12,
 *         markers: [{ position: [19.07, 72.87], label: "Office" }] })
 *
 * Leaflet's own stylesheet (`leaflet/dist/leaflet.css`) is imported lazily with
 * it — externalised by the lib build, so it stays a peer and is never bundled.
 */

export interface MapMarker {
  position: [number, number];
  label?: Child;
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

const DEFAULT_TILES = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const DEFAULT_ATTR = "&copy; OpenStreetMap contributors";

const LOADING_CLASS =
  "zen-flex zen-items-center zen-justify-center zen-rounded-zen-md zen-border zen-border-zen-border zen-text-sm zen-text-zen-muted-fg";
const MAP_CLASS = "zen-rounded-zen-md";

const cssHeight = (h: number | string) => (typeof h === "number" ? `${h}px` : h);

/** Leaflet renders a marker popup from a string (as HTML) or a DOM node. Wrap a
 * caller's label as real nodes so a string is text, never markup (LOOPS XV). */
function popupContent(label: Child): HTMLElement {
  const wrap = document.createElement("div");
  wrap.append(...toNodes(label));
  return wrap;
}

export function Map(props: MapProps): ZenComponent<MapProps> {
  let current: MapProps = { ...props };
  const disposer = new Disposer();

  const el = document.createElement("div");
  el.className = cn(LOADING_CLASS, current.class);
  el.style.height = cssHeight(current.height ?? 320);
  el.textContent = "Loading map…";

  let map: any = null;
  let tileLayer: any = null;
  let markersGroup: any = null;
  let L: any = null;
  let destroyed = false;

  /** Re-apply every prop onto a live Leaflet map. Called after load and on update. */
  const sync = () => {
    if (!map || !L) return;

    const zoom = current.zoom ?? 13;
    map.setView(current.center, zoom);

    const url = current.tileUrl ?? DEFAULT_TILES;
    const attribution = current.attribution ?? DEFAULT_ATTR;
    if (!tileLayer) {
      tileLayer = L.tileLayer(url, { attribution }).addTo(map);
    } else if (tileLayer._url !== url) {
      tileLayer.remove();
      tileLayer = L.tileLayer(url, { attribution }).addTo(map);
    }

    if (!markersGroup) markersGroup = L.layerGroup().addTo(map);
    markersGroup.clearLayers();
    for (const mk of current.markers ?? []) {
      const marker = L.marker(mk.position);
      if (mk.label != null && mk.label !== false) marker.bindPopup(popupContent(mk.label));
      markersGroup.addLayer(marker);
    }

    el.style.height = cssHeight(current.height ?? 320);
    map.invalidateSize();
  };

  // Lazy peer: leaflet and its stylesheet load only when a Map is actually built.
  Promise.all([import("leaflet"), import("leaflet/dist/leaflet.css")])
    .then(([mod]) => {
      if (destroyed) return;
      L = (mod as any).default ?? mod;

      el.textContent = "";
      el.className = cn(MAP_CLASS, current.class);
      el.style.width = "100%";

      map = L.map(el, { center: current.center, zoom: current.zoom ?? 13 });
      sync();
    })
    .catch(() => {
      // Leaflet not installed, or its CSS blocked. Leave the placeholder in place,
      // matching React, which stays on "Loading map…" when the peer is absent.
    });

  disposer.add(() => {
    if (map) {
      map.remove();
      map = null;
    }
  });

  return {
    el,
    update(next) {
      current = { ...current, ...next };
      if (next.class !== undefined) el.className = cn(map ? MAP_CLASS : LOADING_CLASS, current.class);
      sync();
    },
    destroy() {
      destroyed = true;
      disposer.dispose();
      el.remove();
    },
  };
}
