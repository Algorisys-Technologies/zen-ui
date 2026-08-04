<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# document — API (React, the parity reference)

Exports: `inferDocumentKind`, `clampZoom`, `zoomStep`, `normalizeRotation`, `fitScale`, `DOCUMENT_ZOOM_MIN`, `DOCUMENT_ZOOM_MAX`, `DocumentKind`, `DocumentFit`, `DocumentSize`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-document>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### DocumentSize (type)

- `width: number`
- `height: number`

### Other exports

- `inferDocumentKind(src: string, type?: string): DocumentKind`
- `clampZoom(zoom: number): number`
- `zoomStep(zoom: number, direction: number): number`
- `normalizeRotation(degrees: number): 0 | 90 | 180 | 270`
- `fitScale(page: DocumentSize, container: DocumentSize, fit: DocumentFit, rotation?: number): number`
- `DOCUMENT_ZOOM_MIN: 0.25`
- `DOCUMENT_ZOOM_MAX: 8`
- `DocumentKind` = `"image" | "pdf" | "unknown"`
- `DocumentFit` = `"width" | "contain"`
