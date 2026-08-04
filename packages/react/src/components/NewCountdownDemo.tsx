import { useMemo, useState } from "react";
import { TimerBadge, TestCountdownBar } from "./countdown/countdown";
import { Button } from "./button/button";
import { CodeExample } from "./demo-helpers";

const inSeconds = (n: number) => Date.now() + n * 1000;

const NewCountdownDemo: React.FC = () => {
  const [log, setLog] = useState<string[]>([]);
  /* Fixed at mount so the demo's deadlines do not move on every re-render. */
  const deadlines = useMemo(
    () => ({ long: inSeconds(3600), warning: inSeconds(295), critical: inSeconds(45), gone: inSeconds(-5) }),
    [],
  );
  const [live, setLive] = useState(() => inSeconds(70));

  return (
    <div className="demo-page">
      <h1>TimerBadge &amp; TestCountdownBar</h1>
      <p className="lede">
        How long is left in a timed assessment, and what that means. Both take a{" "}
        <strong>deadline</strong>, not a duration they count down. A component that
        decrements a number on an interval runs slow in a throttled background tab —
        the candidate sees more time than they have and the server disagrees at
        submission. <code>deadline - now</code> cannot drift.
      </p>

      <section className="demo-section">
        <h2>1. The four states</h2>
        <CodeExample
          title="normal → warning → critical → expired"
          description="Thresholds default to 300s and 60s — the two marks the assessment product this was built against already warns at, rather than numbers invented here. The last minute pulses as well as changing colour, because colour alone fails a colour-blind candidate, and this is the one moment the clock must not be missable. It respects prefers-reduced-motion."
          code={`<TimerBadge deadline={endsAt} />
<TimerBadge deadline={endsAt} thresholds={[600, 120]} />  // your own marks`}
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
            <TimerBadge deadline={deadlines.long} label="Time left" />
            <TimerBadge deadline={deadlines.warning} label="Time left" />
            <TimerBadge deadline={deadlines.critical} label="Time left" />
            <TimerBadge deadline={deadlines.gone} label="Time left" />
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>2. Formatting</h2>
        <CodeExample
          title="mm:ss until there is an hour, then h:mm:ss"
          description="59:59 becomes 1:00:00, never 60:00. Part-seconds round up: with truncation, 900ms left reads 00:00 for most of a second while the form still accepts input, and a candidate looking at zero on a live form trusts neither."
          code={`formatCountdown(59_000)    // "00:59"
formatCountdown(3_599_000) // "59:59"
formatCountdown(3_600_000) // "1:00:00"
formatCountdown(500)       // "00:01"  — not "00:00"`}
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            <TimerBadge deadline={inSeconds(59)} variant="bare" />
            <TimerBadge deadline={inSeconds(3599)} variant="bare" />
            <TimerBadge deadline={inSeconds(3600)} variant="bare" />
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>3. Callbacks</h2>
        <CodeExample
          title="onExpire fires once; onThreshold fires per mark passed"
          description="Neither owns submission. What to submit, and how, differs per assessment type — a component that guessed would be wrong for every caller but one. onThreshold catches a mark even when a tick jumps over it, which a throttled tab does constantly: comparing two readings rather than testing for an exact second is the difference between the 5-minute warning firing and never firing at all."
          code={`<TimerBadge
  deadline={endsAt}
  onThreshold={(s) => toast(\`\${s / 60} minutes remaining\`)}
  onExpire={() => submit()}
/>`}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <TimerBadge
                deadline={live}
                label="Time left"
                thresholds={[60, 30]}
                onThreshold={(s) => setLog((l) => [`crossed ${s}s`, ...l].slice(0, 4))}
                onExpire={() => setLog((l) => ["expired — onExpire fired", ...l].slice(0, 4))}
              />
              <Button size="sm" variant="outline" onClick={() => setLive(inSeconds(70))}>
                Reset to 70s
              </Button>
              <Button size="sm" variant="outline" onClick={() => setLive(inSeconds(3))}>
                Jump to 3s
              </Button>
            </div>
            <pre style={{ margin: 0, fontSize: 12, minHeight: 60 }}>
              {log.length ? log.join("\n") : "watching…"}
            </pre>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>4. The bar</h2>
        <CodeExample
          title="TestCountdownBar — sticky, with room for your own controls"
          description="A header with the clock, whatever belongs beside it, and its actions. Sticky by default at the same z-layer as Banner, so two sticky bars in one app stack predictably rather than by DOM accident."
          code={`<TestCountdownBar
  deadline={endsAt}
  title="Kata 3 — Binary search"
  actions={<Button size="sm">Submit</Button>}
  onExpire={autoSubmit}
>
  Question 4 of 10
</TestCountdownBar>`}
        >
          <div style={{ width: "100%", border: "1px solid var(--zen-color-border)", borderRadius: 8, overflow: "hidden" }}>
            <TestCountdownBar
              deadline={deadlines.warning}
              title="Kata 3 — Binary search"
              sticky={false}
              actions={<Button size="sm">Submit</Button>}
            >
              <span style={{ fontSize: 12, color: "var(--zen-color-muted-fg)" }}>Question 4 of 10</span>
            </TestCountdownBar>
            <div style={{ padding: 16, fontSize: 14 }}>The assessment runs under it.</div>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>5. Paused</h2>
        <CodeExample
          title="`paused` stops the clock without unmounting"
          description="For a test that has already been submitted, or one under review. Unmounting the badge instead would lose the elapsed reading entirely."
          code={`<TimerBadge deadline={endsAt} paused />`}
        >
          <TimerBadge deadline={deadlines.long} label="Submitted at" paused />
        </CodeExample>
      </section>
    </div>
  );
};

export default NewCountdownDemo;
