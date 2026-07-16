import { cn } from "../../lib/cn";
import {
  applyProps,
  Disposer,
  toNodes,
  type BaseProps,
  type Child,
  type ZenComponent,
} from "../../lib/component";
import { controllable } from "../../lib/state";
import { Button } from "../button/button";

/**
 * FileUpload — drag-and-drop zone wrapping a native <input type="file">.
 *
 *   const upload = FileUpload({
 *     accept: "image/*,.pdf",
 *     multiple: true,
 *     maxSize: 5 * 1024 * 1024,          // 5 MB
 *     onValueChange: (files) => { … },
 *     onError: (errors) => toast({ … }),
 *   });
 *   form.append(upload.el);
 *
 * A faithful port of the React reference: no external dep, the underlying
 * <input> stays in the DOM so it participates in native form submission
 * (`name` prop) and a11y is announced correctly. Validation is opt-in —
 * `accept` and `maxSize` reject files before they reach `value`, and rejected
 * files are reported through `onError(rejections)`.
 *
 * State follows the React contract via `controllable()`: controlled when
 * `value` is present, uncontrolled otherwise, `onValueChange` fires either way.
 * There is no render loop — the file list is a targeted rebuild on change, the
 * drag-over highlight a class toggle.
 */

export interface FileRejection {
  file: File;
  /** "size" | "type" | "max-files" */
  reason: "size" | "type" | "max-files";
  message: string;
}

export interface FileUploadProps extends BaseProps {
  /** Selected files (controlled). */
  value?: File[];
  defaultValue?: File[];
  onValueChange?: (files: File[]) => void;
  /** Fires for each batch of rejected files (size / type / count). */
  onError?: (rejections: FileRejection[]) => void;
  /** Max bytes per file. */
  maxSize?: number;
  /** Max total file count. Defaults to 1 unless `multiple` is true. */
  maxFiles?: number;
  multiple?: boolean;
  disabled?: boolean;
  /** Replace the default "Click to upload / drag and drop" copy. */
  label?: Child;
  helperText?: Child;
  /** Show the selected file list inline. Default true. */
  showFileList?: boolean;
  accept?: string;
  /** Native input name, for form submission. */
  name?: string;
}

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

const matchesAccept = (file: File, accept: string | undefined): boolean => {
  if (!accept) return true;
  const tokens = accept
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return tokens.some((token) => {
    if (token.startsWith(".")) {
      return file.name.toLowerCase().endsWith(token.toLowerCase());
    }
    if (token.endsWith("/*")) {
      const prefix = token.slice(0, -1); // "image/"
      return file.type.startsWith(prefix);
    }
    return file.type === token;
  });
};

// Our own trusted SVG markup, never a caller's string — see PORTING.md.
const svg = (markup: string): SVGSVGElement => {
  const t = document.createElement("template");
  t.innerHTML = markup;
  return t.content.firstChild as SVGSVGElement;
};

const uploadIcon = () =>
  svg(
    `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="zen-text-zen-muted-fg"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>`,
  );

const fileIcon = () =>
  svg(
    `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="zen-text-zen-muted-fg zen-shrink-0"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`,
  );

