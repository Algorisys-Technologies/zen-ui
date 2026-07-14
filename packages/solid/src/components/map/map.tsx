/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  type JSX,
  createEffect,
  createSignal,
  on,
  onCleanup,
  onMount,
  Show,
  mergeProps,
} from "solid-js";
import { render } from "solid-js/web";
import { cn } from "../../lib/cn";

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

const DEFAULT_TILES = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const DEFAULT_ATTR = "&copy; OpenStreetMap contributors";

const cssLength = (v: number | string) => (typeof v === "number" ? `${v}px` : v);

export const Map = (props: MapProps) => {
  const merged = mergeProps(
    {
      zoom: 13,
      markers: [] as MapMarker[],
      height: 320 as number | string,
      tileUrl: DEFAULT_TILES,
      attribution: DEFAULT_ATTR,
    },
    props,
  );

  const [status, setStatus] = createSignal<"loading" | "ready" | "failed">("loading");
  const [L, setL] = createSignal<any>(null);

  let host: HTMLDivElement | undefined;
  let map: any = null;
  /** Popup bodies are Solid subtrees; each needs disposing with its marker. */
  let markerLayers: Array<{ layer: any; dispose?: () => void }> = [];

  const clearMarkers = () => {
    for (const m of markerLayers) {
      m.dispose?.();
      m.layer.remove();
    }
    markerLayers = [];
  };

  onMount(async () => {
    let mod: any;
    try {
      mod = await import("leaflet");
    } catch {
      setStatus("failed");
      return;
    }
    const lib = mod?.default ?? mod;
    if (!host || typeof lib?.map !== "function") {
      setStatus("failed");
      return;
    }
    map = lib.map(host, { center: merged.center, zoom: merged.zoom });
    lib.tileLayer(merged.tileUrl, { attribution: merged.attribution }).addTo(map);
    setL(() => lib);
    setStatus("ready");
    // The host is `display:none` until now, so Leaflet sized itself against a
    // 0x0 box. Re-measure once it is actually on screen or the tile grid stays
    // blank.
    queueMicrotask(() => map?.invalidateSize());
  });

  onCleanup(() => {
    clearMarkers();
    map?.remove();
    map = null;
  });

  // react-leaflet freezes center/zoom after mount; keep Solid's live.
  createEffect(
    on(
      () => [merged.center[0], merged.center[1], merged.zoom] as const,
      ([lat, lng, zoom]) => {
        if (map) map.setView([lat, lng], zoom);
      },
      { defer: true },
    ),
  );

  createEffect(() => {
    const lib = L();
    const markers = merged.markers;
    if (!lib || !map) return;
    clearMarkers();
    for (const mk of markers) {
      const layer = lib.marker(mk.position).addTo(map);
      let dispose: (() => void) | undefined;
      if (mk.label !== undefined && mk.label !== null) {
        const holder = document.createElement("div");
        dispose = render(() => mk.label as JSX.Element, holder);
        layer.bindPopup(holder);
      }
      markerLayers.push({ layer, dispose });
    }
  });

  return (
    <>
      <Show when={status() !== "ready"}>
        <div
          class={cn(
            "zen-flex zen-items-center zen-justify-center zen-rounded-zen-md zen-border zen-border-zen-border zen-p-4 zen-text-center zen-text-sm",
            status() === "failed" ? "zen-text-zen-error" : "zen-text-zen-muted-fg",
            merged.class,
          )}
          style={{ height: cssLength(merged.height) }}
          role={status() === "failed" ? "alert" : undefined}
        >
          <Show when={status() === "failed"} fallback="Loading map…">
            <span>
              <code>leaflet</code> is not installed. Run <code>npm install leaflet</code> and import{" "}
              <code>leaflet/dist/leaflet.css</code> to use <code>&lt;Map&gt;</code>.
            </span>
          </Show>
        </div>
      </Show>
      {/*
        The host stays mounted under the placeholder: Leaflet measures its
        container on `map()`, and a container that does not exist yet (or has
        zero height) produces a blank tile grid.
      */}
      <div
        ref={host}
        class={cn("zen-rounded-zen-md", merged.class)}
        style={{
          height: cssLength(merged.height),
          width: "100%",
          display: status() === "ready" ? undefined : "none",
        }}
      />
    </>
  );
};
