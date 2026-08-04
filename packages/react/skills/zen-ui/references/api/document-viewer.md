<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# document-viewer — API (React, the parity reference)

Exports: `DocumentViewer`, `DocumentViewerProps`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-document-viewer>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### DocumentViewer

- `src: string | Blob`
- `type?: string | undefined` — MIME type. Inferred from a Blob's `.type` or the URL's extension when omitted.
- `name?: string | undefined` — Shown in the toolbar and used as the download filename.
- `zoom?: number | undefined` — Controlled zoom.
- `defaultZoom?: number | undefined`
- `onZoomChange?: ((zoom: number) => void) | undefined`
- `minZoom?: number | undefined`
- `maxZoom?: number | undefined`
- `zoomStep?: number | undefined` — A multiplier per press, not an addend. Default 1.25.
- `page?: number | undefined` — Controlled page, 1-based. Ignored for images.
- `defaultPage?: number | undefined`
- `onPageChange?: ((page: number) => void) | undefined`
- `rotation?: number | undefined`
- `defaultRotation?: number | undefined`
- `onRotationChange?: ((rotation: number) => void) | undefined`
- `resetOnSrcChange?: boolean | undefined` — Reset zoom, page and rotation when `src` changes. Default `true`.
- `fit?: DocumentFit | undefined` — What the fit button computes. Default `"contain"`.
- `onDownload?: ((src: string, name?: string) => void) | undefined` — Presence adds the download button — an absent control beats a dead one.
- `toolbar?: boolean | undefined`
- `height?: string | undefined` — CSS height for the scroller. Default `"32rem"`.
- `workerSrc?: string | undefined`
- `unsupportedMessage?: React.ReactNode`
- `className?: string | undefined`

### Types

- `DocumentViewerProps` — type (see the component above)
