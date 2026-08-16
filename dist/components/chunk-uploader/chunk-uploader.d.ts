import * as React from "react";
/**
 * ChunkUploader — a large file, sent in pieces, with progress you can pause and
 * resume.
 *
 *   <ChunkUploader
 *     file={recording}
 *     uploadChunk={(blob, meta) => fetch(url(meta), { method: "POST", body: blob })}
 *     onComplete={finalise}
 *   />
 *
 * For an interview recording or a screen capture — anything big enough that one
 * failed request should not mean starting again.
 *
 * **It does not know your endpoint.** `uploadChunk` is yours: it receives the
 * slice and its metadata and returns a promise. That is the same rule
 * FileUpload and UploadCollection follow, and it is what lets this work with a
 * signed URL, a presigned part, or a socket — none of which a component could
 * have guessed. What zen-ui owns is the arithmetic and the retry policy, which
 * is the part everyone gets wrong.
 *
 * The plan comes from `@algorisys/zen-ui-core/chunk-upload` and is pinned by
 * scripts/check-chunk-upload.ts — the chunks tile the file exactly, retries are
 * bounded, and the backoff doubles rather than hammering a server that is down.
 */
export interface ChunkMeta {
    index: number;
    /** Total number of chunks, so a server can recognise the last one. */
    total: number;
    start: number;
    end: number;
    /** 1-based; 1 on the first try. */
    attempt: number;
    file: File;
}
export type ChunkUploadStatus = "idle" | "uploading" | "paused" | "complete" | "error";
export interface ChunkUploaderProps {
    /** Omit to render the idle state; set it to begin. */
    file?: File | null;
    /** Send one slice. Reject to trigger the retry policy. */
    uploadChunk: (blob: Blob, meta: ChunkMeta) => Promise<unknown>;
    /** Bytes per chunk. Default 5 MB. */
    chunkSize?: number;
    /** Tries per chunk before giving up. Default 3. */
    maxAttempts?: number;
    /** Start as soon as a `file` arrives. Default `true`. */
    autoStart?: boolean;
    onProgress?: (percent: number, done: number, total: number) => void;
    /** Every chunk landed. Call your finalise endpoint here. */
    onComplete?: (file: File) => void;
    /** A chunk exhausted its attempts. The upload stops; `retry` resumes it. */
    onError?: (error: Error, meta: ChunkMeta) => void;
    /** Hide the built-in bar and drive it from `onProgress` instead. */
    showProgress?: boolean;
    className?: string;
}
export declare const ChunkUploader: ({ file, uploadChunk, chunkSize, maxAttempts, autoStart, onProgress, onComplete, onError, showProgress, className, }: ChunkUploaderProps) => React.JSX.Element;
//# sourceMappingURL=chunk-uploader.d.ts.map