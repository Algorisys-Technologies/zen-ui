<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# barcode — API (React, the parity reference)

Exports: `QRCode`, `Barcode`, `QRCodeProps`, `BarcodeProps`, `BarcodeFormat`, `QrEcc`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-barcode>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### QRCode

- `value: string`
- `ecc?: QrEcc | undefined` — Error correction: L 7%, M 15% (default), Q 25%, H 30% of the code can be damaged or covered.
- `size?: number | undefined` — Width and height in px, quiet zone included. Default 128.
- `quietZone?: number | undefined` — Light modules round the code. Default 4, the standard's minimum.
- `minVersion?: number | undefined` — The smallest version (a fixed size on a printed form).
- `label?: string | undefined` — What it is, for assistive tech: "e-invoice QR". Default "QR code".
- `className?: string | undefined`

### Barcode

- `value: string`
- `format?: BarcodeFormat | undefined` — Default "code128" (any ASCII). "ean13": 12 digits (the check digit is added) or 13. "code39": 0–9, A–Z, space, - . $ / + %.
- `height?: number | undefined` — Height of the bars in px. Default 64.
- `moduleWidth?: number | undefined` — Width of the narrowest bar in px. Default 2. Print at 1 px and many scanners miss it.
- `showText?: boolean | undefined` — The value printed under the bars. Default true.
- `quietZone?: number | undefined` — Light modules either side. Default 10.
- `label?: string | undefined` — What it is, for assistive tech. Default: the format and the value.
- `className?: string | undefined`

### Other exports

- `BarcodeFormat` = `"code128" | "ean13" | "code39"`
- `QrEcc` = `"L" | "M" | "Q" | "H"`

### Types

- `QRCodeProps` — type (see the component above)
- `BarcodeProps` — type (see the component above)
