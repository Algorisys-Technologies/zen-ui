import { FileUpload } from "./file-upload/file-upload";
import { DemoPage } from "./demo-helpers";

/**
 * FileUploadDemo — the vanilla mirror of React's NewFileUploadDemo. Same five
 * sections, same copy. React's demo wires `onError` to a toast; vanilla has no
 * toast component, so each section surfaces the first rejection message inline
 * beneath the zone — the behaviour under test (validation firing) is identical.
 */

/** A width-capped wrapper, matching React's `maxWidth: 480` demo shell. */
function shell(...children: Node[]): HTMLElement {
  const box = document.createElement("div");
  box.style.width = "100%";
  box.style.maxWidth = "480px";
  box.append(...children);
  return box;
}

function status(): HTMLElement {
  const el = document.createElement("div");
  el.style.marginTop = "8px";
  el.style.fontSize = "0.8125rem";
  el.style.color = "var(--zen-color-muted-fg)";
  return el;
}

export default function FileUploadDemo(): HTMLElement {
  return DemoPage({
    title: "FileUpload",
    description:
      "Drag-and-drop zone around a native <input type=\"file\">. No external dep. Built-in size + MIME validation, file list with remove buttons, full keyboard a11y, form-submission friendly.",
    sections: [
      {
        title: "1. Single file",
        codeTitle: "Default — replaces on each new selection",
        code: `let files: File[] = [];

const upload = FileUpload({
  value: files,
  onValueChange: (next) => { files = next; upload.update({ value: files }); },
  accept: "image/*,.pdf",
  maxSize: 5 * 1024 * 1024,     /* 5 MB */
  onError: (rejs) => showToast({ variant: "destructive", title: rejs[0].message }),
});`,
        render: () => {
          const note = status();
          let files: File[] = [];
          const upload = FileUpload({
            value: files,
            onValueChange: (next) => {
              files = next;
              upload.update({ value: files });
              note.textContent = "";
            },
            accept: "image/*,.pdf",
            maxSize: 5 * 1024 * 1024,
            onError: (rejs) => {
              note.textContent = `Rejected — ${rejs[0].message}`;
            },
          });
          return shell(upload.el, note);
        },
      },
      {
        title: "2. Multiple files",
        codeTitle: "multiple + maxFiles",
        code: `let files: File[] = [];

const upload = FileUpload({
  multiple: true,
  maxFiles: 5,
  value: files,
  onValueChange: (next) => { files = next; upload.update({ value: files }); },
  accept: ".png,.jpg,.jpeg,.pdf",
  maxSize: 10 * 1024 * 1024,
});`,
        render: () => {
          const count = status();
          let files: File[] = [];
          const setCount = () => {
            count.textContent = `${files.length} file(s) selected`;
          };
          const upload = FileUpload({
            multiple: true,
            maxFiles: 5,
            value: files,
            onValueChange: (next) => {
              files = next;
              upload.update({ value: files });
              setCount();
            },
            accept: ".png,.jpg,.jpeg,.pdf",
            maxSize: 10 * 1024 * 1024,
          });
          setCount();
          return shell(upload.el, count);
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

FileUpload({
  label,
  helperText: "JPG / PNG / PDF · up to 10 MB",
  accept: ".jpg,.png,.pdf",
  maxSize: 10 * 1024 * 1024,
});`,
        render: () => {
          const label = document.createDocumentFragment();
          label.append("Drop your ID here, or ");
          const browse = document.createElement("span");
          browse.className = "zen-text-zen-primary zen-underline";
          browse.textContent = "browse";
          label.append(browse);
          const upload = FileUpload({
            label,
            helperText: "JPG / PNG / PDF · up to 10 MB",
            accept: ".jpg,.png,.pdf",
            maxSize: 10 * 1024 * 1024,
          });
          return shell(upload.el);
        },
      },
      {
        title: "4. Disabled",
        codeTitle: "disabled prop blocks click + drag",
        code: `FileUpload({ disabled: true, helperText: "Upload paused — verify your email first" });`,
        render: () =>
          shell(
            FileUpload({
              disabled: true,
              helperText: "Upload paused — verify your email first",
            }).el,
          ),
      },
      {
        title: "5. Hidden file list",
        codeTitle: "showFileList: false — render the list yourself",
        codeDescription:
          "Useful when the surrounding layout shows the file list elsewhere (e.g., a preview grid).",
        code: `let files: File[] = [];

const upload = FileUpload({
  multiple: true,
  showFileList: false,
  value: files,
  onValueChange: (next) => { files = next; renderMyOwnFileGrid(next); },
});`,
        render: () =>
          shell(FileUpload({ multiple: true, showFileList: false }).el),
      },
    ],
  });
}
