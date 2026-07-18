/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Minimal ambient types for `leaflet`, an OPTIONAL peer dependency.
 *
 * `leaflet` ships no types of its own and `@types/leaflet` is deliberately not a
 * dependency of this package — nothing here should force consumers who never
 * render <Map> to install either. This declaration covers only the surface
 * `map.tsx` touches.
 *
 * Build-time only: tsc does not re-emit .d.ts inputs, so this never reaches
 * `dist/` and cannot collide with a consumer's own `@types/leaflet`.
 */
declare module "leaflet" {
  export interface LeafletMap {
    setView(center: [number, number], zoom?: number): LeafletMap;
    invalidateSize(): LeafletMap;
    remove(): LeafletMap;
  }
  export interface LeafletLayer {
    addTo(map: LeafletMap): LeafletLayer;
    bindPopup(content: string | HTMLElement): LeafletLayer;
    remove(): LeafletLayer;
  }
  export function map(el: HTMLElement, options?: any): LeafletMap;
  export function tileLayer(url: string, options?: any): LeafletLayer;
  export function marker(position: [number, number], options?: any): LeafletLayer;
  const L: any;
  export default L;
}