const xIcon = () =>
  svg(
    `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  );

const equalsFiles = (a: File[], b: File[]) =>
  a.length === b.length && a.every((f, i) => f === b[i]);

/** Prop keys this component interprets — everything else lands on the <input>. */
const OWN_KEYS = new Set<string>([
  "value",
  "defaultValue",
  "onValueChange",
  "onError",
  "maxSize",
  "maxFiles",
  "multiple",
  "disabled",
  "label",
  "helperText",
  "showFileList",
  "accept",
  "class",
  "style",
  "children",
]);

export function FileUpload(props: FileUploadProps = {}): ZenComponent<FileUploadProps> {
  let current: FileUploadProps = { ...props };
  const disposer = new Disposer();

  const effectiveMax = () =>
    current.maxFiles ?? (current.multiple ? Infinity : 1);

  const state = controllable<File[]>({
    value: current.value,
    defaultValue: current.defaultValue ?? [],
    onChange: (v) => current.onValueChange?.(v),
    equals: equalsFiles,
  });

  let isOver = false;

  // --- DOM, built once ---------------------------------------------------
  const root = document.createElement("div");

  const dropzone = document.createElement("div");
  dropzone.setAttribute("role", "button");

  const iconSlot = uploadIcon();

  const labelEl = document.createElement("div");
  labelEl.className = "zen-text-sm";

  const helperEl = document.createElement("div");
  helperEl.className = "zen-text-xs zen-text-zen-muted-fg";

  const input = document.createElement("input");
  input.type = "file";
  input.className = "zen-sr-only";

  const list = document.createElement("ul");
  list.className = "zen-flex zen-flex-col zen-gap-1 zen-text-sm";

  dropzone.append(iconSlot, labelEl, helperEl, input);
  root.append(dropzone, list);

  // --- targeted writes ----------------------------------------------------
  const dropzoneClass = () =>
    cn(
      "zen-rounded-zen-md zen-border-2 zen-border-dashed zen-p-6 zen-text-center zen-transition-colors zen-cursor-pointer",
      "zen-flex zen-flex-col zen-items-center zen-justify-center zen-gap-2",
      isOver
        ? "zen-border-zen-primary zen-bg-zen-primary-soft"
        : "zen-border-zen-border zen-bg-zen-muted/30",
      "hover:zen-bg-zen-muted/60",
      current.disabled && "zen-opacity-50 zen-cursor-not-allowed zen-pointer-events-none",
      "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
    );

  const defaultLabel = (): Node => {
    const frag = document.createDocumentFragment();
    const strong = document.createElement("span");
    strong.className = "zen-font-medium";
    strong.textContent = "Click to upload";
    const rest = document.createElement("span");
    rest.className = "zen-text-zen-muted-fg";
    rest.textContent = " or drag and drop";
    frag.append(strong, rest);
    return frag;
  };

  let removeInputProps: (() => void) | undefined;

  const renderChrome = () => {
    root.className = cn("zen-flex zen-flex-col zen-gap-2", current.class);
    if (current.style) applyProps(root, { style: current.style });
    if (current.id) root.id = current.id;

    dropzone.className = dropzoneClass();
    dropzone.tabIndex = current.disabled ? -1 : 0;
    if (current.disabled) dropzone.setAttribute("aria-disabled", "true");
    else dropzone.removeAttribute("aria-disabled");

    // Label — the caller's node, or the default two-span copy.
    labelEl.replaceChildren(
      ...(current.label !== undefined && current.label !== null
        ? toNodes(current.label)
        : [defaultLabel()]),
    );

    // Helper — explicit helperText wins; else a maxSize summary; else nothing.
    if (current.helperText !== undefined && current.helperText !== null) {
      helperEl.replaceChildren(...toNodes(current.helperText));
      helperEl.style.display = "";
    } else if (typeof current.maxSize === "number") {
      const max = effectiveMax();
      const suffix =
        current.multiple && max !== Infinity ? ` · up to ${max} files` : "";
      helperEl.textContent = `Max ${formatBytes(current.maxSize)} per file${suffix}`;
      helperEl.style.display = "";
    } else {
      helperEl.replaceChildren();
      helperEl.style.display = "none";
    }

    // Native input attributes + any leftover forwarded props.
    if (current.accept) input.setAttribute("accept", current.accept);
    else input.removeAttribute("accept");
    input.multiple = !!current.multiple;
    input.disabled = !!current.disabled;

    const rest: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(current)) {
      if (!OWN_KEYS.has(k) && k !== "id") rest[k] = v;
    }
    removeInputProps?.();
    removeInputProps = applyProps(input, rest);
  };

  const renderList = () => {
    const files = state.get();
    if (current.showFileList === false || files.length === 0) {
      list.replaceChildren();
      list.style.display = "none";
      return;
    }
    list.style.display = "";
    list.replaceChildren(
      ...files.map((file, idx) => {
        const li = document.createElement("li");
        li.className =
          "zen-flex zen-items-center zen-gap-3 zen-rounded-zen-sm zen-border zen-border-zen-border zen-bg-zen-background zen-px-3 zen-py-2";

        const meta = document.createElement("div");
        meta.className = "zen-flex zen-flex-col zen-min-w-0 zen-flex-1";
        const nameEl = document.createElement("span");
        nameEl.className = "zen-truncate zen-font-medium";
        nameEl.textContent = file.name;
        const sizeEl = document.createElement("span");
        sizeEl.className = "zen-text-xs zen-text-zen-muted-fg";
        sizeEl.textContent = formatBytes(file.size);
        meta.append(nameEl, sizeEl);

        const remove = Button({
          variant: "ghost",
          color: "neutral",
          size: "sm",
          disabled: current.disabled,
          "aria-label": `Remove ${file.name}`,
          children: xIcon(),
          onClick: (e: MouseEvent) => {
            e.stopPropagation();
            removeFile(idx);
          },
        });

        li.append(fileIcon(), meta, remove.el);
        return li;
      }),
    );
  };

  // --- behaviour ----------------------------------------------------------
  const validateAndSet = (next: FileList | File[]) => {
    const arr = Array.from(next);
    const rejected: FileRejection[] = [];
    const accepted: File[] = [];

    for (const f of arr) {
      if (typeof current.maxSize === "number" && f.size > current.maxSize) {
        rejected.push({
          file: f,
          reason: "size",
          message: `"${f.name}" exceeds ${formatBytes(current.maxSize)}`,
        });
        continue;
      }
      if (!matchesAccept(f, current.accept)) {
        rejected.push({
          file: f,
          reason: "type",
          message: `"${f.name}" is not an accepted file type`,
        });
        continue;
      }
      accepted.push(f);
    }

    const max = effectiveMax();
    // Combine with existing if multiple; else replace.
    let nextFiles = current.multiple
      ? [...state.get(), ...accepted]
      : accepted.slice(0, 1);
    if (nextFiles.length > max) {
      const overflow = nextFiles.slice(max);
      overflow.forEach((f) =>
        rejected.push({
          file: f,
          reason: "max-files",
          message: `Maximum ${max} file(s); "${f.name}" dropped`,
        }),
      );
      nextFiles = nextFiles.slice(0, max);
    }

    if (rejected.length > 0) current.onError?.(rejected);
    state.set(nextFiles);
  };

  const removeFile = (idx: number) => {
    state.set(state.get().filter((_, i) => i !== idx));
  };

  // --- listeners ----------------------------------------------------------
  const onDragOver = (e: DragEvent) => {
    e.preventDefault();
    if (!current.disabled && !isOver) {
      isOver = true;
      dropzone.className = dropzoneClass();
    }
  };
  const onDragLeave = () => {
    if (isOver) {
      isOver = false;
      dropzone.className = dropzoneClass();
    }
  };
  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    isOver = false;
    dropzone.className = dropzoneClass();
    if (current.disabled) return;
    if (e.dataTransfer?.files?.length) validateAndSet(e.dataTransfer.files);
  };
  const onClick = () => {
    if (!current.disabled) input.click();
  };
  const onKeyDown = (e: KeyboardEvent) => {
    if (current.disabled) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      input.click();
    }
  };
  const onInputChange = () => {
    if (input.files?.length) validateAndSet(input.files);
    // reset so the same file can be re-selected after removal
    input.value = "";
  };

  dropzone.addEventListener("dragover", onDragOver);
  dropzone.addEventListener("dragleave", onDragLeave);
  dropzone.addEventListener("drop", onDrop);
  dropzone.addEventListener("click", onClick);
  dropzone.addEventListener("keydown", onKeyDown);
  input.addEventListener("change", onInputChange);
  disposer.add(() => dropzone.removeEventListener("dragover", onDragOver));
  disposer.add(() => dropzone.removeEventListener("dragleave", onDragLeave));
  disposer.add(() => dropzone.removeEventListener("drop", onDrop));
  disposer.add(() => dropzone.removeEventListener("click", onClick));
  disposer.add(() => dropzone.removeEventListener("keydown", onKeyDown));
  disposer.add(() => input.removeEventListener("change", onInputChange));
  disposer.add(() => removeInputProps?.());
  disposer.add(state.subscribe(() => renderList()));

  renderChrome();
  renderList();

  return {
    el: root,
    update(next) {
      current = { ...current, ...next };
      if ("value" in next) state.sync(next.value);
      renderChrome();
      renderList();
    },
    destroy() {
      disposer.dispose();
      root.remove();
    },
  };
}
