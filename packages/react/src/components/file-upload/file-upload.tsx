import * as React from "react";
import { cn } from "../../lib/cn";
import { Button } from "../button/button";

/**
 * FileUpload — drag-and-drop zone wrapping a native <input type="file">.
 *
 *   <FileUpload
 *     accept="image/*,.pdf"
 *     multiple
 *     maxSize={5 * 1024 * 1024}                  // 5 MB
 *     value={files}
 *     onValueChange={setFiles}
 *     onError={(errors) => toast({ variant: "destructive", ... })}
 *   />
 *
 * No external dep. Keeps the underlying <input> in the DOM so it
 * participates in native form submission (`name` prop) and a11y
 * is announced correctly.
 *
 * Validation is opt-in:
 *   - `accept`   forwarded to the input + checked client-side
 *   - `maxSize`  rejects oversize files before they hit `value`
 *
 * Reports rejected files via `onError(rejections)` so consumers can
 * surface a toast / inline error.
 */

export interface FileRejection {
  file: File;
  /** "size" | "type" | "max-files" */
  reason: "size" | "type" | "max-files";
  message: string;
}

export interface FileUploadProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "value" | "defaultValue" | "onChange" | "onError" | "type" | "size"
  > {
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
  /** Replace the default "Choose files / Drag & drop" copy. */
  label?: React.ReactNode;
  helperText?: React.ReactNode;
  /** Show the selected file list inline. Default true. */
  showFileList?: boolean;
  className?: string;
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

const FileUpload = React.forwardRef<HTMLInputElement, FileUploadProps>(
  (
    {
      value,
      defaultValue,
      onValueChange,
      onError,
      maxSize,
      maxFiles,
      multiple = false,
      disabled,
      label,
      helperText,
      showFileList = true,
      accept,
      className,
      ...inputProps
    },
    forwardedRef,
  ) => {
    const [internal, setInternal] = React.useState<File[]>(defaultValue ?? []);
    const isControlled = value !== undefined;
    const files = isControlled ? (value as File[]) : internal;
    const inputRef = React.useRef<HTMLInputElement>(null);
    React.useImperativeHandle(forwardedRef, () => inputRef.current!);

    const [isOver, setIsOver] = React.useState(false);
    const effectiveMax = maxFiles ?? (multiple ? Infinity : 1);

    const validateAndSet = (next: FileList | File[]) => {
      const arr = Array.from(next);
      const rejected: FileRejection[] = [];
      const accepted: File[] = [];

      for (const f of arr) {
        if (typeof maxSize === "number" && f.size > maxSize) {
          rejected.push({
            file: f,
            reason: "size",
            message: `"${f.name}" exceeds ${formatBytes(maxSize)}`,
          });
          continue;
        }
        if (!matchesAccept(f, accept)) {
          rejected.push({
            file: f,
            reason: "type",
            message: `"${f.name}" is not an accepted file type`,
          });
          continue;
        }
        accepted.push(f);
      }

      // Combine with existing if multiple; else replace
      let nextFiles = multiple ? [...files, ...accepted] : accepted.slice(0, 1);
      if (nextFiles.length > effectiveMax) {
        const overflow = nextFiles.slice(effectiveMax);
        overflow.forEach((f) =>
          rejected.push({
            file: f,
            reason: "max-files",
            message: `Maximum ${effectiveMax} file(s); "${f.name}" dropped`,
          }),
        );
        nextFiles = nextFiles.slice(0, effectiveMax);
      }

      if (rejected.length > 0) onError?.(rejected);

      if (!isControlled) setInternal(nextFiles);
      onValueChange?.(nextFiles);
    };

    const removeFile = (idx: number) => {
      const next = files.filter((_, i) => i !== idx);
      if (!isControlled) setInternal(next);
      onValueChange?.(next);
    };

    const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsOver(false);
      if (disabled) return;
      if (e.dataTransfer.files?.length) {
        validateAndSet(e.dataTransfer.files);
      }
    };

    return (
      <div className={cn("zen-flex zen-flex-col zen-gap-2", className)}>
        <div
          onDragOver={(e) => {
            e.preventDefault();
            if (!disabled) setIsOver(true);
          }}
          onDragLeave={() => setIsOver(false)}
          onDrop={onDrop}
          onClick={() => !disabled && inputRef.current?.click()}
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-disabled={disabled || undefined}
          onKeyDown={(e) => {
            if (disabled) return;
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          className={cn(
            "zen-rounded-zen-md zen-border-2 zen-border-dashed zen-p-6 zen-text-center zen-transition-colors zen-cursor-pointer",
            "zen-flex zen-flex-col zen-items-center zen-justify-center zen-gap-2",
            isOver
              ? "zen-border-zen-primary zen-bg-zen-primary-soft"
              : "zen-border-zen-border zen-bg-zen-muted/30",
            "hover:zen-bg-zen-muted/60",
            disabled && "zen-opacity-50 zen-cursor-not-allowed zen-pointer-events-none",
            "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
          )}
        >
          <UploadIcon />
          <div className="zen-text-sm">
            {label ?? (
              <>
                <span className="zen-font-medium">Click to upload</span>{" "}
                <span className="zen-text-zen-muted-fg">or drag and drop</span>
              </>
            )}
          </div>
          {helperText ? (
            <div className="zen-text-xs zen-text-zen-muted-fg">{helperText}</div>
          ) : maxSize ? (
            <div className="zen-text-xs zen-text-zen-muted-fg">
              Max {formatBytes(maxSize)} per file
              {multiple && effectiveMax !== Infinity
                ? ` · up to ${effectiveMax} files`
                : ""}
            </div>
          ) : null}
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            disabled={disabled}
            onChange={(e) => {
              if (e.target.files?.length) {
                validateAndSet(e.target.files);
              }
              // reset so the same file can be re-selected after removal
              e.target.value = "";
            }}
            className="zen-sr-only"
            {...inputProps}
          />
        </div>

        {showFileList && files.length > 0 ? (
          <ul className="zen-flex zen-flex-col zen-gap-1 zen-text-sm">
            {files.map((file, idx) => (
              <li
                key={`${file.name}-${idx}`}
                className="zen-flex zen-items-center zen-gap-3 zen-rounded-zen-sm zen-border zen-border-zen-border zen-bg-zen-background zen-px-3 zen-py-2"
              >
                <FileIcon />
                <div className="zen-flex zen-flex-col zen-min-w-0 zen-flex-1">
                  <span className="zen-truncate zen-font-medium">{file.name}</span>
                  <span className="zen-text-xs zen-text-zen-muted-fg">
                    {formatBytes(file.size)}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  color="neutral"
                  size="sm"
                  aria-label={`Remove ${file.name}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(idx);
                  }}
                  disabled={disabled}
                >
                  <XIcon />
                </Button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    );
  },
);
FileUpload.displayName = "FileUpload";

const UploadIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="zen-text-zen-muted-fg">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);
const FileIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="zen-text-zen-muted-fg zen-shrink-0">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);
const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export { FileUpload };
