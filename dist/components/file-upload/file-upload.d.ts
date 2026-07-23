import { type JSX } from "solid-js";
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
export declare const FileUpload: (props: FileUploadProps) => JSX.Element;
//# sourceMappingURL=file-upload.d.ts.map