import * as React from "react";
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
export interface FileUploadProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "defaultValue" | "onChange" | "onError" | "type" | "size"> {
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
declare const FileUpload: React.ForwardRefExoticComponent<FileUploadProps & React.RefAttributes<HTMLInputElement>>;
export { FileUpload };
//# sourceMappingURL=file-upload.d.ts.map