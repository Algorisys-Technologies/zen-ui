import { LiveIndicator } from "./live-indicator/live-indicator";
import { Button } from "./button/button";
import { DemoPage } from "./demo-helpers";

export default function LiveIndicatorDemo(): HTMLElement {
  // Pinned once, as the Solid demo's setup-time `Date.now()` is.
  const now = Date.now();
  return DemoPage({
    title: "LiveIndicator",
    description:
      "Whether what a live screen shows is current. A frozen screen otherwise looks exactly like a calm one — an expired session, a restarted server or a dropped socket leaves every number on its last good value.",
    sections: [
      {
        title: "1. The four states",
        codeTitle: "live, stale, waiting, offline",
        codeDescription:
          "Stale after staleAfterMs (2 minutes by default) since the last successful update; waiting before anything has arrived; offline as soon as the app says the connection is down.",
        code: `LiveIndicator({ lastUpdated: fetchedAt })
LiveIndicator({ lastUpdated: fetchedAt, connected: socketOpen })`,
        render: () => {
          const rows = document.createElement("div");
          Object.assign(rows.style, { display: "grid", gap: "12px" });
          rows.append(
            LiveIndicator({ now, lastUpdated: now - 2_000 }).el,
            LiveIndicator({ now, lastUpdated: now - 48_000 }).el,
            LiveIndicator({ now, lastUpdated: now - 3 * 60_000 - 10_000 }).el,
            LiveIndicator({ now }).el,
            LiveIndicator({ now, lastUpdated: now - 20_000, connected: false }).el,
          );
          return rows;
        },
      },
      {
        title: "2. Running",
        codeTitle: "the age ticks every second; a screen reader hears only the changes",
        codeDescription:
          "This one updates every 5 seconds. Pause the feed and it turns stale after 15 seconds (staleAfterMs is shortened here); drop the connection and it is offline at once.",
        code: `const live = LiveIndicator({ lastUpdated: last, connected, staleAfterMs: 15_000 });
// after each successful fetch:
live.update({ lastUpdated: Date.now() });`,
        render: () => {
          // A pretend feed: "updates" every 5 seconds until paused, and a socket
          // that can be dropped — enough to watch every state happen.
          let paused = false;
          let connected = true;
          const live = LiveIndicator({ lastUpdated: Date.now(), connected, staleAfterMs: 15_000, "data-testid": "running" });

          const wrap = document.createElement("div");
          wrap.className = "zen-flex zen-flex-col zen-gap-3";
          const buttons = document.createElement("div");
          buttons.className = "zen-flex zen-flex-wrap zen-gap-2";
          const pause = Button({
            variant: "outline",
            children: "Pause the feed",
            onClick: () => {
              paused = !paused;
              pause.update({ children: paused ? "Resume the feed" : "Pause the feed" });
            },
          });
          const drop = Button({
            variant: "outline",
            children: "Drop the connection",
            onClick: () => {
              connected = !connected;
              live.update({ connected });
              drop.update({ children: connected ? "Drop the connection" : "Reconnect" });
            },
          });
          buttons.append(pause.el, drop.el);
          wrap.append(live.el, buttons);

          let started = false;
          const feed = setInterval(() => {
            // Stop once the page has navigated away and taken the demo with it.
            if (wrap.isConnected) started = true;
            else if (started) {
              clearInterval(feed);
              live.destroy();
              return;
            }
            if (!paused && connected) live.update({ lastUpdated: Date.now() });
          }, 5_000);
          return wrap;
        },
      },
    ],
  });
}
