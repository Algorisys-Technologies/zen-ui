<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# qr-scanner — API (React, the parity reference)

Exports: `QRScanner`, `QRScannerProps`, `QRScannerScan`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-qr-scanner>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### QRScanner

- `onScan: (scan: QRScannerScan) => void` — Fired every time a barcode is detected (subject to cooldown dedupe).
- `onError?: ((error: Error) => void) | undefined` — Fired on permission denial, no-camera, or decoder errors.
- `formats?: string[] | undefined` — Formats to look for. Defaults to QR only. Ignored by custom `decode`.
- `facingMode?: "user" | "environment" | undefined` — Front (selfie) or back (environment, default for scanning).
- `paused?: boolean | undefined` — Stop the camera. Useful for tab visibility or modal close.
- `cooldownMs?: number | undefined` — Suppress duplicate scans inside this window (ms). Default 1500.
- `decode?: ((video: HTMLVideoElement) => Promise<QRScannerScan | null>) | undefined` — Custom decoder for browsers without native BarcodeDetector.
- `aspectRatio?: number | undefined` — Width/height ratio of the scanner viewport. Default 1 (square).
- `fallback?: React.ReactNode` — Rendered in place of the camera surface on error / unsupported.
- `className?: string | undefined`
- `hideViewfinder?: boolean | undefined` — Hide the white corner-bracket viewfinder.
- `aria-label?: string | undefined` — Aria label for the camera surface.
- …plus the underlying element's standard props (2 inherited).

### QRScannerScan (type)

- `rawValue: string`
- `format?: string | undefined`
- `cornerPoints?: { x: number; y: number; }[] | undefined`

### Types

- `QRScannerProps` — type (see the component above)
