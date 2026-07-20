import { createSignal, onCleanup } from "solid-js";
import { UploadCollection, type UploadItem } from "./upload-collection/upload-collection";
import { FileUpload } from "./file-upload/file-upload";
import { DemoPage, DemoSection } from "./demo-helpers";

const DONE: UploadItem[] = [
  {
    id: "1",
    name: "signed-contract.pdf",
    size: 248_320,
    uploadedAt: "21 Jul, 09:14",
    uploadedBy: "R. Iyer",
    url: "#signed-contract",
  },
  {
    id: "2",
    name: "site-survey-photos.zip",
    size: 18_874_368,
    uploadedAt: "20 Jul, 16:02",
    uploadedBy: "A. Fernandes",
    url: "#site-survey",
  },
  {
    id: "3",
    name: "invoice-4417.xlsx",
    size: 41_984,
    uploadedAt: "18 Jul, 11:30",
    uploadedBy: "R. Iyer",
  },
];

const LIFECYCLE: UploadItem[] = [
  { id: "a", name: "drone-footage.mp4", size: 412_284_416, status: "uploading", progress: 63 },
  { id: "b", name: "scan-0042.tiff", size: 9_437_184, status: "uploading" },
  { id: "c", name: "queued-report.docx", size: 88_064, status: "pending" },
  {
    id: "d",
    name: "manifest.csv",
    size: 12_288,
    status: "error",
    error: "Rejected by the server: column 'hs_code' is missing",
  },
  { id: "e", name: "cover-letter.pdf", size: 51_200, status: "complete", uploadedAt: "just now" },
];

/**
 * Section 3's list, wired for real. The handlers are the subject of that
 * section, so no-op ones would demonstrate the opposite of the point: a control
 * that draws and does nothing. Retry fakes the upload it would trigger.
 */
const Gated = () => {
  const [items, setItems] = createSignal<UploadItem[]>([DONE[0], LIFECYCLE[3]]);
  const patch = (id: string, next: Partial<UploadItem>) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...next } : i)));
  let timer: ReturnType<typeof setTimeout> | undefined;
  onCleanup(() => clearTimeout(timer));

  return (
    <UploadCollection
      items={items()}
      onRemove={(item) => setItems((prev) => prev.filter((i) => i.id !== item.id))}
      onRename={(item, name) => patch(item.id, { name })}
      onRetry={(item) => {
        patch(item.id, { status: "uploading", progress: undefined, error: undefined });
        timer = setTimeout(
          () => patch(item.id, { status: "complete", uploadedAt: "just now" }),
          1200,
        );
      }}
      emptyMessage="Both rows removed — reload to bring them back"
      class="zen-w-full zen-max-w-xl"
    />
  );
};

/** A live list wired to FileUpload, so section 4 is the real pairing. */
const Wired = () => {
  const [items, setItems] = createSignal<UploadItem[]>([]);
  return (
    <div class="zen-flex zen-w-full zen-max-w-xl zen-flex-col zen-gap-3">
      <FileUpload
        multiple
        showFileList={false}
        onValueChange={(files) =>
          setItems(
            files.map((f, i) => ({
              id: `${i}-${f.name}`,
              name: f.name,
              size: f.size,
              type: f.type,
              status: "complete" as const,
              uploadedAt: "just now",
            })),
          )
        }
      />
      <UploadCollection
        items={items()}
        emptyMessage="Nothing attached yet"
        class="zen-w-full"
        onRemove={(item) => setItems((prev) => prev.filter((i) => i.id !== item.id))}
        onRename={(item, name) =>
          setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, name } : i)))
        }
      />
    </div>
  );
};

