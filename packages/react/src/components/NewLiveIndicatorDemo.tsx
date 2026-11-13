import * as React from "react";
import { LiveIndicator } from "./live-indicator/live-indicator";
import { Button } from "./button/button";
import { CodeExample } from "./demo-helpers";

const ROWS: React.CSSProperties = { display: "grid", gap: "12px" };

const NewLiveIndicatorDemo: React.FC = () => {
  // A pretend feed: "updates" every 5 seconds until paused, and a socket that
  // can be dropped — enough to watch every state happen.
  const [last, setLast] = React.useState<number | undefined>(() => Date.now());
  const [paused, setPaused] = React.useState(false);
  const [connected, setConnected] = React.useState(true);
  React.useEffect(() => {
    if (paused || !connected) return;
    const feed = setInterval(() => setLast(Date.now()), 5_000);
    return () => clearInterval(feed);
  }, [paused, connected]);

  // Pinned once, as the Solid demo's setup-time `Date.now()` is.
  const [now] = React.useState(() => Date.now());
  return (
    <div className="demo-page">
      <h1>LiveIndicator</h1>
      <p className="lede">
        Whether what a live screen shows is current. A frozen screen otherwise looks exactly
        like a calm one — an expired session, a restarted server or a dropped socket leaves
        every number on its last good value.
      </p>

      <section className="demo-section">
        <h2>1. The four states</h2>
        <CodeExample
          title="live, stale, waiting, offline"
          description="Stale after staleAfterMs (2 minutes by default) since the last successful update; waiting before anything has arrived; offline as soon as the app says the connection is down."
          code={`<LiveIndicator lastUpdated={fetchedAt} />
<LiveIndicator lastUpdated={fetchedAt} connected={socketOpen} />`}
          previewStyle={ROWS}
        >
          <LiveIndicator now={now} lastUpdated={now - 2_000} />
          <LiveIndicator now={now} lastUpdated={now - 48_000} />
          <LiveIndicator now={now} lastUpdated={now - 3 * 60_000 - 10_000} />
          <LiveIndicator now={now} />
          <LiveIndicator now={now} lastUpdated={now - 20_000} connected={false} />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>2. Running</h2>
        <CodeExample
          title="the age ticks every second; a screen reader hears only the changes"
          description="This one updates every 5 seconds. Pause the feed and it turns stale after 15 seconds (staleAfterMs is shortened here); drop the connection and it is offline at once."
          code={`<LiveIndicator lastUpdated={last} connected={connected} staleAfterMs={15_000} />`}
        >
          <div className="zen-flex zen-flex-col zen-gap-3">
            <LiveIndicator lastUpdated={last} connected={connected} staleAfterMs={15_000} data-testid="running" />
            <div className="zen-flex zen-flex-wrap zen-gap-2">
              <Button variant="outline" onClick={() => setPaused((p) => !p)}>
                {paused ? "Resume the feed" : "Pause the feed"}
              </Button>
              <Button variant="outline" onClick={() => setConnected((c) => !c)}>
                {connected ? "Drop the connection" : "Reconnect"}
              </Button>
            </div>
          </div>
        </CodeExample>
      </section>
    </div>
  );
};

export default NewLiveIndicatorDemo;
