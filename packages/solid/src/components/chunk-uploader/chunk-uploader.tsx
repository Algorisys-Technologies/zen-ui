import { createMemo, createSignal, createEffect, Show, on } from "solid-js";
import {
  planChunks,
  shouldRetry,
  nextAttemptDelay,
  uploadProgress,
  DEFAULT_CHUNK_SIZE,
  DEFAULT_MAX_ATTEMPTS,
  type ChunkPlanItem,
} from "@algorisys/zen-ui-core/chunk-upload";
import { cn } from "../../lib/cn";
import { Button } from "../button/button";
import { Progress } from "../progress/progress";

/**
 * ChunkUploader — a large file, sent in pieces, with progress you can pause and
 * resume.
 *
 *   <ChunkUploader
 *     file={recording()}
 *     uploadChunk={(blob, meta) => fetch(url(meta), { method: "POST", body: blob })}
 *     onComplete={finalise}
 *   />
 *
 * **It does not know your endpoint.** `uploadChunk` is yours: it receives the
 * slice and its metadata and returns a promise. That is the same rule FileUpload
 * and UploadCollection follow. What zen-ui owns is the arithmetic and the retry
 * policy — the part everyone gets wrong — from
 * `@algorisys/zen-ui-core/chunk-upload`, pinned by scripts/check-chunk-upload.ts.
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
  onComplete?: (file: File) => void;
  /** A chunk exhausted its attempts. The upload stops; Retry resumes it. */
  onError?: (error: Error, meta: ChunkMeta) => void;
  showProgress?: boolean;
  class?: string;
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

export const ChunkUploader = (props: ChunkUploaderProps) => {
  const [status, setStatus] = createSignal<ChunkUploadStatus>("idle");
  const [done, setDone] = createSignal(0);
  const [error, setError] = createSignal("");

  const chunks = createMemo<ChunkPlanItem[]>(() =>
    props.file ? planChunks(props.file.size, props.chunkSize ?? DEFAULT_CHUNK_SIZE) : [],
  );

  /* Plain variables, not signals: the loop reads these between awaits and must
     see the current value, not one captured when the run started. */
  let paused = false;
  let running = false;
  let cursor = 0;

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const run = async () => {
    const file = props.file;
    const plan = chunks();
    /* One drain at a time. Two would send the same chunk twice, and a server
       that appends rather than assembles would corrupt the file. */
    if (running || !file || plan.length === 0) return;
    running = true;
    paused = false;
    setStatus("uploading");
    setError("");

    try {
      while (cursor < plan.length) {
        if (paused) {
          setStatus("paused");
          return;
        }

        const chunk = plan[cursor]!;
        const blob = file.slice(chunk.start, chunk.end);
        let attempt = 0;
        let sent = false;

        while (!sent) {
          attempt++;
          const meta: ChunkMeta = {
            index: chunk.index,
            total: plan.length,
            start: chunk.start,
            end: chunk.end,
            attempt,
            file,
          };
          try {
            await props.uploadChunk(blob, meta);
            sent = true;
          } catch (e) {
            const err = e instanceof Error ? e : new Error(String(e));
            if (!shouldRetry(attempt, props.maxAttempts ?? DEFAULT_MAX_ATTEMPTS)) {
              /* Stopping ON the failed chunk, not past it: Retry then picks up
                 exactly where it stopped rather than skipping a hole into the
                 middle of the file. */
              setStatus("error");
              setError(err.message);
              props.onError?.(err, meta);
              return;
            }
            await sleep(nextAttemptDelay(attempt));
            if (paused) {
              setStatus("paused");
              return;
            }
          }
        }

        cursor++;
        setDone(cursor);
        props.onProgress?.(uploadProgress(cursor, plan.length), cursor, plan.length);
      }

      setStatus("complete");
      props.onComplete?.(file);
    } finally {
      running = false;
    }
  };

  /* A new file is a new upload, from the beginning. `on` with defer:false so it
     also runs for the file present at mount. */
  createEffect(
    on(
      () => props.file,
      (file) => {
        cursor = 0;
        paused = false;
        setDone(0);
        setError("");
        setStatus("idle");
        if (file && (props.autoStart ?? true)) void run();
      },
    ),
  );

  const percent = () => uploadProgress(done(), chunks().length);
  const bytesDone = () =>
    chunks()
      .slice(0, done())
      .reduce((sum, c) => sum + (c.end - c.start), 0);

  return (
    <Show
      when={props.file}
      fallback={
        <p class={cn("zen-m-0 zen-text-sm zen-text-zen-muted-fg", props.class)}>
          No file selected.
        </p>
      }
    >
      {(file) => (
        <div class={cn("zen-flex zen-w-full zen-flex-col zen-gap-2", props.class)}>
          <div class="zen-flex zen-items-baseline zen-justify-between zen-gap-3">
            <span class="zen-min-w-0 zen-truncate zen-text-sm zen-font-medium zen-text-zen-foreground">
              {file().name}
            </span>
            <span class="zen-shrink-0 zen-text-xs zen-tabular-nums zen-text-zen-muted-fg">
              {formatBytes(bytesDone())} / {formatBytes(file().size)} · {done()}/{chunks().length}{" "}
              chunks
            </span>
          </div>

          <Show when={props.showProgress !== false}>
            <Progress
              value={percent()}
              color={
                status() === "error" ? "error" : status() === "complete" ? "success" : "primary"
              }
            />
          </Show>

          <div class="zen-flex zen-items-center zen-gap-2">
            <span
              data-status={status()}
              class={cn(
                "zen-text-xs",
                status() === "error" ? "zen-text-zen-error" : "zen-text-zen-muted-fg",
              )}
            >
              {status() === "complete"
                ? "Uploaded"
                : status() === "error"
                  ? `Failed: ${error()}`
                  : status() === "paused"
                    ? "Paused"
                    : status() === "uploading"
                      ? `${percent()}%`
                      : "Ready"}
            </span>

            <span class="zen-ms-auto zen-flex zen-gap-2">
              <Show when={status() === "uploading"}>
                <Button size="sm" variant="outline" onClick={() => (paused = true)}>
                  Pause
                </Button>
              </Show>
              <Show
                when={
                  status() === "paused" ||
                  status() === "error" ||
                  (status() === "idle" && props.autoStart === false)
                }
              >
                {/* Resume, not restart: the cursor sits on the chunk that failed. */}
                <Button size="sm" onClick={() => void run()}>
                  {status() === "error" ? "Retry" : status() === "paused" ? "Resume" : "Upload"}
                </Button>
              </Show>
            </span>
          </div>

          {/* Announced at the boundaries, not per chunk — a 400-chunk upload
              announcing every step is unusable with a screen reader. */}
          <span class="zen-sr-only" aria-live="polite">
            {status() === "complete"
              ? `${file().name} uploaded`
              : status() === "error"
                ? `${file().name} failed to upload: ${error()}`
                : ""}
          </span>
        </div>
      )}
    </Show>
  );
};
