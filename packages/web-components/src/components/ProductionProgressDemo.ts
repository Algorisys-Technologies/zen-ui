import { DemoPage } from "./demo-helpers";

/**
 * ProductionProgress demo — the web-components port. The counts are number
 * attributes; `segments` is json, so a markup author can write it inline.
 */

const stack = (...children: Node[]): HTMLElement => {
  const div = document.createElement("div");
  Object.assign(div.style, { display: "grid", gap: "20px", width: "100%", maxWidth: "36rem" });
  div.append(...children);
  return div;
};

function progress(attrs: Record<string, string | number | boolean | object>): HTMLElement {
  const p = document.createElement("zen-production-progress");
  for (const [k, v] of Object.entries(attrs)) {
    if (v === true) p.setAttribute(k, "");
    else p.setAttribute(k, typeof v === "object" ? JSON.stringify(v) : String(v));
  }
  return p;
}

export default function ProductionProgressDemo(): HTMLElement {
  return DemoPage({
    title: "ProductionProgress",
    description:
      "A work order's good and scrap counts against its target. Colour says what the parts are — good or scrap — not how far along the order is: whether 60% is on time is the schedule's question, not the bar's.",
    sections: [
      {
        title: "1. Good, scrap and what is left",
        codeTitle: "scrap is drawn, and does not count toward the target",
        codeDescription: "The second order has made 480 parts, but 40 were scrap: 60 to go, not 20.",
        code: `<zen-production-progress label="WO-10042 · Bracket" target="500" good="361" scrap="19"></zen-production-progress>`,
        render: () =>
          stack(
            progress({ label: "WO-10042 · Bracket", target: 500, good: 361, scrap: 19 }),
            progress({ label: "WO-10043 · Hinge plate", target: 500, good: 440, scrap: 40 }),
          ),
      },
      {
        title: "2. The ends",
        codeTitle: "not started, barely started, done, and over",
        codeDescription:
          "3 of 5,000 still gets a 2px sliver: an empty bar means nobody has begun, which is a different fact. Past the target the bar is full and the line says by how much.",
        code: `<zen-production-progress target="5000" good="3"></zen-production-progress>
<zen-production-progress target="500" good="512" scrap="8"></zen-production-progress>`,
        render: () =>
          stack(
            progress({ label: "Not started", target: 5000, good: 0 }),
            progress({ label: "Barely started", target: 5000, good: 3 }),
            progress({ label: "Done", target: 500, good: 500, scrap: 6 }),
            progress({ label: "Over target", target: 500, good: 512, scrap: 8 }),
          ),
      },
      {
        title: "3. Counting cartons",
        codeTitle: "segments: a row of units the good count fills",
        code: `<zen-production-progress
  label="WO-10042 · packing"
  target="500" good="361"
  segments='{"size":12,"count":42,"unit":"cartons"}'
></zen-production-progress>`,
        render: () =>
          stack(
            progress({
              label: "WO-10042 · packing",
              target: 500,
              good: 361,
              segments: { size: 12, count: 42, unit: "cartons" },
            }),
          ),
      },
      {
        title: "4. In a table row",
        codeTitle: "size sm with hideText; the counts stay in the accessible text",
        code: `<zen-production-progress size="sm" hide-text target="500" good="361" scrap="19"></zen-production-progress>`,
        render: () =>
          stack(progress({ size: "sm", "hide-text": true, label: "WO-10042", target: 500, good: 361, scrap: 19 })),
      },
    ],
  });
}
