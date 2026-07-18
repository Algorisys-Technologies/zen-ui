import { DemoPage } from "./demo-helpers";

/**
 * FileUpload demo — the web-components mirror of the vanilla FileUploadDemo. Renders
 * <zen-file-upload>; `value` (File[]), `label`, `helperText` and `showFileList` are
 * JS properties. zen-value-change carries the File[]; zen-error carries the
 * rejections. Each section surfaces the first rejection message inline.
 */

function el(tag: string, attrs: Record<string, string> = {}): HTMLElement {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  return n;
}

const setProp = (node: HTMLElement, name: string, value: unknown): void => {
  (node as unknown as Record<string, unknown>)[name] = value;
};

/** A width-capped wrapper, matching the vanilla `maxWidth: 480` shell. */
function shell(...children: Node[]): HTMLElement {
  const box = document.createElement("div");
  box.style.width = "100%";
  box.style.maxWidth = "480px";
  box.append(...children);
  return box;
}

function status(): HTMLElement {
  const s = document.createElement("div");
  s.style.marginTop = "8px";
  s.style.fontSize = "0.8125rem";
  s.style.color = "var(--zen-color-muted-fg)";
  return s;
}

type Rejection = { message: string };

export default function FileUploadDemo(): HTMLElement {
  return DemoPage({
    title: "FileUpload",
    description:
      "Drag-and-drop zone around a native <input type=\"file\">. No external dep. Built-in size + MIME validation, file list with remove buttons, full keyboard a11y, form-submission friendly.",
    sections: [
      {
        title: "1. Single file",
        codeTitle: "Default — replaces on each new selection",
        code: `const upload = document.createElement("zen-file-upload");
upload.setAttribute("accept", "image/*,.pdf");
upload.setAttribute("max-size", String(5 * 1024 * 1024));  // 5 MB
upload.addEventListener("zen-value-change", (e) => { upload.value = e.detail; });
upload.addEventListener("zen-error", (e) => showToast(e.detail[0].message));`,
        render: () => {
          const note = status();
          const upload = el("zen-file-upload", {
            accept: "image/*,.pdf",
            "max-size": String(5 * 1024 * 1024),
          });
          setProp(upload, "value", []);
          upload.addEventListener("zen-value-change", (e) => {
            setProp(upload, "value", (e as CustomEvent<File[]>).detail);
            note.textContent = "";
          });
          upload.addEventListener("zen-error", (e) => {
            const rejs = (e as CustomEvent<Rejection[]>).detail;
            note.textContent = `Rejected — ${rejs[0].message}`;
          });
          return shell(upload, note);
        },
      },
      {
        title: "2. Multiple files",
        codeTitle: "multiple + max-files",
        code: `<zen-file-upload multiple max-files="5" accept=".png,.jpg,.jpeg,.pdf"></zen-file-upload>

upload.addEventListener("zen-value-change", (e) => { upload.value = e.detail; });`,
        render: () => {
          const count = status();
          let files: File[] = [];
          const setCount = () => {
            count.textContent = `${files.length} file(s) selected`;
          };
          const upload = el("zen-file-upload", {
            multiple: "",
            "max-files": "5",
            accept: ".png,.jpg,.jpeg,.pdf",
            "max-size": String(10 * 1024 * 1024),
          });
          setProp(upload, "value", files);
          upload.addEventListener("zen-value-change", (e) => {
            files = (e as CustomEvent<File[]>).detail;
            setProp(upload, "value", files);
            setCount();
          });
          setCount();
          return shell(upload, count);
        },
      },
      {
        title: "3. Custom label + helper",
        codeTitle: "label + helperText override the defaults",
        code: `const label = document.createDocumentFragment();
label.append("Drop your ID here, or ");
const browse = document.createElement("span");
browse.className = "zen-text-zen-primary zen-underline";
browse.textContent = "browse";
label.append(browse);

upload.label = label;
upload.helperText = "JPG / PNG / PDF · up to 10 MB";`,
        render: () => {
          const label = document.createDocumentFragment();
          label.append("Drop your ID here, or ");
          const browse = document.createElement("span");
          browse.className = "zen-text-zen-primary zen-underline";
          browse.textContent = "browse";
          label.append(browse);
          const upload = el("zen-file-upload", {
            accept: ".jpg,.png,.pdf",
            "max-size": String(10 * 1024 * 1024),
          });
          setProp(upload, "label", label);
          setProp(upload, "helperText", "JPG / PNG / PDF · up to 10 MB");
          return shell(upload);
        },
      },
      {
        title: "4. Disabled",
        codeTitle: "disabled prop blocks click + drag",
        code: `<zen-file-upload disabled></zen-file-upload>

upload.helperText = "Upload paused — verify your email first";`,
        render: () => {
          const upload = el("zen-file-upload", { disabled: "" });
          setProp(upload, "helperText", "Upload paused — verify your email first");
          return shell(upload);
        },
      },
      {
        title: "5. Hidden file list",
        codeTitle: "showFileList: false — render the list yourself",
        codeDescription:
          "Useful when the surrounding layout shows the file list elsewhere (e.g., a preview grid).",
        code: `const upload = document.createElement("zen-file-upload");
upload.setAttribute("multiple", "");
upload.showFileList = false;
upload.addEventListener("zen-value-change", (e) => renderMyOwnFileGrid(e.detail));`,
        render: () => {
          const upload = el("zen-file-upload", { multiple: "" });
          setProp(upload, "showFileList", false);
          return shell(upload);
        },
      },
    ],
  });
}
