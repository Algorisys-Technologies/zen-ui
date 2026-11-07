<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# rich-text — API (React, the parity reference)

Exports: `renderMath`, `RichText`, `RichTextProps`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-rich-text>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### RichText

- `value?: string | undefined`
- `onChange?: ((html: string) => void) | undefined`
- `placeholder?: string | undefined`
- `config?: Record<string, any> | undefined` — raw Jodit config, merged over the defaults
- `onImageUpload?: ((file: File) => Promise<string>) | undefined` — Handle an inserted image and return the URL to embed. Without it, Jodit inlines the file as a base64 data URI — which works, and quietly puts a two-megabyte string inside the HTML you then store in a database and send back on every read. Supply this and the editor embeds a URL instead; uploading is yours, for the same reason UploadCollection does not own its transport.
- `math?: boolean | undefined` — Render `$…$` and `$$…$$` as maths, using KaTeX. `katex` is an OPTIONAL peer dependency, loaded only when this is on, so an app with no equations never downloads it. Rendering happens on the OUTPUT (see `renderMath`) rather than inside the editor: the author writes and edits the TeX source, which is the only form that survives a round trip through storage.
- `className?: string | undefined`

### Other exports

- `renderMath(html: string): Promise<string>`

### Types

- `RichTextProps` — type (see the component above)
