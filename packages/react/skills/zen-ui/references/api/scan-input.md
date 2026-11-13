<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# scan-input — API (React, the parity reference)

Exports: `ScanInput`, `ScanInputProps`, `ScanSource`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-scan-input>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### ScanInput

- `onScan: (code: string, info: { source: ScanSource; }) => string | void | Promise<string | void>`
- `label?: string | undefined` — Shown above the field. Defaults to "Scan or type a code".
- `placeholder?: string | undefined`
- `allowTyping?: boolean | undefined` — Refuse codes that were typed rather than scanned. Default true (typing allowed).
- `captureGlobal?: boolean | undefined` — Also catch scans made while focus is not in any field.
- `scanOptions?: Partial<ScanOptions> | undefined` — Timing thresholds and terminators; see core/scan.
- `clearOnScan?: boolean | undefined` — Clear the field after a submission. Default true.
- `disabled?: boolean | undefined`
- …plus the underlying element's standard props (278 inherited).

### Other exports

- `ScanSource` = `"scanner" | "keyboard"`

### Types

- `ScanInputProps` — type (see the component above)
