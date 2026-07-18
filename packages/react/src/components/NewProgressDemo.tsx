import { useEffect, useState } from "react";
import { Progress } from "./progress/progress";
import { CodeExample } from "./demo-helpers";

const NewProgressDemo: React.FC = () => {
  const [animated, setAnimated] = useState(13);
  useEffect(() => {
    const id = setInterval(
      () => setAnimated((v) => (v >= 100 ? 0 : v + 7)),
      400,
    );
    return () => clearInterval(id);
  }, []);

  return (
    <div className="demo-page">
      <h1>Progress (new — Radix-backed)</h1>
      <p className="lede">
        Determinate progress indicator on{" "}
        <code>@radix-ui/react-progress</code>. Radix supplies{" "}
        <code>role="progressbar"</code> +{" "}
        <code>aria-valuenow</code>/<code>aria-valuemax</code>.
      </p>

      <section className="demo-section">
        <h2>1. Basic</h2>
        <CodeExample
          title="value 0–100"
          code={`<Progress value={42} />`}
        >
          <div style={{ width: "100%", maxWidth: 480 }}>
            <Progress value={42} />
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>2. Colors</h2>
        <CodeExample
          title="primary · neutral · info · success · warning · error"
          code={`<Progress value={70} color="primary" />
<Progress value={70} color="success" />
<Progress value={70} color="warning" />
<Progress value={70} color="error" />`}
        >
          <div style={{ width: "100%", maxWidth: 480, display: "grid", gap: "0.375rem" }}>
            <Progress value={70} color="primary" />
            <Progress value={70} color="neutral" />
            <Progress value={70} color="info" />
            <Progress value={70} color="success" />
            <Progress value={70} color="warning" />
            <Progress value={70} color="error" />
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>3. Sizes</h2>
        <CodeExample
          title="sm · md · lg"
          code={`<Progress value={55} size="sm" />
<Progress value={55} size="md" />
<Progress value={55} size="lg" />`}
        >
          <div style={{ width: "100%", maxWidth: 480, display: "grid", gap: "0.375rem" }}>
            <Progress value={55} size="sm" />
            <Progress value={55} size="md" />
            <Progress value={55} size="lg" />
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>4. Animated</h2>
        <CodeExample
          title="Drive value from React state — Radix updates aria-valuenow"
          code={`const [v, setV] = useState(0);
useEffect(() => {
  const id = setInterval(() => setV((p) => (p >= 100 ? 0 : p + 7)), 400);
  return () => clearInterval(id);
}, []);

<Progress value={v} />`}
        >
          <div style={{ width: "100%", maxWidth: 480, display: "grid", gap: "0.5rem" }}>
            <Progress value={animated} />
            <span style={{ fontSize: "0.8125rem", color: "var(--zen-color-muted-fg)" }}>
              value: {animated}%
            </span>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>5. With label</h2>
        <CodeExample
          title="Combine with surrounding markup"
          code={`<div>
  <div style={{ display: "flex", justifyContent: "space-between" }}>
    <span>Uploading</span>
    <span>{value}%</span>
  </div>
  <Progress value={value} />
</div>`}
        >
          <div style={{ width: "100%", maxWidth: 480 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem", marginBottom: 6 }}>
              <span>Uploading dataset.csv</span>
              <span>68%</span>
            </div>
            <Progress value={68} color="info" />
          </div>
        </CodeExample>
      </section>
    </div>
  );
};

export default NewProgressDemo;
