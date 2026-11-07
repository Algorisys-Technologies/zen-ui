<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# file-upload — API (React, the parity reference)

Exports: `FileUpload`, `FileUploadProps`, `FileRejection`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-file-upload>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### FileUpload

- `value?: File[] | undefined` — Selected files (controlled).
- `defaultValue?: File[] | undefined`
- `onValueChange?: ((files: File[]) => void) | undefined`
- `onError?: ((rejections: FileRejection[]) => void) | undefined` — Fires for each batch of rejected files (size / type / count).
- `maxSize?: number | undefined` — Max bytes per file.
- `maxFiles?: number | undefined` — Max total file count. Defaults to 1 unless `multiple` is true.
- `multiple?: boolean | undefined`
- `disabled?: boolean | undefined`
- `label?: React.ReactNode` — Replace the default "Choose files / Drag & drop" copy.
- `helperText?: React.ReactNode`
- `showFileList?: boolean | undefined` — Show the selected file list inline. Default true.
- `className?: string | undefined`
- …plus the underlying element's standard props (301 inherited).

### FileRejection (type)

- `file: File`
- `reason: "size" | "type" | "max-files"` — "size" | "type" | "max-files"
- `message: string`

### Types

- `FileUploadProps` — type (see the component above)
