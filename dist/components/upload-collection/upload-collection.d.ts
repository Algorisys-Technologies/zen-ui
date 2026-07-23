import { type JSX } from "solid-js";
/**
 * UploadCollection — the list of files that have been uploaded, or are on their
 * way.
 *
 *   <UploadCollection items={files()} onRemove={remove} onRetry={retry} />
 *
 * FileUpload is the input; this is the result. They are two components because
 * they answer to different owners: the drop zone is a control the user operates,
 * while this list is state your transport writes — a file can appear in it from
 * a previous session, and a file the user picked can sit here failing for
 * minutes.
 *
 * It does NOT own the upload. There is no `url`, no `method`, no retry policy:
 * the component takes `status` and `progress` per item and renders them. A
 * component that owned the transport would have to guess at your endpoint,
 * headers, auth refresh and chunking, and every real app would then fight it.
 * `onRetry` hands the item back to you rather than re-issuing anything itself.
 *
 * Every affordance is presence-gated — no `onRemove`, no delete button. A
 * disabled-looking control that does nothing is worse than an absent one,
 * because the user spends a click finding out.
 *
 * It renders an UNORDERED list, unlike Timeline: a set of attachments has no
 * meaningful sequence, and announcing "item 3 of 7" over one implies there is.
 */
export type UploadStatus = "pending" | "uploading" | "complete" | "error";
export interface UploadItem {
    id: string;
    name: string;
    /** Bytes. Omit for a file the server described without one. */
    size?: number;
    /** MIME type, when you have it. Used for the icon only. */
    type?: string;
    /** Defaults to "complete" — a list of already-uploaded files is the common case. */
    status?: UploadStatus;
    /** 0–100, while `status` is "uploading". Omitted renders an indeterminate bar. */
    progress?: number;
    /** What went wrong. Shown in place of the meta line when `status` is "error". */
    error?: string;
    /** When set, the name becomes a link — a download or a preview. */
    url?: string;
    /** Shown beside the size. A display string, for the same reason Timeline's is. */
    uploadedAt?: string;
    uploadedBy?: string;
    /** An image src to show instead of the file icon. */
    thumbnail?: string;
}
export interface UploadCollectionProps {
    items: UploadItem[];
    /** Presence adds the delete button. */
    onRemove?: (item: UploadItem) => void;
    /** Presence adds a Retry button to failed items. */
    onRetry?: (item: UploadItem) => void;
    /** Presence adds inline rename. Called with the new name, already trimmed. */
    onRename?: (item: UploadItem, name: string) => void;
    /** Message when there is nothing yet. */
    emptyMessage?: JSX.Element;
    /** Blocks every action without hiding the list. */
    disabled?: boolean;
    class?: string;
}
export declare const UploadCollection: (props: UploadCollectionProps) => JSX.Element;
//# sourceMappingURL=upload-collection.d.ts.map