import { Button } from "@algorisys/zen-ui-vanilla";
import { DemoPage } from "./demo-helpers";

/**
 * LiveIndicator demo — the web-components port. `last-updated` / `now` are set
 * here as PROPERTIES (epoch milliseconds pass straight through); the attribute
 * forms take epoch digits or an ISO string. `connected` is json because it
 * defaults to true — see elements/live-indicator.ts.
 */

type LiveEl = HTMLElement & Record<string, unknown>;

const live = (props: Record<string, unknown>): LiveEl => {
  const el = document.createElement("zen-live-indicator") as LiveEl;
  for (const [key, value] of Object.entries(props)) {
    if (value !== undefined) el[key] = value;
  }
  return el;
};

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
        code: `<zen-live-indicator id="feed"></zen-live-indicator>
<zen-live-indicator connected="false"></zen-live-indicator>

<script>
  document.querySelector("#feed").lastUpdated = fetchedAt;
</script>`,
        render: () => {
          const rows = document.createElement("div");
          Object.assign(rows.style, { display: "grid", gap: "12px" });
          rows.append(
            live({ now, lastUpdated: now - 2_000 }),
            live({ now, lastUpdated: now - 48_000 }),
            live({ now, lastUpdated: now - 3 * 60_000 - 10_000 }),
            live({ now }),
            live({ now, lastUpdated: now - 20_000, connected: false }),
          );
          return rows;
        },
      },
      {
        title: "2. Running",
        codeTitle: "the age ticks every second; a screen reader hears only the changes",
        codeDescription:
          "This one updates every 5 seconds. Pause the feed and it turns stale after 15 seconds (staleAfterMs is shortened here); drop the connection and it is offline at once.",
        code: `<zen-live-indicator id="live" stale-after-ms="15000"></zen-live-indicator>

<script>
  const live = document.querySelector("#live");
  // after each successful fetch:
  live.lastUpdated = Date.now();
  // when the socket drops:
  live.connected = false;
</script>`,
        render: () => {
          // A pretend feed: "updates" every 5 seconds until paused, and a socket
          // that can be dropped — enough to watch every state happen.
          let paused = false;
          let connected = true;
          const indicator = live({ lastUpdated: Date.now(), connected, staleAfterMs: 15_000 });
          indicator.setAttribute("data-testid", "running");

          const wrap = document.createElement("div");
          wrap.className = "zen-flex zen-flex-col zen-gap-3";
          const buttons = document.createElement("div");
          buttons.className = "zen-flex zen-flex-wrap zen-gap-2";
          // The demo's own controls are vanilla handles, as in ProductionScheduleDemo:
          // their labels change, and update() is the direct way to say so.
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
              indicator.connected = connected;
              drop.update({ children: connected ? "Drop the connection" : "Reconnect" });
            },
          });
          buttons.append(pause.el, drop.el);
          wrap.append(indicator, buttons);

          let started = false;
          const feed = setInterval(() => {
            // Stop once the page has navigated away and taken the demo with it;
            // disconnecting the element destroys its component and its timer.
            if (wrap.isConnected) started = true;
            else if (started) {
              clearInterval(feed);
              return;
            }
            if (!paused && connected) indicator.lastUpdated = Date.now();
          }, 5_000);
          return wrap;
        },
      },
    ],
  });
}
