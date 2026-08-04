<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# diagram-canvas — API (React, the parity reference)

Exports: `DiagramCanvas`, `ArchitectureDraw`, `DEFAULT_DIAGRAM_EMBED_URL`, `DEFAULT_YAPPYDRAW_EMBED_URL`, `DiagramCanvasProps`, `ArchitectureDrawProps`, `DiagramProvider`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-diagram-canvas>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### DiagramCanvas

- `provider?: DiagramProvider | undefined` — Which editor to embed. Default `"drawio"`.
- `value?: string | undefined` — draw.io XML, or a YappyDraw JSON document. Empty starts a blank diagram.
- `onChange?: ((xml: string) => void) | undefined` — Every edit.
- `onSave?: ((xml: string) => void) | undefined` — The user pressed save inside the editor — persist this.
- `onReady?: (() => void) | undefined` — The editor is ready and has been given the initial value.
- `src?: string | undefined` — Editor origin. Replace to self-host; the origin is also what messages are checked against.
- `onError?: ((message: string) => void) | undefined` — The bridge failed — most often an origin the Yappy deployment has not allowlisted.
- `height?: string | undefined` — CSS height. Default `"32rem"`.
- `title?: string | undefined` — Accessible name for the frame.
- `className?: string | undefined`

### ArchitectureDraw

- `label?: React.ReactNode` — Shown above the canvas.
- `actions?: React.ReactNode` — Rendered beside the label — a save button, a reset.
- `provider?: DiagramProvider | undefined` — Which editor to embed. Default `"drawio"`.
- `value?: string | undefined` — draw.io XML, or a YappyDraw JSON document. Empty starts a blank diagram.
- `onChange?: ((xml: string) => void) | undefined` — Every edit.
- `onSave?: ((xml: string) => void) | undefined` — The user pressed save inside the editor — persist this.
- `onReady?: (() => void) | undefined` — The editor is ready and has been given the initial value.
- `src?: string | undefined` — Editor origin. Replace to self-host; the origin is also what messages are checked against.
- `onError?: ((message: string) => void) | undefined` — The bridge failed — most often an origin the Yappy deployment has not allowlisted.
- `height?: string | undefined` — CSS height. Default `"32rem"`.
- `title?: string | undefined` — Accessible name for the frame.
- `className?: string | undefined`

### Other exports

- `DEFAULT_DIAGRAM_EMBED_URL: "https://embed.diagrams.net/?embed=1&proto=json&spin=1&ui=min&libraries=1"`
- `DEFAULT_YAPPYDRAW_EMBED_URL: "https://www.yappydraw.com/"`
- `DiagramProvider` = `"drawio" | "yappydraw"`

### Types

- `DiagramCanvasProps` — type (see the component above)
- `ArchitectureDrawProps` — type (see the component above)
