import { createSignal } from "solid-js";
import { RichText } from "../components/rich-text/rich-text";
import { DemoPage, DemoSection } from "./demo-helpers";
// Jodit renders its toolbar from its own stylesheet; without it the icons have
// no width and expand to fill the pane. The component JSDoc documents this
// requirement — the demo has to actually honour it.
import "jodit/es2021/jodit.min.css";
// KaTeX's stylesheet, for the `math` preview. Without it KaTeX's output prints
// every formula twice — once as MathML, once as unstyled spans.
import "katex/dist/katex.min.css";

const NewRichTextDemo = () => {
  const [html, setHtml] = createSignal("<p>Hello from <strong>zen-ui</strong> 👋</p>");
  const [maths, setMaths] = createSignal(
    "<p>The roots of $ax^2 + bx + c = 0$ are</p><p>$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$</p>",
  );
  const [withImage, setWithImage] = createSignal("<p>Drop or paste an image here.</p>");
  const [uploads, setUploads] = createSignal<string[]>([]);

  /* Stands in for a real upload: a blob URL is what a server would hand back as
     a CDN path. The point is what lands in the HTML — a URL, not a data URI. */
  const uploadImage = async (file: File) => {
    const url = URL.createObjectURL(file);
    setUploads((u) => [...u, `${file.name} (${file.size} bytes) → ${url}`]);
    return url;
  };

  return (
    <DemoPage
      title="RichText"
      description="WYSIWYG editor wrapping jodit (an optional peer dependency, lazy-loaded on first render). onChange fires on blur (Jodit's recommended commit point). Install jodit and import its CSS once — import 'jodit/es2021/jodit.min.css'. If Jodit is absent this degrades to a plain contentEditable surface rather than crashing."
    >
      <DemoSection
        title="1. Controlled editor"
        codeTitle="value / onChange"
        code={`const [html, setHtml] = createSignal("<p>Hello…</p>");

<RichText value={html()} onChange={setHtml} placeholder="Write something…" />`}
      >
        <div class="zen-w-full">
          <RichText value={html()} onChange={setHtml} placeholder="Write something…" />
        </div>
      </DemoSection>

      <DemoSection
        title="2. Current HTML"
        codeTitle="onChange output (updates on blur)"
        code={`// html state`}
      >
        <pre class="zen-m-0 zen-w-full zen-overflow-x-auto zen-rounded-zen-md zen-bg-zen-muted zen-p-3 zen-text-xs zen-text-zen-foreground">
          {html()}
        </pre>
      </DemoSection>

      <DemoSection
        title="3. Maths"
        codeTitle="`math`, rendered with KaTeX beneath the editor"
        codeDescription="Write $…$ inline and $$…$$ for a display equation. The editor keeps the TeX source, which is the only form that survives a round trip through storage; the rendered form is a preview underneath. katex is an optional peer dependency, loaded only when math is on — import its stylesheet once. renderMath is exported, so the question a candidate sees and the printed report render the same string the same way."
        code={`import "katex/dist/katex.min.css";

<RichText value={html()} onChange={setHtml} math />

// anywhere else the same HTML is shown
const rendered = await renderMath(html());`}
      >
        <div class="zen-w-full">
          <RichText value={maths()} onChange={setMaths} math />
        </div>
      </DemoSection>

      <DemoSection
        title="4. Image uploads"
        codeTitle="`onImageUpload`, so the HTML holds a URL"
        codeDescription="Without it a dropped or pasted image is inlined as a base64 data URI, which works and quietly puts megabytes inside the HTML you store. With it, each file goes to your handler and the URL it resolves to is what gets embedded. Uploading is yours; this demo hands back a blob URL in place of a server's."
        code={`<RichText
  value={html()}
  onChange={setHtml}
  onImageUpload={async (file) => {
    const body = new FormData();
    body.append("file", file);
    const res = await fetch("/api/uploads", { method: "POST", body });
    return (await res.json()).url;
  }}
/>`}
      >
        <div class="zen-flex zen-w-full zen-flex-col zen-gap-2">
          <RichText value={withImage()} onChange={setWithImage} onImageUpload={uploadImage} />
          <p class="zen-m-0 zen-text-xs zen-text-zen-muted-fg" data-testid="rich-text-uploads">
            {uploads().length ? `Uploaded: ${uploads().join("; ")}` : "No uploads yet."}
          </p>
        </div>
      </DemoSection>
    </DemoPage>
  );
};

export default NewRichTextDemo;
