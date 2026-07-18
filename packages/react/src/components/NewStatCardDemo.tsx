import { useState } from "react";
import { StatCard } from "./stat-card/stat-card";
import { Icon } from "./icon/icon";
import { Button } from "./button/button";
import { CodeExample } from "./demo-helpers";

const GRID: React.CSSProperties = {
  display: "grid",
  gap: 12,
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  width: "100%",
};

const NewStatCardDemo: React.FC = () => {
  const [went, setWent] = useState("—");
  const [loading, setLoading] = useState(false);

  return (
    <div className="demo-page">
      <h1>StatCard</h1>
      <p className="lede">
        A labelled figure, optionally with an icon, a delta and somewhere to go.{" "}
        <code>Card</code> is a bare surface, so every app rebuilds this on top of it and
        each copy drifts. The surface here <em>is</em> Card's — <code>cardVariants</code>,
        not a second set of class strings — so a change to the card reaches this too.
      </p>

      <section className="demo-section">
        <h2>1. Label and value</h2>
        <CodeExample
          title="The whole component, minus the optional parts"
          description="Everything except label and value is opt-in. No icon, no delta, no link."
          code={`<StatCard label="Total responses" value="1,284" />`}
        >
          <div style={GRID}>
            <StatCard label="Total responses" value="1,284" />
            <StatCard label="Active surveys" value="7" />
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>2. Colour and icon</h2>
        <CodeExample
          title="color tints the icon; the icon stays bare"
          description="color maps to --zen-* tokens, so it retints with the theme. The card this replaces computed Bootstrap class names at runtime instead — a string no CSS purge can see. The icon is rendered bare on purpose: an icon inside a tinted tile is the most recognisable machine-made card there is."
          code={`<StatCard
  label="Completion rate"
  value="87%"
  color="success"
  icon={<Icon name="check-circle" size={22} />}
/>`}
        >
          <div style={GRID}>
            <StatCard
              label="Completion rate"
              value="87%"
              color="success"
              icon={<Icon name="check-circle" size={22} />}
            />
            <StatCard
              label="Awaiting review"
              value="23"
              color="warning"
              icon={<Icon name="inbox" size={22} />}
            />
            <StatCard
              label="Failed invites"
              value="4"
              color="error"
              icon={<Icon name="x-circle" size={22} />}
            />
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>3. Trend</h2>
        <CodeExample
          title="Up is not universally good"
          description="direction draws the arrow and names it for a screen reader. It also picks a colour — up reads as success, down as error — but that is only a convention: churn, cost and error rate all read the other way. trend.color overrides it, because the caller is the one who knows what the number means."
          code={`<StatCard label="Responses" value="1,284" trend={{ value: "+12%", direction: "up" }} />

// churn going up is not good news, so say so
<StatCard
  label="Churn"
  value="3.1%"
  trend={{ value: "+0.4%", direction: "up", color: "error" }}
/>`}
        >
          <div style={GRID}>
            <StatCard
              label="Responses"
              value="1,284"
              trend={{ value: "+12%", direction: "up" }}
            />
            <StatCard
              label="Churn"
              value="3.1%"
              trend={{ value: "+0.4%", direction: "up", color: "error" }}
            />
            <StatCard
              label="Time to complete"
              value="4m 12s"
              trend={{ value: "no change", direction: "flat" }}
            />
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>4. Somewhere to go</h2>
        <CodeExample
          title="href renders a link; onClick renders a button"
          description="Not a div with a click handler bolted on — an interactive card is a real control, so it is focusable and reachable from the keyboard for free. It shifts tone on hover rather than lifting off the page."
          code={`<StatCard label="Responses" value="1,284" href="/responses" />
<StatCard label="Drafts" value="3" onClick={() => open("drafts")} />`}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }}>
            <div style={GRID}>
              <StatCard
                label="Responses"
                value="1,284"
                icon={<Icon name="users" size={22} />}
                href="#stat-card-link"
              />
              <StatCard
                label="Drafts"
                value="3"
                color="primary"
                icon={<Icon name="folder-open" size={22} />}
                onClick={() => setWent("clicked Drafts")}
              />
            </div>
            <p className="zen-m-0 zen-text-xs zen-text-zen-muted-fg">
              onClick → <code>{went}</code>
            </p>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>5. Loading</h2>
        <CodeExample
          title="The label stays; the figure is what you do not know yet"
          description="loading swaps the figure for a skeleton and marks the card aria-busy. The label is not a mystery, so it does not shimmer."
          code={`<StatCard label="Completion rate" value={rate} loading={isLoading} />`}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }}>
            <div style={GRID}>
              <StatCard
                label="Completion rate"
                value="87%"
                color="success"
                icon={<Icon name="check-circle" size={22} />}
                trend={{ value: "+12%", direction: "up" }}
                loading={loading}
              />
              <StatCard label="Total responses" value="1,284" loading={loading} />
            </div>
            <Button size="sm" variant="outline" color="neutral" onClick={() => setLoading((v) => !v)}>
              {loading ? "Resolve" : "Simulate loading"}
            </Button>
          </div>
        </CodeExample>
      </section>
    </div>
  );
};

export default NewStatCardDemo;
