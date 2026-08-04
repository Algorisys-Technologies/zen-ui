import { createSignal } from "solid-js";
import { TimerBadge, TestCountdownBar } from "./countdown/countdown";
import { Button } from "./button/button";
import { DemoPage, DemoSection } from "./demo-helpers";

const inSeconds = (n: number) => Date.now() + n * 1000;

const NewCountdownDemo = () => {
  const [log, setLog] = createSignal<string[]>([]);
  const [live, setLive] = createSignal(inSeconds(70));
  /* Fixed at setup so the demo's deadlines do not move on every re-render. */
  const fixed = {
    long: inSeconds(3600),
    warning: inSeconds(295),
    critical: inSeconds(45),
    gone: inSeconds(-5),
  };

  return (
    <DemoPage
      title="TimerBadge & TestCountdownBar"
      description={
        <>
          How long is left in a timed assessment, and what that means. Both take a{" "}
          <strong>deadline</strong>, not a duration they count down — a component
          that decrements on an interval runs slow in a throttled tab, so the
          candidate sees more time than they have and the server disagrees at
          submission.
        </>
      }
    >
      <DemoSection
        title="1. The four states"
        codeTitle="normal → warning → critical → expired"
        codeDescription="Thresholds default to 300s and 60s — the two marks the assessment product this was built against already warns at, rather than numbers invented here. The last minute pulses as well as changing colour, because colour alone fails a colour-blind candidate, and this is the one moment the clock must not be missable. It respects prefers-reduced-motion."
        code={`<TimerBadge deadline={endsAt} />
<TimerBadge deadline={endsAt} thresholds={[600, 120]} />  // your own marks`}
      >
        <div class="zen-flex zen-flex-wrap zen-items-center zen-gap-3">
          <TimerBadge deadline={fixed.long} label="Time left" />
          <TimerBadge deadline={fixed.warning} label="Time left" />
          <TimerBadge deadline={fixed.critical} label="Time left" />
          <TimerBadge deadline={fixed.gone} label="Time left" />
        </div>
      </DemoSection>

      <DemoSection
        title="2. Formatting"
        codeTitle="mm:ss until there is an hour, then h:mm:ss"
        codeDescription="59:59 becomes 1:00:00, never 60:00. Part-seconds round up: with truncation, 900ms left reads 00:00 for most of a second while the form still accepts input, and a candidate looking at zero on a live form trusts neither the clock nor the form."
        code={`formatCountdown(3_599_000) // "59:59"
formatCountdown(3_600_000) // "1:00:00"
formatCountdown(500)       // "00:01"  — not "00:00"`}
      >
        <div class="zen-flex zen-flex-wrap zen-gap-3">
          <TimerBadge deadline={inSeconds(59)} variant="bare" />
          <TimerBadge deadline={inSeconds(3599)} variant="bare" />
          <TimerBadge deadline={inSeconds(3600)} variant="bare" />
        </div>
      </DemoSection>

      <DemoSection
        title="3. Callbacks"
        codeTitle="onExpire fires once; onThreshold fires per mark passed"
        codeDescription="Neither owns submission — what to submit, and how, differs per assessment type. onThreshold catches a mark even when a tick jumps over it, which a throttled tab does constantly: comparing two readings rather than testing for an exact second is the difference between the 5-minute warning firing and never firing at all."
        code={
          "<TimerBadge\n  deadline={endsAt}\n  onThreshold={(s) => toast(s / 60 + ' minutes remaining')}\n  onExpire={() => submit()}\n/>"
        }
      >
        <div class="zen-flex zen-flex-col zen-gap-2">
          <div class="zen-flex zen-flex-wrap zen-items-center zen-gap-3">
            <TimerBadge
              deadline={live()}
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
          <pre class="zen-m-0 zen-min-h-16 zen-text-xs">{log().join("\n") || "watching…"}</pre>
        </div>
      </DemoSection>

      <DemoSection
        title="4. The bar"
        codeTitle="TestCountdownBar — sticky, with room for your own controls"
        codeDescription="A header with the clock, whatever belongs beside it, and its actions. Sticky by default at the same z-layer as Banner, so two sticky bars in one app stack predictably rather than by DOM accident."
        code={`<TestCountdownBar
  deadline={endsAt}
  title="Kata 3 — Binary search"
  actions={<Button size="sm">Submit</Button>}
  onExpire={autoSubmit}
>
  Question 4 of 10
</TestCountdownBar>`}
      >
        <div class="zen-w-full zen-overflow-hidden zen-rounded-zen-md zen-border zen-border-zen-border">
          <TestCountdownBar
            deadline={fixed.warning}
            title="Kata 3 — Binary search"
            sticky={false}
            actions={<Button size="sm">Submit</Button>}
          >
            <span class="zen-text-xs zen-text-zen-muted-fg">Question 4 of 10</span>
          </TestCountdownBar>
          <div class="zen-p-4 zen-text-sm">The assessment runs under it.</div>
        </div>
      </DemoSection>

      <DemoSection
        title="5. Paused"
        codeTitle="`paused` stops the clock without unmounting"
        codeDescription="For a test that has already been submitted, or one under review. Unmounting the badge instead would lose the elapsed reading entirely."
        code={`<TimerBadge deadline={endsAt} paused />`}
      >
        <TimerBadge deadline={fixed.long} label="Submitted at" paused />
      </DemoSection>
    </DemoPage>
  );
};

export default NewCountdownDemo;
