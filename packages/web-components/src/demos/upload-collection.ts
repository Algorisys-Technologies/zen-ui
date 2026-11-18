import { DemoPage } from "./demo-helpers";

interface Item {
  id: string;
  name: string;
  size?: number;
  status?: string;
  progress?: number;
  error?: string;
  url?: string;
  uploadedAt?: string;
  uploadedBy?: string;
  thumbnail?: string;
}

const DONE: Item[] = [
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

const LIFECYCLE: Item[] = [
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

const THUMBS: Item[] = [
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
];

/**
 * Build a <zen-upload-collection>. Items go on through the json ATTRIBUTE where
 * the section is about markup and through the property where it is about a live
 * list; both reach the same prop.
 */
function uc(
  items: Item[],
  attrs: Record<string, string> = {},
  viaAttribute = false,
): HTMLElement & { items: Item[] } {
  const el = document.createElement("zen-upload-collection") as HTMLElement & { items: Item[] };
  el.className = "zen-w-full zen-max-w-xl";
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  if (viaAttribute) el.setAttribute("items", JSON.stringify(items));
  else el.items = items;
  return el;
}

/**
 * Section 3's list, wired for real. The handlers are the subject of that
 * section, so no-op ones would demonstrate the opposite of the point: a control
 * that draws and does nothing. Retry fakes the upload it would trigger.
 */
function gated(): HTMLElement {
  let items: Item[] = [DONE[0], LIFECYCLE[3]];
  let timer: ReturnType<typeof setTimeout> | undefined;
  const el = uc(items, { "empty-message": "Both rows removed — reload to bring them back" });

  const set = (next: Item[]) => {
    items = next;
    el.items = items;
  };
  const patch = (id: string, next: Partial<Item>) =>
    set(items.map((i) => (i.id === id ? { ...i, ...next } : i)));

  el.addEventListener("zen-remove", (e) => {
    const item = (e as CustomEvent<Item>).detail;
    set(items.filter((i) => i.id !== item.id));
  });
  el.addEventListener("zen-rename", (e) => {
    // Two arguments, so the detail is the pair.
    const [item, name] = (e as CustomEvent<[Item, string]>).detail;
    patch(item.id, { name });
  });
  el.addEventListener("zen-retry", (e) => {
    const item = (e as CustomEvent<Item>).detail;
    patch(item.id, { status: "uploading", progress: undefined, error: undefined });
    clearTimeout(timer);
    timer = setTimeout(() => patch(item.id, { status: "complete", uploadedAt: "just now" }), 1200);
  });

  return el;
}

/** A live list wired to <zen-file-upload>, so section 4 is the real pairing. */
function wired(): HTMLElement {
  const wrap = document.createElement("div");
  wrap.className = "zen-flex zen-w-full zen-max-w-xl zen-flex-col zen-gap-3";

  let items: Item[] = [];
  const list = uc(items, { "empty-message": "Nothing attached yet" });
  const set = (next: Item[]) => {
    items = next;
    list.items = items;
  };

  const upload = document.createElement("zen-file-upload") as HTMLElement & {
    showFileList: boolean;
  };
  upload.setAttribute("multiple", "");
  /* A PROPERTY, not an attribute. showFileList defaults TRUE, and an absent
     boolean attribute resolves to false in defineZenElement — so declaring it as
     an attr would invert the default for every HTML author. It is declared in
     `props` for that reason (lib/define.ts), and setAttribute here would have
     been silently ignored. */
  upload.showFileList = false;
  upload.addEventListener("zen-value-change", (e) => {
    const files = (e as CustomEvent<File[]>).detail ?? [];
    set(
      files.map((f, i) => ({
        id: `${i}-${f.name}`,
        name: f.name,
        size: f.size,
        status: "complete",
        uploadedAt: "just now",
      })),
    );
  });

  list.addEventListener("zen-remove", (e) => {
    const item = (e as CustomEvent<Item>).detail;
    set(items.filter((i) => i.id !== item.id));
  });
  list.addEventListener("zen-rename", (e) => {
    const [item, name] = (e as CustomEvent<[Item, string]>).detail;
    set(items.map((i) => (i.id === item.id ? { ...i, name } : i)));
  });

  wrap.append(upload, list);
  return wrap;
}

export default function UploadCollectionDemo(): HTMLElement {
  return DemoPage({
    title: "UploadCollection",
    description:
      "The list of files that have been uploaded, or are on their way. <zen-file-upload> is the input; this is the result.",
    sections: [
      {
        title: "1. A list of attachments",
        codeTitle: "items is a json attribute, so a document library can come from markup",
        codeDescription:
          "Items default to status 'complete', because a list of files uploaded in some earlier session is the common case — you should not have to stamp every row with a status. Give an item a url and its name becomes a link; size, uploadedAt and uploadedBy join one meta line, and whichever you omit is simply absent rather than blank.",
        code: `<zen-upload-collection items='[
  { "id": "1", "name": "signed-contract.pdf", "size": 248320,
    "uploadedAt": "21 Jul, 09:14", "uploadedBy": "R. Iyer", "url": "/files/1" },
  { "id": "2", "name": "invoice-4417.xlsx", "size": 41984 }
]'></zen-upload-collection>`,
        render: () => uc(DONE, {}, true),
      },
      {
        title: "2. Status and progress",
        codeTitle: "The element renders the upload; it does not run it",
        codeDescription:
          "There is no url attribute, no method and no retry policy. You own the transport — fetch, XHR, a resumable chunked client — and write status and progress back onto the items. An uploading item with no percentage says so in words — Uploading… — rather than drawing a bar: Radix renders an indeterminate bar as an empty track and Kobalte renders it as a full one, so the same bar would read 'nothing has happened' in React and 'finished' in Solid. A bar is drawn only when there is a real number behind it.",
        code: `{ "id": "a", "name": "drone-footage.mp4", "status": "uploading", "progress": 63 }
{ "id": "b", "name": "scan-0042.tiff",   "status": "uploading" }   // "Uploading…"
{ "id": "c", "name": "queued.docx",      "status": "pending" }     // "Queued"
{ "id": "d", "name": "manifest.csv",     "status": "error",
  "error": "Rejected by the server: column 'hs_code' is missing" }`,
        render: () => uc(LIFECYCLE, {}, true),
      },
      {
        title: "3. Actions are presence-gated",
        codeTitle: "No listener, no button",
        codeDescription:
          "The callbacks are events, and the element only wires one once someone is listening — so addEventListener('zen-remove') is what adds the delete button, and an element nobody listens to draws none. That is the same rule as the other bindings' onRemove / onRename / onRetry, expressed the way HTML expresses callbacks. Rename's detail is the pair [item, name], because a CustomEvent carries one payload; remove and retry carry the item. Rename commits on Enter or blur and cancels on Escape.",
        code: `const el = document.querySelector("zen-upload-collection");

el.addEventListener("zen-remove", (e) => remove(e.detail.id));
el.addEventListener("zen-retry",  (e) => upload(e.detail));
el.addEventListener("zen-rename", (e) => {
  const [item, name] = e.detail;   // name is already trimmed
  rename(item.id, name);
});

el.items = next;   // your state layer pushes the new array back`,
        render: () => gated(),
      },
      {
        title: "4. Paired with <zen-file-upload>",
        codeTitle: "Two elements, because they answer to different owners",
        codeDescription:
          "The drop zone is a control the user operates; the list is state your transport writes. Files can appear in the list from a previous session, and a file the user just picked can sit here failing for minutes. Set the uploader's showFileList PROPERTY to false — not an attribute, since it defaults to true and an absent boolean attribute would read as false — so it does not draw its own summary beside this one. Pick some files below — remove and rename are live.",
        code: `<zen-file-upload multiple></zen-file-upload>
<zen-upload-collection></zen-upload-collection>

<script>
  upload.showFileList = false;   // a property: it defaults to true
  upload.addEventListener("zen-value-change", (e) => {
    list.items = e.detail.map(toItem);
  });
</script>`,
        render: () => wired(),
      },
      {
        title: "5. Thumbnails",
        codeTitle: "For a gallery, where the name is not what identifies the file",
        codeDescription:
          "An item with a thumbnail shows it in place of the file icon. The image is decorative — alt is empty — because the file's name sits right beside it and alt text would be the same words read twice.",
        code: `{ "id": "1", "name": "hero-shot.jpg", "size": 2411724, "thumbnail": "/thumbs/1.jpg" }`,
        render: () => uc(THUMBS, {}, true),
      },
      {
        title: "6. Empty",
        codeTitle: "empty-message",
        codeDescription:
          "An empty collection renders the message rather than an empty bordered box, which reads as a component that failed to load rather than a folder with nothing in it.",
        code: `<zen-upload-collection items="[]" empty-message="No attachments on this order">
</zen-upload-collection>`,
        render: () => uc([], { "empty-message": "No attachments on this order" }, true),
      },
    ],
  });
}
