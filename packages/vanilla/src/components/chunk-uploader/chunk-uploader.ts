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
import { applyProps, Disposer, type BaseProps, type ZenComponent } from "../../lib/component";

/**
 * ChunkUploader — a large file, sent in pieces, with progress you can pause and
 * resume.
 *
 *   ChunkUploader({
 *     file: recording,
 *     uploadChunk: (blob, meta) => fetch(url(meta), { method: "POST", body: blob }),
 *     onComplete: finalise,
 *   }).el
 *
 * Vanilla port; see the React binding for the reasoning. Same API, same output.
 *
 * **It does not know your endpoint.** `uploadChunk` is yours: it receives the
 * slice and its metadata and returns a promise — the same rule FileUpload and
 * UploadCollection follow. What zen-ui owns is the arithmetic and the retry
 * policy, which is the part everyone gets wrong.
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

export interface ChunkUploaderProps extends BaseProps {
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
  /** A chunk exhausted its attempts. The upload stops; the retry button resumes it. */
  onError?: (error: Error, meta: ChunkMeta) => void;
  /** Hide the built-in bar and drive it from `onProgress` instead. */
  showProgress?: boolean;
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

export function ChunkUploader(props: ChunkUploaderProps): ZenComponent<ChunkUploaderProps> {
  let current: ChunkUploaderProps = { ...props };
  const disposer = new Disposer();
  let removeProps: (() => void) | undefined;

  let status: ChunkUploadStatus = "idle";
  let done = 0;
  let errorText = "";
  let chunks: ChunkPlanItem[] = [];

  /* Plain locals, read between awaits — the loop must see the CURRENT value, not
     the one captured when the run started. */
  let paused = false;
  let running = false;
  let cursor = 0;
  /** Which file the loop is draining, so a swap mid-flight cannot finish onto it. */
  let runFile: File | null = null;

  const el = document.createElement("div");
  const head = document.createElement("div");
  const nameEl = document.createElement("span");
  const countsEl = document.createElement("span");
  const statusEl = document.createElement("span");
  const controls = document.createElement("div");
  const buttons = document.createElement("span");
  const liveEl = document.createElement("span");

  let bar: ZenComponent<Record<string, unknown>> | undefined;
  let btnParts: Array<{ destroy(): void }> = [];

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const replan = () => {
    chunks = current.file ? planChunks(current.file.size, current.chunkSize ?? DEFAULT_CHUNK_SIZE) : [];
  };

  const run = async () => {
    const file = current.file;
    /* One drain at a time. Two would send the same chunk twice, and a server that
       appends rather than assembles would corrupt the file. */
    if (running || !file || chunks.length === 0) return;
    running = true;
    runFile = file;
    paused = false;
    status = "uploading";
    errorText = "";
    render();

    const maxAttempts = current.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;

    try {
      while (cursor < chunks.length) {
        if (paused || current.file !== runFile) {
          if (paused) status = "paused";
          render();
          return;
        }

        const chunk = chunks[cursor]!;
        const blob = file.slice(chunk.start, chunk.end);
        let attempt = 0;
        let sent = false;

        while (!sent) {
          attempt++;
          const meta: ChunkMeta = {
            index: chunk.index,
            total: chunks.length,
            start: chunk.start,
            end: chunk.end,
            attempt,
            file,
          };
          try {
            await current.uploadChunk(blob, meta);
            sent = true;
          } catch (e) {
            const err = e instanceof Error ? e : new Error(String(e));
            if (!shouldRetry(attempt, maxAttempts)) {
              /* Stopping ON the failed chunk, not past it: retry then picks up
                 exactly where it stopped rather than skipping a hole into the
                 middle of the file. */
              status = "error";
              errorText = err.message;
              render();
              current.onError?.(err, meta);
              return;
            }
            await sleep(nextAttemptDelay(attempt));
            if (paused) {
              status = "paused";
              render();
              return;
            }
          }
        }

        cursor++;
        done = cursor;
        render();
        current.onProgress?.(uploadProgress(cursor, chunks.length), cursor, chunks.length);
      }

      status = "complete";
      render();
      current.onComplete?.(file);
    } finally {
      running = false;
    }
  };

  const render = () => {
    const { file, autoStart = true, showProgress = true, class: className } = current;

    for (const b of btnParts) b.destroy();
    btnParts = [];

    if (!file) {
      el.replaceChildren();
      el.className = cn("zen-m-0 zen-text-sm zen-text-zen-muted-fg", className);
      el.textContent = "No file selected.";
      applyRest();
      return;
    }

    const percent = uploadProgress(done, chunks.length);
    const bytesDone = chunks.slice(0, done).reduce((sum, c) => sum + (c.end - c.start), 0);

    el.className = cn("zen-flex zen-w-full zen-flex-col zen-gap-2", className);
    el.replaceChildren();
    el.textContent = "";

    head.className = "zen-flex zen-items-baseline zen-justify-between zen-gap-3";
    nameEl.className = "zen-min-w-0 zen-truncate zen-text-sm zen-font-medium zen-text-zen-foreground";
    nameEl.textContent = file.name;
    countsEl.className = "zen-shrink-0 zen-text-xs zen-tabular-nums zen-text-zen-muted-fg";
    countsEl.textContent = `${formatBytes(bytesDone)} / ${formatBytes(file.size)} · ${done}/${chunks.length} chunks`;
    head.replaceChildren(nameEl, countsEl);
    el.append(head);

    if (showProgress) {
      const color = status === "error" ? "error" : status === "complete" ? "success" : "primary";
      if (!bar) {
        bar = Progress({ value: percent, color }) as unknown as ZenComponent<Record<string, unknown>>;
        disposer.add(() => bar?.destroy());
      } else {
        bar.update({ value: percent, color });
      }
      el.append(bar.el);
    }

    controls.className = "zen-flex zen-items-center zen-gap-2";
    statusEl.dataset.status = status;
    statusEl.className = cn("zen-text-xs", status === "error" ? "zen-text-zen-error" : "zen-text-zen-muted-fg");
    statusEl.textContent =
      status === "complete"
        ? "Uploaded"
        : status === "error"
          ? `Failed: ${errorText}`
          : status === "paused"
            ? "Paused"
            : status === "uploading"
              ? `${percent}%`
              : "Ready";

    buttons.className = "zen-ms-auto zen-flex zen-gap-2";
    buttons.replaceChildren();

    if (status === "uploading") {
      const pause = Button({
        size: "sm",
        variant: "outline",
        onClick: () => {
          paused = true;
        },
        children: "Pause",
      });
      btnParts.push(pause);
      buttons.append(pause.el);
    }
    if (status === "paused" || status === "error" || (status === "idle" && !autoStart)) {
      /* Resume, not restart: the cursor sits on the chunk that failed. */
      const go = Button({
        size: "sm",
        onClick: () => void run(),
        children: status === "error" ? "Retry" : status === "paused" ? "Resume" : "Upload",
      });
      btnParts.push(go);
      buttons.append(go.el);
    }

    controls.replaceChildren(statusEl, buttons);
    el.append(controls);

    /* Progress is announced at the BOUNDARIES, not per chunk — a 400-chunk upload
       announcing every step is unusable with a screen reader. */
    liveEl.className = "zen-sr-only";
    liveEl.setAttribute("aria-live", "polite");
    liveEl.textContent =
      status === "complete"
        ? `${file.name} uploaded`
        : status === "error"
          ? `${file.name} failed to upload: ${errorText}`
          : "";
    el.append(liveEl);

    applyRest();
  };

  function applyRest() {
    const {
      file: _f, uploadChunk: _u, chunkSize: _cs, maxAttempts: _ma, autoStart: _as,
      onProgress: _op, onComplete: _oc, onError: _oe, showProgress: _sp,
      class: _c, children: _ch,
      ...rest
    } = current;
    removeProps?.();
    removeProps = applyProps(el, rest as Record<string, unknown>);
  }

  /** A new file is a new upload, from the beginning. */
  const onFileChange = () => {
    cursor = 0;
    paused = false;
    done = 0;
    errorText = "";
    status = "idle";
    replan();
    render();
    if (current.file && (current.autoStart ?? true)) void run();
  };

  onFileChange();
  disposer.add(() => removeProps?.());
  disposer.add(() => {
    for (const b of btnParts) b.destroy();
  });

  return {
    el,
    update(next) {
      const before = current.file;
      const beforeSize = current.chunkSize;
      current = { ...current, ...next };
      /* A different file, or a different slicing of the same one, invalidates
         every chunk already sent — anything else resumes where it was. */
      if (current.file !== before || current.chunkSize !== beforeSize) onFileChange();
      else render();
    },
    destroy() {
      paused = true;
      runFile = null;
      disposer.dispose();
      el.remove();
    },
  };
}
