import * as React from "react";
import {
  planChunks,
  shouldRetry,
  nextAttemptDelay,
  uploadProgress,
  DEFAULT_CHUNK_SIZE,
  DEFAULT_MAX_ATTEMPTS,
  type ChunkPlanItem,
} from "@algorisys/zen-ui-core";
import { cn } from "../../lib/cn";
import { Button } from "../button/button";
import { Progress } from "../progress/progress";

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

const formatBytes = (n: number): string => {
  if (n < 1024) return `${n} B`;
  const units = ["KB", "MB", "GB"];
  let v = n / 1024;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(v >= 10 ? 0 : 1)} ${units[i]}`;
};

export const ChunkUploader = ({
  file,
  uploadChunk,
  chunkSize = DEFAULT_CHUNK_SIZE,
  maxAttempts = DEFAULT_MAX_ATTEMPTS,
  autoStart = true,
  onProgress,
  onComplete,
  onError,
  showProgress = true,
  className,
}: ChunkUploaderProps) => {
  const [status, setStatus] = React.useState<ChunkUploadStatus>("idle");
  const [done, setDone] = React.useState(0);
  const [error, setError] = React.useState<string>("");

  const chunks = React.useMemo<ChunkPlanItem[]>(
    () => (file ? planChunks(file.size, chunkSize) : []),
    [file, chunkSize],
  );

  /* Refs, not state: the loop reads these between awaits and must see the
     current value, not the one captured when the run started. */
  const pausedRef = React.useRef(false);
  const runningRef = React.useRef(false);
  const cursorRef = React.useRef(0);
  const handlers = React.useRef({ uploadChunk, onProgress, onComplete, onError });
  handlers.current = { uploadChunk, onProgress, onComplete, onError };

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const run = React.useCallback(async () => {
    /* One drain at a time. Two would send the same chunk twice, and a server
       that appends rather than assembles would corrupt the file. */
    if (runningRef.current || !file || chunks.length === 0) return;
    runningRef.current = true;
    pausedRef.current = false;
    setStatus("uploading");
    setError("");

    try {
      while (cursorRef.current < chunks.length) {
        if (pausedRef.current) {
          setStatus("paused");
          return;
        }

        const chunk = chunks[cursorRef.current]!;
        const blob = file.slice(chunk.start, chunk.end);
        let attempt = 0;
        let sent = false;

        while (!sent) {
          attempt++;
          try {
            await handlers.current.uploadChunk(blob, {
              index: chunk.index,
              total: chunks.length,
              start: chunk.start,
              end: chunk.end,
              attempt,
              file,
            });
            sent = true;
          } catch (e) {
            const err = e instanceof Error ? e : new Error(String(e));
            if (!shouldRetry(attempt, maxAttempts)) {
              /* Stopping ON the failed chunk, not past it: `retry` then picks
                 up exactly where it stopped rather than skipping a hole into
                 the middle of the file. */
              setStatus("error");
              setError(err.message);
              handlers.current.onError?.(err, {
                index: chunk.index,
                total: chunks.length,
                start: chunk.start,
                end: chunk.end,
                attempt,
                file,
              });
              return;
            }
            await sleep(nextAttemptDelay(attempt));
            if (pausedRef.current) {
              setStatus("paused");
              return;
            }
          }
        }

        cursorRef.current++;
        setDone(cursorRef.current);
        handlers.current.onProgress?.(
          uploadProgress(cursorRef.current, chunks.length),
          cursorRef.current,
          chunks.length,
        );
      }

      setStatus("complete");
      handlers.current.onComplete?.(file);
    } finally {
      runningRef.current = false;
    }
  }, [file, chunks, maxAttempts]);

  /* A new file is a new upload, from the beginning. */
  React.useEffect(() => {
    cursorRef.current = 0;
    pausedRef.current = false;
    setDone(0);
    setError("");
    setStatus(file ? "idle" : "idle");
    if (file && autoStart) void run();
  }, [file, autoStart, run]);

  const percent = uploadProgress(done, chunks.length);
  const bytesDone = chunks.slice(0, done).reduce((sum, c) => sum + (c.end - c.start), 0);

  if (!file) {
    return (
      <p className={cn("zen-m-0 zen-text-sm zen-text-zen-muted-fg", className)}>
        No file selected.
      </p>
    );
  }

  return (
    <div className={cn("zen-flex zen-w-full zen-flex-col zen-gap-2", className)}>
      <div className="zen-flex zen-items-baseline zen-justify-between zen-gap-3">
        <span className="zen-min-w-0 zen-truncate zen-text-sm zen-font-medium zen-text-zen-foreground">
          {file.name}
        </span>
        <span className="zen-shrink-0 zen-text-xs zen-tabular-nums zen-text-zen-muted-fg">
          {formatBytes(bytesDone)} / {formatBytes(file.size)} · {done}/{chunks.length} chunks
        </span>
      </div>

      {showProgress ? (
        <Progress
          value={percent}
          color={status === "error" ? "error" : status === "complete" ? "success" : "primary"}
        />
      ) : null}

      <div className="zen-flex zen-items-center zen-gap-2">
        <span
          data-status={status}
          className={cn(
            "zen-text-xs",
            status === "error" ? "zen-text-zen-error" : "zen-text-zen-muted-fg",
          )}
        >
          {status === "complete"
            ? "Uploaded"
            : status === "error"
              ? `Failed: ${error}`
              : status === "paused"
                ? "Paused"
                : status === "uploading"
                  ? `${percent}%`
                  : "Ready"}
        </span>

        <span className="zen-ms-auto zen-flex zen-gap-2">
          {status === "uploading" ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                pausedRef.current = true;
              }}
            >
              Pause
            </Button>
          ) : null}
          {status === "paused" || status === "error" || (status === "idle" && !autoStart) ? (
            /* Resume, not restart: the cursor sits on the chunk that failed. */
            <Button size="sm" onClick={() => void run()}>
              {status === "error" ? "Retry" : status === "paused" ? "Resume" : "Upload"}
            </Button>
          ) : null}
        </span>
      </div>

      {/* Progress is announced at the boundaries, not per chunk — a 400-chunk
          upload announcing every step is unusable with a screen reader. */}
      <span className="zen-sr-only" aria-live="polite">
        {status === "complete"
          ? `${file.name} uploaded`
          : status === "error"
            ? `${file.name} failed to upload: ${error}`
            : ""}
      </span>
    </div>
  );
};
