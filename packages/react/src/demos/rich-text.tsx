import { useState } from "react";
import { RichText } from "../components/rich-text/rich-text";
import { CodeExample } from "./demo-helpers";
// Jodit renders its toolbar from its own stylesheet. Without it the toolbar's
// icons have no width attribute and nothing to size them, so they expand to
// fill the pane — a 930px chevron. Same requirement (and fix) as the Map demo's
// `import "leaflet/dist/leaflet.css"`.
//
// This pulls from `jodit`, NOT `jodit-pro-react`: the wrapper's package exports
// map does not expose its CSS, so `jodit-pro-react/build/esm/index.css` fails to
// resolve (ERR_PACKAGE_PATH_NOT_EXPORTED) — and Vite drops it silently rather
// than erroring, leaving a green build and an unstyled editor. jodit-pro-react
// wraps Jodit, so Jodit's own stylesheet is the right one either way, and it is
// the same import the Solid binding documents.
import "jodit/es2021/jodit.min.css";
// KaTeX's stylesheet, for the `math` preview. Without it KaTeX's output prints
// every formula twice — once as MathML, once as unstyled spans.
import "katex/dist/katex.min.css";

const NewRichTextDemo: React.FC = () => {
  const [html, setHtml] = useState("<p>Hello from <strong>zen-ui</strong> 👋</p>");
  const [maths, setMaths] = useState(
    "<p>The roots of $ax^2 + bx + c = 0$ are</p><p>$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$</p>",
  );
  const [withImage, setWithImage] = useState("<p>Drop or paste an image here.</p>");
  const [uploads, setUploads] = useState<string[]>([]);

  /* Stands in for a real upload: a blob URL is what a server would hand back as
     a CDN path. The point is what lands in the HTML — a URL, not a data URI. */
  const uploadImage = async (file: File) => {
    const url = URL.createObjectURL(file);
    setUploads((u) => [...u, `${file.name} (${file.size} bytes) → ${url}`]);
    return url;
  };

  return (
    <div className="demo-page">
      <h1>RichText</h1>
      <p className="lede">
        WYSIWYG editor wrapping <code>jodit-pro-react</code> (an{" "}
        <strong>optional</strong> peer dependency, lazy-loaded on first render).
        <code>onChange</code> fires on blur (Jodit's recommended commit point).
        Install <code>jodit-pro-react</code> to use it.
      </p>

      <section className="demo-section">
        <h2>1. Controlled editor</h2>
        <CodeExample
          title="value / onChange"
          code={`const [html, setHtml] = useState("<p>Hello…</p>");

<RichText value={html} onChange={setHtml} placeholder="Write something…" />`}
        >
          <div style={{ width: "100%" }}>
            <RichText value={html} onChange={setHtml} placeholder="Write something…" />
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>2. Current HTML</h2>
        <CodeExample title="onChange output (updates on blur)" code={`// html state`}>
          <pre
            style={{
              margin: 0,
              padding: 12,
              width: "100%",
              overflowX: "auto",
              fontSize: "0.75rem",
              background: "var(--zen-color-muted)",
              borderRadius: 6,
              color: "var(--zen-color-foreground)",
            }}
          >
            {html}
          </pre>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>3. Maths</h2>
        <CodeExample
          title="`math`, rendered with KaTeX beneath the editor"
          description="Write $…$ inline and $$…$$ for a display equation. The editor keeps the TeX source, which is the only form that survives a round trip through storage; the rendered form is a preview underneath. katex is an optional peer dependency, loaded only when math is on — import its stylesheet once. renderMath is exported, so the question a candidate sees and the printed report render the same string the same way."
          code={`import "katex/dist/katex.min.css";

<RichText value={html} onChange={setHtml} math />

// anywhere else the same HTML is shown
const rendered = await renderMath(html);`}
        >
          <div style={{ width: "100%" }}>
            <RichText value={maths} onChange={setMaths} math />
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>4. Image uploads</h2>
        <CodeExample
          title="`onImageUpload`, so the HTML holds a URL"
          description="Without it a dropped or pasted image is inlined as a base64 data URI, which works and quietly puts megabytes inside the HTML you store. With it, each file goes to your handler and the URL it resolves to is what gets embedded. Uploading is yours; this demo hands back a blob URL in place of a server's."
          code={`<RichText
  value={html}
  onChange={setHtml}
  onImageUpload={async (file) => {
    const body = new FormData();
    body.append("file", file);
    const res = await fetch("/api/uploads", { method: "POST", body });
    return (await res.json()).url;
  }}
/>`}
        >
          <div className="zen-flex zen-w-full zen-flex-col zen-gap-2">
            <RichText value={withImage} onChange={setWithImage} onImageUpload={uploadImage} />
            <p className="zen-m-0 zen-text-xs zen-text-zen-muted-fg" data-testid="rich-text-uploads">
              {uploads.length ? `Uploaded: ${uploads.join("; ")}` : "No uploads yet."}
            </p>
          </div>
        </CodeExample>
      </section>
    </div>
  );
};

export default NewRichTextDemo;
