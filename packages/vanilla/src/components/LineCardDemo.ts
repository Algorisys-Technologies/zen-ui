import { LineCard } from "./line-card/line-card";
import { DemoPage } from "./demo-helpers";

// 10:30 in Pune.
const NOW = Date.UTC(2026, 10, 13, 5, 0);
const M = 60_000;

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
        code: `LineCard({
  name: "Line A", href: "/lines/a",
  state: "running", since: stateSince,
  order: { code: "WO-10042", product: "Bracket", target: 500, good: 361, scrap: 19 },
  perHour: 278, oee: 0.72, timeZone: "Asia/Kolkata",
})`,
        render: () => {
          const common = { now: NOW, timeZone: "Asia/Kolkata" };
          return grid(
            LineCard({ ...common, name: "Line A", href: "#line-a", state: "running", since: NOW - 50 * M, perHour: 278, oee: 0.72,
              order: { code: "WO-10042", product: "Bracket", target: 500, good: 361, scrap: 19 } }).el,
            LineCard({ ...common, name: "Line B", href: "#line-b", state: "fault", since: NOW - 23 * M, cause: "Hydraulic pressure low", perHour: 240, oee: 0.48,
              order: { code: "WO-10051", product: "Hinge plate", target: 800, good: 412, scrap: 6 } }).el,
            LineCard({ ...common, name: "Line C", href: "#line-c", state: "setup", since: NOW - 11 * M, cause: "Changeover to SKU 4471",
              order: { code: "WO-10060", product: "Cover", target: 1200, good: 0 } }).el,
            LineCard({ ...common, name: "Line D", href: "#line-d", state: "running", since: NOW - 3 * M,
              order: { code: "WO-10063", product: "Spacer", target: 300, good: 4 } }).el,
            LineCard({ ...common, name: "Line E", href: "#line-e", state: "idle", since: NOW - 40 * M,
              order: { code: "WO-10044", product: "Bracket", target: 500, good: 500, scrap: 7 } }).el,
            LineCard({ ...common, name: "Line F", href: "#line-f", state: "unknown", since: NOW - 5 * M - 12_000 }).el,
          );
        },
      },
    ],
  });
}
