import { createSignal, onCleanup } from "solid-js";
import { LiveIndicator } from "./live-indicator/live-indicator";
import { Button } from "./button/button";
import { DemoPage, DemoSection } from "./demo-helpers";

const ROWS = { display: "grid", gap: "12px" } as const;

const NewLiveIndicatorDemo = () => {
  // A pretend feed: "updates" every 5 seconds until paused, and a socket that
  // can be dropped — enough to watch every state happen.
  const [last, setLast] = createSignal<number | undefined>(Date.now());
  const [paused, setPaused] = createSignal(false);
  const [connected, setConnected] = createSignal(true);
  const feed = setInterval(() => {
    if (!paused() && connected()) setLast(Date.now());
  }, 5_000);
  onCleanup(() => clearInterval(feed));

  const now = Date.now();
  return (
    <DemoPage
      title="LiveIndicator"
      description={
        <>
          Whether what a live screen shows is current. A frozen screen otherwise looks exactly
          like a calm one — an expired session, a restarted server or a dropped socket leaves
          every number on its last good value.
        </>
      }
    >
      <DemoSection
        title="1. The four states"
        codeTitle="live, stale, waiting, offline"
        codeDescription={
          <>
            Stale after <code>staleAfterMs</code> (2 minutes by default) since the last
            successful update; waiting before anything has arrived; offline as soon as the app
            says the connection is down.
          </>
        }
        code={`<LiveIndicator lastUpdated={fetchedAt()} />
<LiveIndicator lastUpdated={fetchedAt()} connected={socketOpen()} />`}
        previewStyle={ROWS}
      >
        <LiveIndicator now={now} lastUpdated={now - 2_000} />
        <LiveIndicator now={now} lastUpdated={now - 48_000} />
        <LiveIndicator now={now} lastUpdated={now - 3 * 60_000 - 10_000} />
        <LiveIndicator now={now} />
        <LiveIndicator now={now} lastUpdated={now - 20_000} connected={false} />
      </DemoSection>

      <DemoSection
        title="2. Running"
        codeTitle="the age ticks every second; a screen reader hears only the changes"
        codeDescription={
          <>
            This one updates every 5 seconds. Pause the feed and it turns stale after 15 seconds
            (<code>staleAfterMs</code> is shortened here); drop the connection and it is offline
            at once.
          </>
        }
        code={`<LiveIndicator lastUpdated={last()} connected={connected()} staleAfterMs={15_000} />`}
      >
        <div class="zen-flex zen-flex-col zen-gap-3">
          <LiveIndicator lastUpdated={last()} connected={connected()} staleAfterMs={15_000} data-testid="running" />
          <div class="zen-flex zen-flex-wrap zen-gap-2">
            <Button variant="outline" onClick={() => setPaused((p) => !p)}>
              {paused() ? "Resume the feed" : "Pause the feed"}
            </Button>
            <Button variant="outline" onClick={() => setConnected((c) => !c)}>
              {connected() ? "Drop the connection" : "Reconnect"}
            </Button>
          </div>
        </div>
      </DemoSection>
    </DemoPage>
  );
};

export default NewLiveIndicatorDemo;
