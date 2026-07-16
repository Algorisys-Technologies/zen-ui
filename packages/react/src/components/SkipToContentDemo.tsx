import { SkipToContent } from "./skip-to-content/skip-to-content";
import { CodeExample } from "./demo-helpers";

const SkipToContentDemo: React.FC = () => (
  <div className="demo-page">
    <h1>SkipToContent</h1>
    <p className="lede">
      The keyboard bypass an app frame owes its users. It is the first focusable thing on the page and is
      visually hidden until it takes focus, so the first <kbd>Tab</kbd> reveals a "Skip to main content" link and{" "}
      <kbd>Enter</kbd> jumps past the header and nav straight to the content. WCAG 2.4.1 (Bypass Blocks) asks for
      exactly this.
    </p>

    <section className="demo-section">
      <h2>Try it</h2>
      <CodeExample
        title="First Tab reveals the link; Enter jumps to the target"
        code={`<SkipToContent href="#main-content" />
{/* …header, nav… */}
<main id="main-content" tabIndex={-1}>…</main>`}
      >
        <div style={{ position: "relative", display: "grid", gap: 12 }}>
          <SkipToContent href="#demo-main" />
          <p style={{ fontSize: "0.875rem", color: "var(--zen-color-muted-fg)" }}>
            Click here, then press <kbd>Tab</kbd> — the link appears at the top-left of the viewport. Press{" "}
            <kbd>Enter</kbd> to move focus to the target below.
          </p>
          <div
            id="demo-main"
            tabIndex={-1}
            style={{
              padding: 16,
              borderRadius: 8,
              border: "1px solid var(--zen-color-border)",
              background: "var(--zen-color-muted)",
            }}
          >
            Main content target (<code>id="demo-main"</code>, <code>tabIndex=-1</code>).
          </div>
        </div>
      </CodeExample>
    </section>
  </div>
);

export default SkipToContentDemo;
