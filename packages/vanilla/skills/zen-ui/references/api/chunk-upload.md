<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# chunk-upload — API (React, the parity reference)

Exports: `planChunks`, `shouldRetry`, `nextAttemptDelay`, `uploadProgress`, `DEFAULT_CHUNK_SIZE`, `DEFAULT_MAX_ATTEMPTS`, `ChunkPlanItem`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-chunk-upload>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### ChunkPlanItem (type)

- `index: number` — Sequential from 0. Servers that append rather than assemble depend on this order.
- `start: number` — Byte offset, inclusive.
- `end: number` — Byte offset, exclusive — `file.slice(start, end)`.

### Other exports

- `planChunks(size: number, chunkSize?: number): ChunkPlanItem[]`
- `shouldRetry(attempt: number, maxAttempts?: number): boolean`
- `nextAttemptDelay(attempt: number, baseMs?: number): number`
- `uploadProgress(done: number, total: number): number`
- `DEFAULT_CHUNK_SIZE: number`
- `DEFAULT_MAX_ATTEMPTS: 3`
