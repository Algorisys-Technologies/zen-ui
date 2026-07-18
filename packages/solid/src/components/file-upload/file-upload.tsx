import { type JSX, createMemo, createSignal, For, Show } from "solid-js";
import { cn } from "../../lib/cn";
import { Button } from "../button/button";

/**
 * FileUpload — drag-and-drop zone wrapping a native <input type="file">.
 *
 *   <FileUpload
 *     accept="image/*,.pdf"
 *     multiple
 *     maxSize={5 * 1024 * 1024}
 *     value={files()}
 *     onValueChange={setFiles}
 *     onError={(errors) => toast.error(errors[0].message)}
 *   />
 *
 * No external dep. The underlying <input> stays in the DOM so it
 * participates in native form submission (`name` prop) and a11y. Reports
 * rejected files via `onError(rejections)`.
 */

export interface FileRejection {
  file: File;
  reason: "size" | "type" | "max-files";
  message: string;
}

export type FileUploadProps = {
  value?: File[];
  defaultValue?: File[];
  onValueChange?: (files: File[]) => void;
  onError?: (rejections: FileRejection[]) => void;
  maxSize?: number;
  maxFiles?: number;
  multiple?: boolean;
  disabled?: boolean;
  accept?: string;
  name?: string;
  label?: JSX.Element;
  helperText?: JSX.Element;
  showFileList?: boolean;
  class?: string;
};

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

const matchesAccept = (file: File, accept: string | undefined): boolean => {
  if (!accept) return true;
  const tokens = accept.split(",").map((s) => s.trim()).filter(Boolean);
  return tokens.some((token) => {
    if (token.startsWith(".")) return file.name.toLowerCase().endsWith(token.toLowerCase());
    if (token.endsWith("/*")) return file.type.startsWith(token.slice(0, -1));
    return file.type === token;
  });
};

export const FileUpload = (props: FileUploadProps) => {
  const isControlled = () => props.value !== undefined;
  const [inner, setInner] = createSignal<File[]>(props.defaultValue ?? []);
  const files = createMemo<File[]>(() => (isControlled() ? (props.value as File[]) : inner()));
  let inputRef: HTMLInputElement | undefined;
  const [isOver, setIsOver] = createSignal(false);
  const effectiveMax = () => props.maxFiles ?? (props.multiple ? Infinity : 1);
  const showFileList = () => props.showFileList ?? true;

  const validateAndSet = (next: FileList | File[]) => {
    const arr = Array.from(next);
    const rejected: FileRejection[] = [];
    const accepted: File[] = [];

    for (const f of arr) {
      if (typeof props.maxSize === "number" && f.size > props.maxSize) {
        rejected.push({ file: f, reason: "size", message: `"${f.name}" exceeds ${formatBytes(props.maxSize)}` });
        continue;
      }
      if (!matchesAccept(f, props.accept)) {
        rejected.push({ file: f, reason: "type", message: `"${f.name}" is not an accepted file type` });
        continue;
      }
      accepted.push(f);
    }

    let nextFiles = props.multiple ? [...files(), ...accepted] : accepted.slice(0, 1);
    const max = effectiveMax();
    if (nextFiles.length > max) {
      const overflow = nextFiles.slice(max);
      overflow.forEach((f) =>
        rejected.push({ file: f, reason: "max-files", message: `Maximum ${max} file(s); "${f.name}" dropped` }),
      );
      nextFiles = nextFiles.slice(0, max);
    }

    if (rejected.length > 0) props.onError?.(rejected);
    if (!isControlled()) setInner(nextFiles);
    props.onValueChange?.(nextFiles);
  };

  const removeFile = (idx: number) => {
    const next = files().filter((_, i) => i !== idx);
    if (!isControlled()) setInner(next);
    props.onValueChange?.(next);
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsOver(false);
    if (props.disabled) return;
    if (e.dataTransfer?.files?.length) validateAndSet(e.dataTransfer.files);
  };

  return (
    <div class={cn("zen-flex zen-flex-col zen-gap-2", props.class)}>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!props.disabled) setIsOver(true);
        }}
        onDragLeave={() => setIsOver(false)}
        onDrop={onDrop}
        onClick={() => !props.disabled && inputRef?.click()}
        role="button"
        tabIndex={props.disabled ? -1 : 0}
        aria-disabled={props.disabled || undefined}
        onKeyDown={(e) => {
          if (props.disabled) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef?.click();
          }
        }}
        class={cn(
          "zen-rounded-zen-md zen-border-2 zen-border-dashed zen-p-6 zen-text-center zen-transition-colors zen-cursor-pointer",
          "zen-flex zen-flex-col zen-items-center zen-justify-center zen-gap-2",
          isOver()
            ? "zen-border-zen-primary zen-bg-zen-primary-soft"
            : "zen-border-zen-border zen-bg-zen-muted/30",
          "hover:zen-bg-zen-muted/60",
          props.disabled && "zen-opacity-50 zen-cursor-not-allowed zen-pointer-events-none",
          "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
        )}
      >
        <UploadIcon />
        <div class="zen-text-sm">
          {props.label ?? (
            <>
              <span class="zen-font-medium">Click to upload</span>{" "}
              <span class="zen-text-zen-muted-fg">or drag and drop</span>
            </>
          )}
        </div>
        <Show
          when={props.helperText}
          fallback={
            <Show when={props.maxSize}>
              <div class="zen-text-xs zen-text-zen-muted-fg">
                Max {formatBytes(props.maxSize as number)} per file
                {props.multiple && effectiveMax() !== Infinity
                  ? ` · up to ${effectiveMax()} files`
                  : ""}
              </div>
            </Show>
          }
        >
          <div class="zen-text-xs zen-text-zen-muted-fg">{props.helperText}</div>
        </Show>
        <input
          ref={inputRef}
          type="file"
          accept={props.accept}
          multiple={props.multiple}
          disabled={props.disabled}
          name={props.name}
          onChange={(e) => {
            if (e.currentTarget.files?.length) {
              validateAndSet(e.currentTarget.files);
            }
            e.currentTarget.value = "";
          }}
          class="zen-sr-only"
        />
      </div>

      <Show when={showFileList() && files().length > 0}>
        <ul class="zen-flex zen-flex-col zen-gap-1 zen-text-sm">
          <For each={files()}>
            {(file, idx) => (
              <li class="zen-flex zen-items-center zen-gap-3 zen-rounded-zen-sm zen-border zen-border-zen-border zen-bg-zen-background zen-px-3 zen-py-2">
                <FileIcon />
                <div class="zen-flex zen-flex-col zen-min-w-0 zen-flex-1">
                  <span class="zen-truncate zen-font-medium">{file.name}</span>
                  <span class="zen-text-xs zen-text-zen-muted-fg">{formatBytes(file.size)}</span>
                </div>
                <Button
                  variant="ghost"
                  color="neutral"
                  size="sm"
                  aria-label={`Remove ${file.name}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(idx());
                  }}
                  disabled={props.disabled}
                >
                  <XIcon />
                </Button>
              </li>
            )}
          </For>
        </ul>
      </Show>
    </div>
  );
};

const UploadIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden class="zen-text-zen-muted-fg">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);
const FileIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden class="zen-text-zen-muted-fg zen-shrink-0">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);
const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
