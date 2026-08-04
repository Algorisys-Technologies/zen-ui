import { DemoPage } from "./demo-helpers";

/** A real File, built in the page — no fixture, no network. */
const fakeFile = (name: string, bytes: number): File =>
  new File([new Uint8Array(bytes)], name, { type: "application/octet-stream" });

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

type Meta = { index: number; total: number; attempt: number };

/** Build a <zen-chunk-uploader> and give it its two property-only inputs. */
function uploader(
  attrs: Record<string, string>,
  file: File | null,
  uploadChunk: (blob: Blob, meta: Meta) => Promise<unknown>,
): HTMLElement {
  const el = document.createElement("zen-chunk-uploader");
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  const bag = el as unknown as { file: File | null; uploadChunk: typeof uploadChunk };
  bag.uploadChunk = uploadChunk;
  bag.file = file;
  return el;
}

export default function ChunkUploaderDemo(): HTMLElement {
  return DemoPage({
    title: "ChunkUploader",
    description:
      "A large file, sent in pieces, with progress you can pause and resume. For an interview recording or a screen capture — anything big enough that one failed request should not mean starting again.",
    sections: [
      {
        title: "1. Two inputs with no attribute form",
        codeTitle: "`file` is a File and `uploadChunk` is a function",
        codeDescription:
          "Neither can be written in HTML, so this is the one element in the set that is property-driven by necessity rather than by choice — the attributes here are the policy knobs around them. uploadChunk is yours: it receives the slice and its metadata and returns a promise, the same rule FileUpload and UploadCollection follow. What zen-ui owns is the chunk plan and the retry policy, pinned by 33 assertions in check-chunk-upload.ts.",
        code: `<zen-chunk-uploader chunk-size="5242880"></zen-chunk-uploader>

el.uploadChunk = (blob, meta) =>
  fetch(\`/api/upload/\${meta.index}\`, { method: "POST", body: blob });
el.file = input.files[0];`,
        render: () =>
          uploader({}, fakeFile("interview-2291.webm", 5 * 1024 * 1024 * 4 + 733_000), () => wait(280)),
      },
      {
        title: "2. Retries, and a backoff that doubles",
        codeTitle: "`max-attempts`, and where it stops",
        codeDescription:
          "A rejected uploadChunk is retried up to max-attempts (3 by default) with a delay that doubles, rather than hammering a server that is already down. When a chunk exhausts its attempts the upload stops ON that chunk rather than past it, so Retry picks up exactly where it stopped instead of skipping a hole into the middle of the file.",
        code: `<zen-chunk-uploader max-attempts="3"></zen-chunk-uploader>

el.addEventListener("zen-error", (e) => report(e.detail));`,
        render: () => {
          const wrap = document.createElement("div");
          wrap.style.cssText = "display:flex;flex-direction:column;gap:8px;width:100%";
          const log = document.createElement("p");
          log.style.cssText = "margin:0;font-size:13px;color:var(--zen-color-muted-fg)";
          log.textContent = "Chunk 3 is rigged to fail every time — watch it retry, then stop and offer Retry.";

          const el = uploader({ "max-attempts": "3" }, fakeFile("screen-capture.mp4", 5 * 1024 * 1024 * 6), async (_b, meta) => {
            await wait(220);
            if (meta.index === 3) throw new Error("503 from the storage node");
          });
          el.addEventListener("zen-error", () => {
            log.textContent = "zen-error fired — the upload stopped on chunk 3, and Retry resumes there";
          });

          wrap.append(log, el);
          return wrap;
        },
      },
      {
        title: "3. Pause and resume",
        codeTitle: "The cursor is the point",
        codeDescription:
          "Pause stops between chunks rather than aborting one in flight, and Resume continues from the cursor — it does not restart. A candidate on hotel wifi who has sent 40 of 60 chunks keeps the 40. auto-start is json rather than a boolean attribute because it defaults to TRUE.",
        code: `<zen-chunk-uploader auto-start="false"></zen-chunk-uploader>`,
        render: () =>
          uploader({ "auto-start": "false" }, fakeFile("submission-bundle.zip", 5 * 1024 * 1024 * 8), () => wait(400)),
      },
      {
        title: "4. Chunk size, and driving your own bar",
        codeTitle: "`chunk-size`, `show-progress` and `zen-progress`",
        codeDescription:
          "chunk-size defaults to 5 MB, which is the smallest part most object stores accept for a multipart upload. show-progress=\"false\" hides the built-in bar for a screen that already has one — zen-progress still fires with the percentage, the count done and the total.",
        code: `<zen-chunk-uploader chunk-size="1048576" show-progress="false"></zen-chunk-uploader>

el.addEventListener("zen-progress", (e) => bar.setAttribute("value", e.detail));`,
        render: () => {
          const wrap = document.createElement("div");
          wrap.style.cssText = "display:flex;flex-direction:column;gap:8px;width:100%";
          const readout = document.createElement("p");
          readout.style.cssText = "margin:0;font-size:13px;color:var(--zen-color-muted-fg)";
          readout.textContent = "zen-progress: not started";

          const el = uploader(
            { "chunk-size": String(1024 * 1024), "show-progress": "false" },
            fakeFile("answers.json", 1024 * 1024 * 7),
            () => wait(200),
          );
          el.addEventListener("zen-progress", (e) => {
            readout.textContent = `zen-progress: ${(e as CustomEvent<number>).detail}%`;
          });

          wrap.append(readout, el);
          return wrap;
        },
      },
      {
        title: "5. No file",
        codeTitle: "The idle state",
        codeDescription:
          "With no file it renders a line rather than an empty progress bar at 0%, which reads as an upload that is stuck. The element also defaults uploadChunk to a resolved promise, so a bare <zen-chunk-uploader> on a page connects rather than throwing — an element cannot require a property to exist before it is upgraded.",
        code: `<zen-chunk-uploader></zen-chunk-uploader>`,
        render: () => document.createElement("zen-chunk-uploader"),
      },
    ],
  });
}
