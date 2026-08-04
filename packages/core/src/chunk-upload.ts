/**
 * Chunked-upload planning — the pure half of ChunkUploader.
 *
 * Cutting a file into pieces, deciding whether a failed piece is worth another
 * attempt, and how long to wait first. No network and no DOM, so the awkward
 * cases are testable: an empty file, a file exactly one chunk long, a server
 * that is down.
 *
 * The transport is NOT here and is not in the component either. zen-ui does not
 * own your endpoint, your auth refresh or your resume protocol — the same rule
 * UploadCollection follows. What it owns is the arithmetic everyone gets subtly
 * wrong: an off-by-one that drops the last few bytes, and a retry loop with no
 * limit that pins a CPU against a server that is not coming back.
 */

export interface ChunkPlanItem {
  /** Sequential from 0. Servers that append rather than assemble depend on this order. */
  index: number;
  /** Byte offset, inclusive. */
  start: number;
  /** Byte offset, exclusive — `file.slice(start, end)`. */
  end: number;
}

export const DEFAULT_CHUNK_SIZE = 5 * 1024 * 1024;
/** Three tries, then it is a failure worth telling the user about. */
export const DEFAULT_MAX_ATTEMPTS = 3;
const DEFAULT_BACKOFF_MS = 500;
const MAX_BACKOFF_MS = 30_000;

/**
 * Cut a file of `size` bytes into chunks.
 *
 * The pieces tile the file exactly: no gaps, no overlaps, and the last one is
 * the remainder rather than a padded full chunk. An empty file yields NO chunks
 * — uploading one empty piece is how a zero-byte recording ends up looking like
 * a successful upload.
 *
 * A non-positive chunk size falls back to the default instead of looping
 * forever, which is what `while (offset < size) offset += 0` does.
 */
export const planChunks = (size: number, chunkSize: number = DEFAULT_CHUNK_SIZE): ChunkPlanItem[] => {
  if (!Number.isFinite(size) || size <= 0) return [];
  const step = Number.isFinite(chunkSize) && chunkSize > 0 ? Math.floor(chunkSize) : DEFAULT_CHUNK_SIZE;

  const chunks: ChunkPlanItem[] = [];
  for (let start = 0, index = 0; start < size; start += step, index++) {
    chunks.push({ index, start, end: Math.min(start + step, size) });
  }
  return chunks;
};

/**
 * Whether a chunk that has already been tried `attempt` times gets another go.
 *
 * There is always a limit. The alternative — retry until it works — turns a
 * server outage into a tab that never stops trying, at full speed, and the user
 * is never told anything is wrong.
 */
export const shouldRetry = (attempt: number, maxAttempts: number = DEFAULT_MAX_ATTEMPTS): boolean =>
  attempt < maxAttempts;

/**
 * How long to wait before retry number `attempt`, doubling and capped.
 *
 * Retrying immediately is worse than not retrying: it is the same request
 * against the same broken server, arriving before anything could have changed,
 * and it costs the battery of whoever is sitting the exam.
 */
export const nextAttemptDelay = (attempt: number, baseMs: number = DEFAULT_BACKOFF_MS): number => {
  const n = Math.max(1, Math.floor(attempt));
  return Math.min(MAX_BACKOFF_MS, baseMs * 2 ** (n - 1));
};

/** Whole percent, clamped. No chunks is complete rather than a division by zero. */
export const uploadProgress = (done: number, total: number): number => {
  if (total <= 0) return 100;
  return Math.round(Math.min(100, Math.max(0, (done / total) * 100)));
};
