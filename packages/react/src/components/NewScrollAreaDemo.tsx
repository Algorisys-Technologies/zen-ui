import { ScrollArea, ScrollBar } from "./scroll-area/scroll-area";
import { CodeExample } from "./demo-helpers";

const NewScrollAreaDemo: React.FC = () => (
  <div className="demo-page">
    <h1>ScrollArea (new — Radix-backed)</h1>
    <p className="lede">
      Custom scrollbars while preserving native scrolling (mouse, touch,
      keyboard, screen-reader). Built on{" "}
      <code>@radix-ui/react-scroll-area</code>.
    </p>

    <section className="demo-section">
      <h2>1. Vertical (default)</h2>
      <CodeExample
        title={`ScrollArea ships a vertical scrollbar by default`}
        code={`<ScrollArea className="h-48 w-64 rounded-zen-md border border-zen-border p-3">
  {longList}
</ScrollArea>`}
      >
        <ScrollArea className="zen-h-48 zen-w-64 zen-rounded-zen-md zen-border zen-border-zen-border zen-p-3">
          <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: "0.8125rem" }}>
            {Array.from({ length: 40 }).map((_, i) => (
              <div key={i}>Item {i + 1}</div>
            ))}
          </div>
        </ScrollArea>
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>2. Horizontal</h2>
      <CodeExample
        title={`Add <ScrollBar orientation="horizontal" /> for X-axis scrolling`}
        code={`<ScrollArea className="w-96 rounded-zen-md border border-zen-border whitespace-nowrap">
  <div className="flex gap-2 p-3">{wideTags}</div>
  <ScrollBar orientation="horizontal" />
</ScrollArea>`}
      >
        <ScrollArea className="zen-w-96 zen-rounded-zen-md zen-border zen-border-zen-border zen-whitespace-nowrap">
          <div style={{ display: "flex", gap: 8, padding: 12 }}>
            {Array.from({ length: 20 }).map((_, i) => (
              <span
                key={i}
                style={{
                  background: "var(--zen-color-primary-soft)",
                  color: "var(--zen-color-primary-soft-fg)",
                  padding: "0.25rem 0.5rem",
                  borderRadius: 9999,
                  fontSize: "0.8125rem",
                  whiteSpace: "nowrap",
                }}
              >
                tag-{i + 1}
              </span>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>3. Both axes</h2>
      <CodeExample
        title="Mount both vertical (default) and horizontal scrollbars"
        code={`<ScrollArea className="h-64 w-80 rounded-zen-md border border-zen-border">
  <div style={{ width: 800, padding: 12 }}>{wideContent}</div>
  <ScrollBar orientation="horizontal" />
</ScrollArea>`}
      >
        <ScrollArea className="zen-h-64 zen-w-80 zen-rounded-zen-md zen-border zen-border-zen-border">
          <div style={{ width: 800, padding: 12, fontSize: "0.8125rem", lineHeight: 1.8 }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <p key={i} style={{ margin: "0 0 0.625rem 0" }}>
                Line {i + 1}: Lorem ipsum dolor sit amet consectetur adipiscing
                elit, sed do eiusmod tempor incididunt ut labore et dolore magna
                aliqua. Ut enim ad minim veniam, quis nostrud exercitation
                ullamco laboris nisi ut aliquip ex ea commodo consequat.
              </p>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CodeExample>
    </section>
  </div>
);

export default NewScrollAreaDemo;
