<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# scan — API (React, the parity reference)

Exports: `DEFAULT_SCAN_OPTIONS`, `classifyEntry`, `createScanBuffer`, `KeyAt`, `ScanBuffer`, `ScanOptions`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-scan>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### KeyAt (type)

- `key: string`
- `at: number`

### ScanBuffer (type)

- `push: (key: string, at: number) => string | null` — Feed one keystroke. Returns the scanned code when this key finishes a scan, else null.
- `flush: (at: number) => string | null` — For scanners with no suffix: returns the code if the buffer has gone quiet and qualifies.
- `pending: () => boolean` — Whether characters are waiting (a caller may schedule a flush).
- `reset: () => void`

### ScanOptions (type)

- `maxGapMs: number` — Longest gap between two characters of one scan.
- `minLength: number` — Shortest code that counts as a scan.
- `terminators: string[]` — Keys a scanner sends after the code. Empty: scanners with no suffix; use `flush`.

### Other exports

- `DEFAULT_SCAN_OPTIONS: ScanOptions`
- `classifyEntry(events: readonly KeyAt[], options?: Partial<ScanOptions>): "scanner" | "keyboard"`
- `createScanBuffer(options?: Partial<ScanOptions>): ScanBuffer`
