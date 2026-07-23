<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# upload-collection — API (React, the parity reference)

Exports: `UploadCollection`, `UploadCollectionProps`, `UploadItem`, `UploadStatus`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-upload-collection>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### UploadCollection

- `items: UploadItem[]`
- `onRemove?: ((item: UploadItem) => void) | undefined` — Presence adds the delete button.
- `onRetry?: ((item: UploadItem) => void) | undefined` — Presence adds a Retry button to failed items.
- `onRename?: ((item: UploadItem, name: string) => void) | undefined` — Presence adds inline rename. Called with the new name, already trimmed.
- `emptyMessage?: React.ReactNode` — Message when there is nothing yet.
- `disabled?: boolean | undefined` — Blocks every action without hiding the list.
- `className?: string | undefined`

### UploadItem (type)

- `id: string`
- `name: string`
- `size?: number | undefined` — Bytes. Omit for a file the server described without one.
- `type?: string | undefined` — MIME type, when you have it. Used for the icon only.
- `status?: UploadStatus | undefined` — Defaults to "complete" — a list of already-uploaded files is the common case.
- `progress?: number | undefined` — 0–100, while `status` is "uploading". Omitted renders the state in words.
- `error?: string | undefined` — What went wrong. Shown in place of the meta line when `status` is "error".
- `url?: string | undefined` — When set, the name becomes a link — a download or a preview.
- `uploadedAt?: string | undefined` — Shown beside the size. A display string, for the same reason Timeline's is.
- `uploadedBy?: string | undefined`
- `thumbnail?: string | undefined` — An image src to show instead of the file icon.

### Other exports

- `UploadStatus` = `"error" | "pending" | "uploading" | "complete"`

### Types

- `UploadCollectionProps` — type (see the component above)
