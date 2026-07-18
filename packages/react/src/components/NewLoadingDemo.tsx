import { Button } from "./button/button";
import { Loading } from "./loading/loading";
import { CodeExample } from "./demo-helpers";

const NewLoadingDemo: React.FC = () => (
  <div className="demo-page">
    <h1>Loading (new — shadcn-style)</h1>
    <p className="lede">
      Animated spinner. No Radix primitive needed; shadcn ships the same pattern
      as a plain SVG with <code>animate-spin</code>. Has a visually-hidden
      label so screen readers announce "Loading".
    </p>

    <section className="demo-section">
      <h2>1. Default</h2>
      <CodeExample
        title="md primary spinner with sr-only 'Loading' label"
        code={`<Loading />`}
      >
        <Loading />
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>2. Sizes</h2>
      <CodeExample
        title="sm · md · lg · xl"
        code={`<Loading size="sm" />
<Loading size="md" />
<Loading size="lg" />
<Loading size="xl" />`}
      >
        <Loading size="sm" />
        <Loading size="md" />
        <Loading size="lg" />
        <Loading size="xl" />
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>3. Colors</h2>
      <CodeExample
        title={`primary · neutral · info · success · warning · error · current`}
        description={`Use "current" to inherit the surrounding text color — useful when nesting Loading inside a Button.`}
        code={`<Loading color="primary" />
<Loading color="success" />
<Loading color="error" />
<Loading color="current" />`}
      >
        {(["primary", "neutral", "info", "success", "warning", "error"] as const).map((c) => (
          <Loading key={c} color={c} size="lg" label={`Loading ${c}`} />
        ))}
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>4. Inside a Button</h2>
      <CodeExample
        title={`color="current" inherits the button's text color`}
        code={`<Button disabled>
  <Loading color="current" size="sm" label="" />
  Saving…
</Button>`}
      >
        <Button disabled>
          <Loading color="current" size="sm" label="" />
          Saving…
        </Button>
        <Button variant="outline" disabled>
          <Loading color="current" size="sm" label="" />
          Loading…
        </Button>
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>5. Decorative (no announcement)</h2>
      <CodeExample
        title={`label="" marks it presentational so the parent provides semantics`}
        description={`Useful when the surrounding element already says "Loading" or carries aria-busy.`}
        code={`<div aria-busy="true">
  <Loading label="" />
  <span>Fetching results…</span>
</div>`}
      >
        <div aria-busy="true" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: "0.875rem" }}>
          <Loading label="" />
          <span>Fetching results…</span>
        </div>
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>6. Full-page overlay pattern</h2>
      <CodeExample
        title="Compose with a wrapper for blocking states"
        code={`<div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "grid", placeItems: "center" }}>
  <Loading size="xl" color="current" />
</div>`}
      >
        <div
          style={{
            position: "relative",
            width: 240,
            height: 80,
            background: "var(--zen-color-muted)",
            borderRadius: "var(--zen-radius-md)",
            display: "grid",
            placeItems: "center",
          }}
        >
          <Loading size="lg" color="primary" />
        </div>
      </CodeExample>
    </section>
  </div>
);

export default NewLoadingDemo;
