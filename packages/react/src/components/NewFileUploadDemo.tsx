import { useState } from "react";
import { FileUpload } from "./file-upload/file-upload";
import { toast } from "./toast/use-toast";
import { CodeExample } from "./demo-helpers";

const NewFileUploadDemo: React.FC = () => {
  const [single, setSingle] = useState<File[]>([]);
  const [many, setMany] = useState<File[]>([]);

  return (
    <div className="demo-page">
      <h1>FileUpload (new — shadcn-style)</h1>
      <p className="lede">
        Drag-and-drop zone around a native <code>&lt;input type="file"&gt;</code>.
        No external dep. Built-in size + MIME validation, file list with
        remove buttons, full keyboard a11y, form-submission friendly.
      </p>

      <section className="demo-section">
        <h2>1. Single file</h2>
        <CodeExample
          title="Default — replaces on each new selection"
          code={`const [files, setFiles] = useState<File[]>([]);

<FileUpload
  value={files}
  onValueChange={setFiles}
  accept="image/*,.pdf"
  maxSize={5 * 1024 * 1024}     /* 5 MB */
  onError={(rejs) =>
    toast({ variant: "destructive", title: rejs[0].message })
  }
/>`}
        >
          <div style={{ width: "100%", maxWidth: 480 }}>
            <FileUpload
              value={single}
              onValueChange={setSingle}
              accept="image/*,.pdf"
              maxSize={5 * 1024 * 1024}
              onError={(rejs) =>
                toast({
                  variant: "destructive",
                  title: "File rejected",
                  description: rejs[0].message,
                })
              }
            />
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>2. Multiple files</h2>
        <CodeExample
          title="multiple + maxFiles"
          code={`<FileUpload
  multiple
  maxFiles={5}
  value={files}
  onValueChange={setFiles}
  accept=".png,.jpg,.jpeg,.pdf"
  maxSize={10 * 1024 * 1024}
/>`}
        >
          <div style={{ width: "100%", maxWidth: 480 }}>
            <FileUpload
              multiple
              maxFiles={5}
              value={many}
              onValueChange={setMany}
              accept=".png,.jpg,.jpeg,.pdf"
              maxSize={10 * 1024 * 1024}
              onError={(rejs) =>
                rejs.forEach((r) =>
                  toast({
                    variant: "warning",
                    title: "File rejected",
                    description: r.message,
                  }),
                )
              }
            />
            <div style={{ marginTop: 8, fontSize: "0.8125rem", color: "var(--zen-color-muted-fg)" }}>
              {many.length} file(s) selected
            </div>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>3. Custom label + helper</h2>
        <CodeExample
          title="label + helperText override the defaults"
          code={`<FileUpload
  label={<>Drop your ID here, or <span className="text-zen-primary underline">browse</span></>}
  helperText="JPG / PNG / PDF · up to 10 MB"
  accept=".jpg,.png,.pdf"
  maxSize={10 * 1024 * 1024}
/>`}
        >
          <div style={{ width: "100%", maxWidth: 480 }}>
            <FileUpload
              label={
                <>
                  Drop your ID here, or{" "}
                  <span style={{ color: "var(--zen-color-primary)", textDecoration: "underline" }}>
                    browse
                  </span>
                </>
              }
              helperText="JPG / PNG / PDF · up to 10 MB"
              accept=".jpg,.png,.pdf"
              maxSize={10 * 1024 * 1024}
            />
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>4. Disabled</h2>
        <CodeExample
          title="disabled prop blocks click + drag"
          code={`<FileUpload disabled />`}
        >
          <div style={{ width: "100%", maxWidth: 480 }}>
            <FileUpload disabled helperText="Upload paused — verify your email first" />
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>5. Hidden file list</h2>
        <CodeExample
          title="showFileList={false} — render the list yourself"
          description={`Useful when the surrounding layout shows the file list elsewhere (e.g., a preview grid).`}
          code={`const [files, setFiles] = useState<File[]>([]);

<FileUpload multiple showFileList={false} value={files} onValueChange={setFiles} />
<MyOwnFileGrid files={files} />`}
        >
          <div style={{ width: "100%", maxWidth: 480 }}>
            <FileUpload multiple showFileList={false} />
          </div>
        </CodeExample>
      </section>
    </div>
  );
};

export default NewFileUploadDemo;
