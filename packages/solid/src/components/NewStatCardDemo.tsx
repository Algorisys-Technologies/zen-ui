import { type JSX, createSignal } from "solid-js";
import { StatCard } from "./stat-card/stat-card";
import { Icon } from "./icon/icon";
import { Button } from "./button/button";
import { DemoPage, DemoSection } from "./demo-helpers";

const GRID: JSX.CSSProperties = {
  display: "grid",
  gap: "12px",
  "grid-template-columns": "repeat(auto-fit, minmax(200px, 1fr))",
  width: "100%",
};

const NewStatCardDemo = () => {
  const [went, setWent] = createSignal("—");
  const [loading, setLoading] = createSignal(false);

  return (
    <DemoPage
      title="StatCard"
      description={
        <>
          A labelled figure, optionally with an icon, a delta and somewhere to go.{" "}
          <code>Card</code> is a bare surface, so every app rebuilds this on top of it and
          each copy drifts. The surface here <em>is</em> Card's —{" "}
          <code>cardVariants</code>, not a second set of class strings — so a change to the
          card reaches this too.
        </>
      }
    >
      <DemoSection
        title="1. Label and value"
        codeTitle="The whole component, minus the optional parts"
        codeDescription="Everything except label and value is opt-in. No icon, no delta, no link."
        code={`<StatCard label="Total responses" value="1,284" />`}
        previewStyle={GRID}
      >
        <StatCard label="Total responses" value="1,284" />
        <StatCard label="Active surveys" value="7" />
      </DemoSection>

      <DemoSection
        title="2. Colour and icon"
        codeTitle="color tints the icon; the icon stays bare"
        codeDescription="color maps to --zen-* tokens, so it retints with the theme. The card this replaces computed Bootstrap class names at runtime instead — a string no CSS purge can see. The icon is rendered bare on purpose: an icon inside a tinted tile is the most recognisable machine-made card there is."
        code={`<StatCard
  label="Completion rate"
  value="87%"
  color="success"
  icon={<Icon name="check-circle" size={22} />}
/>`}
        previewStyle={GRID}
      >
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
      </DemoSection>

      <DemoSection
        title="3. Trend"
        codeTitle="Up is not universally good"
        codeDescription="direction draws the arrow and names it for a screen reader. It also picks a colour — up reads as success, down as error — but that is only a convention: churn, cost and error rate all read the other way. trend.color overrides it, because the caller is the one who knows what the number means."
        code={`<StatCard label="Responses" value="1,284" trend={{ value: "+12%", direction: "up" }} />

// churn going up is not good news, so say so
<StatCard
  label="Churn"
  value="3.1%"
  trend={{ value: "+0.4%", direction: "up", color: "error" }}
/>`}
        previewStyle={GRID}
      >
        <StatCard label="Responses" value="1,284" trend={{ value: "+12%", direction: "up" }} />
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
      </DemoSection>

      <DemoSection
        title="4. Somewhere to go"
        codeTitle="href renders a link; onClick renders a button"
        codeDescription="Not a div with a click handler bolted on — an interactive card is a real control, so it is focusable and reachable from the keyboard for free. It shifts tone on hover rather than lifting off the page."
        code={`<StatCard label="Responses" value="1,284" href="/responses" />
<StatCard label="Drafts" value="3" onClick={() => open("drafts")} />`}
      >
        <div style={{ display: "flex", "flex-direction": "column", gap: "12px", width: "100%" }}>
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
          <p class="zen-m-0 zen-text-xs zen-text-zen-muted-fg">
            onClick → <code>{went()}</code>
          </p>
        </div>
      </DemoSection>

      <DemoSection
        title="5. Loading"
        codeTitle="The label stays; the figure is what you do not know yet"
        codeDescription="loading swaps the figure for a skeleton and marks the card aria-busy. The label is not a mystery, so it does not shimmer."
        code={`<StatCard label="Completion rate" value={rate} loading={isLoading} />`}
      >
        <div style={{ display: "flex", "flex-direction": "column", gap: "12px", width: "100%" }}>
          <div style={GRID}>
            <StatCard
              label="Completion rate"
              value="87%"
              color="success"
              icon={<Icon name="check-circle" size={22} />}
              trend={{ value: "+12%", direction: "up" }}
              loading={loading()}
            />
            <StatCard label="Total responses" value="1,284" loading={loading()} />
          </div>
          <Button size="sm" variant="outline" color="neutral" onClick={() => setLoading((v) => !v)}>
            {loading() ? "Resolve" : "Simulate loading"}
          </Button>
        </div>
      </DemoSection>
    </DemoPage>
  );
};

export default NewStatCardDemo;
