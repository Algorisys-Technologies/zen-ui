<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# chunk-uploader — API (React, the parity reference)

Exports: `ChunkUploader`, `ChunkUploaderProps`, `ChunkMeta`, `ChunkUploadStatus`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-chunk-uploader>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### ChunkUploader

- `file?: File | null | undefined` — Omit to render the idle state; set it to begin.
- `uploadChunk: (blob: Blob, meta: ChunkMeta) => Promise<unknown>` — Send one slice. Reject to trigger the retry policy.
- `chunkSize?: number | undefined` — Bytes per chunk. Default 5 MB.
- `maxAttempts?: number | undefined` — Tries per chunk before giving up. Default 3.
- `autoStart?: boolean | undefined` — Start as soon as a `file` arrives. Default `true`.
- `onProgress?: ((percent: number, done: number, total: number) => void) | undefined`
- `onComplete?: ((file: File) => void) | undefined` — Every chunk landed. Call your finalise endpoint here.
- `onError?: ((error: Error, meta: ChunkMeta) => void) | undefined` — A chunk exhausted its attempts. The upload stops; `retry` resumes it.
- `showProgress?: boolean | undefined` — Hide the built-in bar and drive it from `onProgress` instead.
- `className?: string | undefined`

### ChunkMeta (type)

- `index: number`
- `total: number` — Total number of chunks, so a server can recognise the last one.
- `start: number`
- `end: number`
- `attempt: number` — 1-based; 1 on the first try.
- `file: File`

### Other exports

- `ChunkUploadStatus` = `"paused" | "error" | "complete" | "uploading" | "idle"`

### Types

- `ChunkUploaderProps` — type (see the component above)
