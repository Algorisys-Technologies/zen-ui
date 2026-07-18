import { createSignal } from "solid-js";
import { FileUpload, type FileRejection } from "./file-upload/file-upload";
import { toast } from "./toast/toaster";
import { Toaster } from "./toast/toaster";
import { DemoPage, DemoSection } from "./demo-helpers";

const NewFileUploadDemo = () => {
  const [files, setFiles] = createSignal<File[]>([]);
  return (
    <DemoPage
      title="FileUpload"
      description="Drag-and-drop zone wrapping a native <input type=file>. Reports rejections via onError."
    >
      <Toaster />
      <DemoSection
        title="Images + PDFs, multiple, max 5 MB"
        codeTitle="accept + multiple + maxSize, rejections surfaced as toasts"
        codeDescription="Files failing the size or MIME check never reach onValueChange — they arrive in onError as FileRejection[] with a ready-made message. Render <Toaster /> once near your app root."
        code={`const [files, setFiles] = createSignal<File[]>([]);

<FileUpload
  accept="image/*,.pdf"
  multiple
  maxSize={5 * 1024 * 1024}   /* 5 MB */
  value={files()}
  onValueChange={setFiles}
  onError={(rs: FileRejection[]) =>
    rs.forEach((r) => toast.error(r.message))
  }
/>`}
      >
        <div class="zen-w-full zen-max-w-md">
          <FileUpload
            accept="image/*,.pdf"
            multiple
            maxSize={5 * 1024 * 1024}
            value={files()}
            onValueChange={setFiles}
            onError={(rs: FileRejection[]) =>
              rs.forEach((r) => toast.error(r.message))
            }
          />
        </div>
      </DemoSection>
    </DemoPage>
  );
};

export default NewFileUploadDemo;
