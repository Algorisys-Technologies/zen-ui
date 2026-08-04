import { useState } from "react";
import { ChunkUploader } from "./chunk-uploader/chunk-uploader";
import { FileUpload } from "./file-upload/file-upload";
import { CodeExample } from "./demo-helpers";

/** A file made in the page, so the demo needs no picker to show a real upload. */
const makeFile = (mb: number) =>
  new File([new Uint8Array(mb * 1024 * 1024)], `interview-${mb}mb.webm`, { type: "video/webm" });

const NewChunkUploaderDemo: React.FC = () => {
  const [picked, setPicked] = useState<File[]>([]);
  const [demo] = useState(() => makeFile(12));
  const [flaky] = useState(() => makeFile(6));
  const [log, setLog] = useState<string[]>([]);

  /* Succeeds, slowly enough to watch. */
  const ok = (_blob: Blob, meta: { index: number }) =>
    new Promise<void>((resolve) => {
      setTimeout(() => {
        setLog((l) => [`chunk ${meta.index} ok`, ...l].slice(0, 5));
        resolve();
      }, 300);
    });

  /* Fails chunk 1 twice, then succeeds — so the backoff is visible. */
  const attempts: Record<number, number> = {};
  const unreliable = (_blob: Blob, meta: { index: number; attempt: number }) =>
    new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        attempts[meta.index] = (attempts[meta.index] ?? 0) + 1;
        if (meta.index === 1 && meta.attempt < 3) {
          setLog((l) => [`chunk 1 attempt ${meta.attempt} failed`, ...l].slice(0, 5));
          reject(new Error("network"));
        } else {
          setLog((l) => [`chunk ${meta.index} ok`, ...l].slice(0, 5));
          resolve();
        }
      }, 250);
    });

  return (
    <div className="demo-page">
      <h1>ChunkUploader</h1>
      <p className="lede">
        A large file sent in pieces, with progress you can pause and resume — for
        an interview recording or a screen capture, anything big enough that one
        failed request should not mean starting again.{" "}
        <strong>It does not know your endpoint.</strong>
      </p>

      <section className="demo-section">
        <h2>1. A file and a transport</h2>
        <CodeExample
          title="`uploadChunk` is yours"
          description="It receives the slice and its metadata and returns a promise. That is the same rule FileUpload and UploadCollection follow, and it is what lets this work with a signed URL, a presigned part or a socket — none of which a component could have guessed. What zen-ui owns is the arithmetic and the retry policy."
          code={`<ChunkUploader
  file={file}
  uploadChunk={(blob, meta) =>
    fetch(\`/api/upload?i=\${meta.index}&of=\${meta.total}\`, {
      method: "POST",
      body: blob,
    })
  }
  onComplete={() => finalise()}
/>`}
        >
          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
            <ChunkUploader file={demo} uploadChunk={ok} chunkSize={2 * 1024 * 1024} autoStart={false} />
            <pre style={{ margin: 0, fontSize: 12, minHeight: 70 }}>{log.join("\n") || "press Upload"}</pre>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>2. Retries are bounded and back off</h2>
        <CodeExample
          title="Three attempts, doubling from 500ms"
          description="The app this replaces retries a failed chunk by pushing it back on the queue with no attempt limit and no delay — so a chunk failing against a down server is retried immediately, forever, which is how a tab locks up and the user is told nothing. Here the wait doubles and there is always a limit; exhausting it stops ON the failed chunk, so Retry resumes from exactly there rather than skipping a hole into the middle of the file."
          code={`<ChunkUploader file={file} uploadChunk={send} maxAttempts={3} />
// attempt 1 fails → wait 500ms
// attempt 2 fails → wait 1s
// attempt 3 fails → stop, onError, and the Retry button resumes`}
        >
          <ChunkUploader file={flaky} uploadChunk={unreliable} chunkSize={2 * 1024 * 1024} autoStart={false} />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>3. With FileUpload</h2>
        <CodeExample
          title="The picker is a separate component"
          description="FileUpload is the drop zone; this is the transfer. Two components because they answer to different owners — the same split UploadCollection already makes."
          code={`const [files, setFiles] = useState<File[]>([]);

<FileUpload value={files} onValueChange={setFiles} accept="video/*" />
<ChunkUploader file={files[0]} uploadChunk={send} />`}
        >
          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
            <FileUpload value={picked} onValueChange={setPicked} />
            <ChunkUploader file={picked[0]} uploadChunk={ok} chunkSize={1024 * 1024} />
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>4. The plan is pure and pinned</h2>
        <CodeExample
          title="planChunks tiles the file exactly"
          description="No gaps, no overlaps, and the last chunk is the remainder rather than a padded full one. An empty file yields NO chunks — uploading one empty piece is how a zero-byte recording ends up looking like a successful upload. All of it is testable with no network."
          code={`planChunks(250, 100)
// [{index:0, start:0, end:100},
//  {index:1, start:100, end:200},
//  {index:2, start:200, end:250}]

planChunks(0, 100)   // []  — not [{start:0,end:0}]`}
        >
          <p style={{ margin: 0, fontSize: 14, color: "var(--zen-color-muted-fg)" }}>
            33 assertions in <code>scripts/check-chunk-upload.ts</code>.
          </p>
        </CodeExample>
      </section>
    </div>
  );
};

export default NewChunkUploaderDemo;
