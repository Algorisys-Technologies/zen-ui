import { ChunkUploader, type ChunkMeta } from "./chunk-uploader/chunk-uploader";
import { DemoPage } from "./demo-helpers";

/** A real File, built in the page — no fixture, no network. */
const fakeFile = (name: string, bytes: number): File =>
  new File([new Uint8Array(bytes)], name, { type: "application/octet-stream" });

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function ChunkUploaderDemo(): HTMLElement {
  return DemoPage({
    title: "ChunkUploader",
    description:
      "A large file, sent in pieces, with progress you can pause and resume. For an interview recording or a screen capture — anything big enough that one failed request should not mean starting again.",
    sections: [
      {
        title: "1. Your endpoint, our arithmetic",
        codeTitle: "`uploadChunk` is yours",
        codeDescription:
          "It receives the slice and its metadata and returns a promise. That is the same rule FileUpload and UploadCollection follow, and it is what lets this work with a signed URL, a presigned part, or a socket — none of which a component could have guessed. What zen-ui owns is the chunk plan and the retry policy, which is the part everyone gets wrong: the chunks tile the file exactly, with no gap and no overlap, pinned by 33 assertions in check-chunk-upload.ts.",
        code: `ChunkUploader({
  file: recording,
  uploadChunk: (blob, meta) =>
    fetch(\`/api/upload/\${meta.index}\`, { method: "POST", body: blob }),
  onComplete: finalise,
}).el`,
        render: () =>
          ChunkUploader({
            file: fakeFile("interview-2291.webm", 5 * 1024 * 1024 * 4 + 733_000),
            uploadChunk: () => wait(280),
          }).el,
      },
      {
        title: "2. Retries, and a backoff that doubles",
        codeTitle: "`maxAttempts`, and where it stops",
        codeDescription:
          "A rejected uploadChunk is retried up to maxAttempts (3 by default) with a delay that doubles, rather than hammering a server that is already down. When a chunk exhausts its attempts the upload stops ON that chunk rather than past it, so Retry picks up exactly where it stopped instead of skipping a hole into the middle of the file.",
        code: `ChunkUploader({
  file, uploadChunk,
  maxAttempts: 3,
  onError: (err, meta) => report(\`chunk \${meta.index} failed: \${err.message}\`),
}).el`,
        render: () => {
          const wrap = document.createElement("div");
          wrap.style.display = "flex";
          wrap.style.flexDirection = "column";
          wrap.style.gap = "8px";
          wrap.style.width = "100%";

          const log = document.createElement("p");
          log.style.margin = "0";
          log.style.fontSize = "13px";
          log.style.color = "var(--zen-color-muted-fg)";
          log.textContent = "Chunk 3 is rigged to fail every time — watch it retry, then stop and offer Retry.";

          wrap.append(
            log,
            ChunkUploader({
              file: fakeFile("screen-capture.mp4", 5 * 1024 * 1024 * 6),
              maxAttempts: 3,
              uploadChunk: async (_blob, meta: ChunkMeta) => {
                await wait(220);
                if (meta.index === 3) throw new Error("503 from the storage node");
              },
              onError: (err, meta) => {
                log.textContent = `chunk ${meta.index} failed after ${meta.attempt} attempts: ${err.message}`;
              },
            }).el,
          );
          return wrap;
        },
      },
      {
        title: "3. Pause and resume",
        codeTitle: "The cursor is the point",
        codeDescription:
          "Pause stops between chunks rather than aborting one in flight, and Resume continues from the cursor — it does not restart. A candidate on hotel wifi who has sent 40 of 60 chunks keeps the 40.",
        code: `// nothing to configure — the buttons appear with the state
ChunkUploader({ file, uploadChunk, autoStart: false }).el`,
        render: () =>
          ChunkUploader({
            file: fakeFile("submission-bundle.zip", 5 * 1024 * 1024 * 8),
            autoStart: false,
            uploadChunk: () => wait(400),
          }).el,
      },
      {
        title: "4. Chunk size, and driving your own bar",
        codeTitle: "`chunkSize`, `showProgress` and `onProgress`",
        codeDescription:
          "chunkSize defaults to 5 MB, which is the smallest part most object stores accept for a multipart upload. showProgress: false hides the built-in bar for a screen that already has one — onProgress still fires with the percentage, the count done, and the total.",
        code: `ChunkUploader({
  file, uploadChunk,
  chunkSize: 1024 * 1024,
  showProgress: false,
  onProgress: (percent, done, total) => bar.update({ value: percent }),
}).el`,
        render: () => {
          const wrap = document.createElement("div");
          wrap.style.display = "flex";
          wrap.style.flexDirection = "column";
          wrap.style.gap = "8px";
          wrap.style.width = "100%";

          const readout = document.createElement("p");
          readout.style.margin = "0";
          readout.style.fontSize = "13px";
          readout.style.color = "var(--zen-color-muted-fg)";
          readout.textContent = "onProgress: not started";

          wrap.append(
            readout,
            ChunkUploader({
              file: fakeFile("answers.json", 1024 * 1024 * 7),
              chunkSize: 1024 * 1024,
              showProgress: false,
              uploadChunk: () => wait(200),
              onProgress: (percent, done, total) => {
                readout.textContent = `onProgress: ${percent}% — ${done} of ${total} chunks`;
              },
            }).el,
          );
          return wrap;
        },
      },
      {
        title: "5. No file",
        codeTitle: "The idle state",
        codeDescription:
          "Omit `file` and it renders a line rather than an empty progress bar at 0%, which reads as an upload that is stuck.",
        code: `ChunkUploader({ uploadChunk }).el`,
        render: () => ChunkUploader({ uploadChunk: () => Promise.resolve() }).el,
      },
    ],
  });
}
