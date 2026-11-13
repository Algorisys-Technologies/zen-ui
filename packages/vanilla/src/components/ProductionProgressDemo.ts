import { ProductionProgress } from "./production-progress/production-progress";
import { DemoPage } from "./demo-helpers";

const stack = (...children: Node[]): HTMLElement => {
  const div = document.createElement("div");
  Object.assign(div.style, { display: "grid", gap: "20px", width: "100%", maxWidth: "36rem" });
  div.append(...children);
  return div;
};

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
        code: `ProductionProgress({ label: "WO-10042 · Bracket", target: 500, good: 361, scrap: 19 })`,
        render: () =>
          stack(
            ProductionProgress({ label: "WO-10042 · Bracket", target: 500, good: 361, scrap: 19 }).el,
            ProductionProgress({ label: "WO-10043 · Hinge plate", target: 500, good: 440, scrap: 40 }).el,
          ),
      },
      {
        title: "2. The ends",
        codeTitle: "not started, barely started, done, and over",
        codeDescription:
          "3 of 5,000 still gets a 2px sliver: an empty bar means nobody has begun, which is a different fact. Past the target the bar is full and the line says by how much.",
        code: `ProductionProgress({ target: 5000, good: 3 })
ProductionProgress({ target: 500, good: 512, scrap: 8 })`,
        render: () =>
          stack(
            ProductionProgress({ label: "Not started", target: 5000, good: 0 }).el,
            ProductionProgress({ label: "Barely started", target: 5000, good: 3 }).el,
            ProductionProgress({ label: "Done", target: 500, good: 500, scrap: 6 }).el,
            ProductionProgress({ label: "Over target", target: 500, good: 512, scrap: 8 }).el,
          ),
      },
      {
        title: "3. Counting cartons",
        codeTitle: "segments: a row of units the good count fills",
        code: `ProductionProgress({
  label: "WO-10042 · packing",
  target: 500, good: 361,
  segments: { size: 12, count: 42, unit: "cartons" },
})`,
        render: () =>
          stack(
            ProductionProgress({
              label: "WO-10042 · packing",
              target: 500,
              good: 361,
              segments: { size: 12, count: 42, unit: "cartons" },
            }).el,
          ),
      },
      {
        title: "4. In a table row",
        codeTitle: "size sm with hideText; the counts stay in the accessible text",
        code: `ProductionProgress({ size: "sm", hideText: true, target: 500, good: 361, scrap: 19 })`,
        render: () =>
          stack(ProductionProgress({ size: "sm", hideText: true, label: "WO-10042", target: 500, good: 361, scrap: 19 }).el),
      },
    ],
  });
}
