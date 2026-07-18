import { Separator } from "./divider/divider";
import { CodeExample } from "./demo-helpers";

const NewSeparatorDemo: React.FC = () => (
  <div className="demo-page">
    <h1>Separator (new — Radix-backed)</h1>
    <p className="lede">
      Horizontal or vertical 1px divider. Built on{" "}
      <code>@radix-ui/react-separator</code> for correct ARIA semantics. Themed
      via <code>--zen-color-border</code>.
    </p>

    <section className="demo-section">
      <h2>1. Horizontal</h2>
      <CodeExample
        title="Default orientation"
        code={`<div>Section above</div>
<Separator />
<div>Section below</div>`}
      >
        <div style={{ width: "100%" }}>
          <div style={{ padding: "0.375rem 0" }}>Section above</div>
          <Separator />
          <div style={{ padding: "0.375rem 0" }}>Section below</div>
        </div>
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>2. Vertical</h2>
      <CodeExample
        title={`orientation="vertical"`}
        description="Container needs an explicit height so the separator can stretch."
        code={`<div style={{ display: "flex", height: 40, alignItems: "center", gap: "0.625rem" }}>
  <span>Blog</span>
  <Separator orientation="vertical" />
  <span>Docs</span>
  <Separator orientation="vertical" />
  <span>Source</span>
</div>`}
      >
        <div
          style={{
            display: "flex",
            height: 40,
            alignItems: "center",
            gap: "0.625rem",
          }}
        >
          <span>Blog</span>
          <Separator orientation="vertical" />
          <span>Docs</span>
          <Separator orientation="vertical" />
          <span>Source</span>
        </div>
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>3. Semantic vs decorative</h2>
      <CodeExample
        title={`decorative={false} makes it a real ARIA separator`}
        description={`Default is decorative (role="none") so screen readers skip it. Pass decorative={false} when the separator carries real semantic weight (e.g. between two distinct content regions).`}
        code={`<Separator decorative={false} />`}
      >
        <Separator decorative={false} />
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>4. Custom color via className</h2>
      <CodeExample
        title="Override --zen-color-border or pass utility classes"
        code={`<Separator className="bg-zen-primary" />
<Separator className="bg-zen-error" />`}
      >
        <div style={{ width: "100%" }}>
          <Separator className="zen-bg-zen-primary" />
          <div style={{ height: 8 }} />
          <Separator className="zen-bg-zen-error" />
        </div>
      </CodeExample>
    </section>
  </div>
);

export default NewSeparatorDemo;
