import { DemoPage } from "./demo-helpers";

/**
 * LineCard demo — the web-components port. Built the way a framework template
 * binds one: attributes for the strings and numbers, PROPERTIES for `order` and
 * the two times (a Date or epoch milliseconds passes straight through).
 */

type CardEl = HTMLElement & Record<string, unknown>;

// 10:30 in Pune.
const NOW = Date.UTC(2026, 10, 13, 5, 0);
const M = 60_000;

const card = (props: Record<string, unknown>): CardEl => {
  const el = document.createElement("zen-line-card") as CardEl;
  for (const [key, value] of Object.entries(props)) {
    if (value !== undefined) el[key] = value;
  }
  return el;
};

const grid = (...children: Node[]): HTMLElement => {
  const div = document.createElement("div");
  Object.assign(div.style, {
    display: "grid",
    gap: "12px",
    width: "100%",
    alignItems: "stretch",
    gridTemplateColumns: "repeat(auto-fill, minmax(min(18rem, 100%), 1fr))",
  });
  div.append(...children);
  return div;
};

export default function LineCardDemo(): HTMLElement {
  return DemoPage({
    title: "LineCard",
    description:
      "One production line at a glance. The last line answers what a supervisor scanning a wall of these is asking: when will it finish — or, if it is not moving, what it is doing instead, for how long, and why. Never an ETA from a rate the line is not making.",
    sections: [
      {
        title: "1. A plant's lines",
        codeTitle: "state, the order, a rate; href makes the card a link",
        code: `<zen-line-card
  name="Line A" href="/lines/a"
  state="running" per-hour="278" oee="0.72" time-zone="Asia/Kolkata"
  order='{"code":"WO-10042","product":"Bracket","target":500,"good":361,"scrap":19}'
></zen-line-card>

<script>
  // since (and now) take a Date or epoch milliseconds as a property,
  // or an ISO string / epoch digits as an attribute.
  document.querySelector("zen-line-card").since = stateSince;
</script>`,
        render: () => {
          const common = { now: NOW, timeZone: "Asia/Kolkata" };
          return grid(
            card({ ...common, name: "Line A", href: "#line-a", state: "running", since: NOW - 50 * M, perHour: 278, oee: 0.72,
              order: { code: "WO-10042", product: "Bracket", target: 500, good: 361, scrap: 19 } }),
            card({ ...common, name: "Line B", href: "#line-b", state: "fault", since: NOW - 23 * M, cause: "Hydraulic pressure low", perHour: 240, oee: 0.48,
              order: { code: "WO-10051", product: "Hinge plate", target: 800, good: 412, scrap: 6 } }),
            card({ ...common, name: "Line C", href: "#line-c", state: "setup", since: NOW - 11 * M, cause: "Changeover to SKU 4471",
              order: { code: "WO-10060", product: "Cover", target: 1200, good: 0 } }),
            card({ ...common, name: "Line D", href: "#line-d", state: "running", since: NOW - 3 * M,
              order: { code: "WO-10063", product: "Spacer", target: 300, good: 4 } }),
            card({ ...common, name: "Line E", href: "#line-e", state: "idle", since: NOW - 40 * M,
              order: { code: "WO-10044", product: "Bracket", target: 500, good: 500, scrap: 7 } }),
            card({ ...common, name: "Line F", href: "#line-f", state: "unknown", since: NOW - 5 * M - 12_000 }),
          );
        },
      },
    ],
  });
}