const NewUploadCollectionDemo = () => (
  <DemoPage
    title="UploadCollection"
    description={
      <>
        The list of files that have been uploaded, or are on their way.{" "}
        <code>FileUpload</code> is the input; this is the result.
      </>
    }
  >
    <DemoSection
      title="1. A list of attachments"
      codeTitle="Data in, list out"
      codeDescription="Items default to status 'complete', because a list of files uploaded in some earlier session is the common case — you should not have to stamp every row with a status to render a document library. Give an item a url and its name becomes a link; size, uploadedAt and uploadedBy join one meta line, and whichever you omit is simply absent rather than blank."
      code={`const items = [
  { id: "1", name: "signed-contract.pdf", size: 248320,
    uploadedAt: "21 Jul, 09:14", uploadedBy: "R. Iyer", url: "/files/1" },
  { id: "2", name: "invoice-4417.xlsx", size: 41984 },
];

<UploadCollection items={items} />`}
    >
      <UploadCollection items={DONE} class="zen-w-full zen-max-w-xl" />
    </DemoSection>

    <DemoSection
      title="2. Status and progress"
      codeTitle="The component renders the upload; it does not run it"
      codeDescription="There is no url prop, no method and no retry policy. You own the transport — fetch, XHR, a resumable chunked client — and write status and progress back onto the item. A component that owned the upload would have to guess at your endpoint, headers, auth refresh and chunk size, and every real app would end up fighting it. An uploading item with no percentage says so in words — Uploading… — rather than drawing a bar: Radix renders an indeterminate bar as an empty track and Kobalte renders it as a full one, so the same bar would read 'nothing has happened' in React and 'finished' in Solid. A bar is drawn only when there is a real number behind it."
      code={`{ id: "a", name: "drone-footage.mp4", status: "uploading", progress: 63 }
{ id: "b", name: "scan-0042.tiff",   status: "uploading" }   // "Uploading…"
{ id: "c", name: "queued.docx",      status: "pending" }     // "Queued"
{ id: "d", name: "manifest.csv",     status: "error",
  error: "Rejected by the server: column 'hs_code' is missing" }`}
    >
      <UploadCollection items={LIFECYCLE} class="zen-w-full zen-max-w-xl" />
    </DemoSection>

    <DemoSection
      title="3. Actions are presence-gated"
      codeTitle="No handler, no button"
      codeDescription="onRemove adds the delete button, onRename adds inline rename, onRetry adds a Retry button to failed rows only. A control that is always drawn and sometimes does nothing is worse than an absent one, because the user spends a click finding out. Retry is a word rather than an icon: there is no retry glyph anyone reads reliably, and it is the one action a failed row exists to offer. Rename commits on Enter or blur and cancels on Escape — blur commits deliberately, so clicking away does not silently discard what was typed."
      code={`<UploadCollection
  items={items}
  onRemove={(item) => remove(item.id)}
  onRetry={(item) => upload(item)}
  onRename={(item, name) => rename(item.id, name)}   // name is already trimmed
/>`}
    >
      <Gated />
    </DemoSection>

    <DemoSection
      title="4. Paired with FileUpload"
      codeTitle="Two components, because they answer to different owners"
      codeDescription="The drop zone is a control the user operates; the list is state your transport writes. Files can appear in the list from a previous session, and a file the user just picked can sit here failing for minutes. Pass showFileList={false} so FileUpload does not draw its own summary beside this one. Pick some files below — remove and rename are live."
      code={`<FileUpload multiple showFileList={false} onValueChange={setFiles} />
<UploadCollection
  items={items()}
  onRemove={(item) => setItems((p) => p.filter((i) => i.id !== item.id))}
  onRename={(item, name) => setItems((p) => p.map((i) => i.id === item.id ? { ...i, name } : i))}
/>`}
    >
      <Wired />
    </DemoSection>

    <DemoSection
      title="5. Thumbnails"
      codeTitle="For a gallery, where the name is not what identifies the file"
      codeDescription="An item with a thumbnail shows it in place of the file icon. The image is decorative — alt is empty — because the file's name sits right beside it and alt text would be the same words read twice."
      code={`{ id: "1", name: "hero-shot.jpg", size: 2411724, thumbnail: "/thumbs/1.jpg" }`}
    >
      <UploadCollection
        class="zen-w-full zen-max-w-xl"
        items={[
          {
            id: "t1",
            name: "hero-shot.jpg",
            size: 2_411_724,
            uploadedAt: "21 Jul, 08:10",
            thumbnail:
              "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='72' height='72'><rect width='72' height='72' fill='%232b5c8a'/><circle cx='24' cy='24' r='10' fill='%23f5d76e'/><path d='M0 72 L28 34 L52 60 L64 48 L72 58 L72 72 Z' fill='%231d3f5e'/></svg>",
          },
          {
            id: "t2",
            name: "floor-plan.png",
            size: 884_736,
            uploadedAt: "21 Jul, 08:11",
            thumbnail:
              "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='72' height='72'><rect width='72' height='72' fill='%23f2f2f2'/><g stroke='%23555' stroke-width='3' fill='none'><rect x='8' y='8' width='56' height='56'/><path d='M8 36 H40 M40 8 V64'/></g></svg>",
          },
        ]}
      />
    </DemoSection>

    <DemoSection
      title="6. Empty"
      codeTitle="emptyMessage"
      codeDescription="An empty collection renders the message rather than an empty bordered box, which reads as a component that failed to load rather than a folder with nothing in it."
      code={`<UploadCollection
        items={[]}
        emptyMessage="No attachments on this order"
        class="zen-w-full zen-max-w-xl"
      />`}
    >
      <UploadCollection items={[]} emptyMessage="No attachments on this order" />
    </DemoSection>
  </DemoPage>
);

export default NewUploadCollectionDemo;
