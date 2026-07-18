import { useState } from "react";
import { RichText } from "./rich-text/rich-text";
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

const NewRichTextDemo: React.FC = () => {
  const [html, setHtml] = useState("<p>Hello from <strong>zen-ui</strong> 👋</p>");

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
    </div>
  );
};

export default NewRichTextDemo;
