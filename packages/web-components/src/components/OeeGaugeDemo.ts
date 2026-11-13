import { oeeFromCounts } from "@algorisys/zen-ui-vanilla";
import { DemoPage } from "./demo-helpers";

/**
 * OeeGauge demo — the web-components port. `value` is a number attribute (absent
 * is null: no data); `factors` and `bands` are json attributes, set here as
 * properties because they come from oeeFromCounts().
 */

type GaugeEl = HTMLElement & Record<string, unknown>;

// 480 min planned, 420 run, ideal 1 min/part, 380 made, 361 good.
const shift = oeeFromCounts({ plannedTime: 480, runTime: 420, idealCycleTime: 1, totalCount: 380, goodCount: 361 });
const neverRan = oeeFromCounts({ plannedTime: 480, runTime: 0, idealCycleTime: 1, totalCount: 0, goodCount: 0 });
const overspeed = oeeFromCounts({ plannedTime: 480, runTime: 450, idealCycleTime: 1.5, totalCount: 340, goodCount: 330 });

const gauge = (props: Record<string, unknown>): GaugeEl => {
  const el = document.createElement("zen-oee-gauge") as GaugeEl;
  for (const [key, value] of Object.entries(props)) {
    if (value !== undefined) el[key] = value;
  }
  return el;
};

const row = (alignItems: string, ...children: Node[]): HTMLElement => {
  const div = document.createElement("div");
  Object.assign(div.style, { display: "flex", flexWrap: "wrap", gap: "32px", alignItems });
  div.append(...children);
  return div;
};

export default function OeeGaugeDemo(): HTMLElement {
  return DemoPage({
    title: "OeeGauge",
    description:
      "Overall Equipment Effectiveness as a half-circle gauge: Availability × Performance × Quality. The number is always printed and the band always named in words, so the colour repeats them rather than carrying them alone.",
    sections: [
      {
        title: "1. The three bands, and no data",
        codeTitle: "value is a fraction; null means nothing to show",
        codeDescription:
          "The ring outside the track marks where the bands change. null draws an empty track and a dash — never a 0, which would read as the worst shift of the year for one nobody measured.",
        code: `<zen-oee-gauge value="0.52"></zen-oee-gauge>
<zen-oee-gauge value="0.724"></zen-oee-gauge>
<zen-oee-gauge value="0.88"></zen-oee-gauge>
<zen-oee-gauge></zen-oee-gauge>   <!-- no value: null, no data -->`,
        render: () =>
          row(
            "flex-start",
            gauge({ value: 0.52 }),
            gauge({ value: 0.724 }),
            gauge({ value: 0.88 }),
            gauge({ value: null }),
          ),
      },
      {
        title: "2. From counts and times",
        codeTitle: "oeeFromCounts gives OEE and its factors; pass both",
        code: `import { oeeFromCounts } from "@algorisys/zen-ui-web-components";

const r = oeeFromCounts({
  plannedTime: 480,   // minutes scheduled
  runTime: 420,       // minutes it actually ran
  idealCycleTime: 1,  // fastest minutes per part
  totalCount: 380,
  goodCount: 361,
});

const gauge = document.querySelector("zen-oee-gauge"); // <zen-oee-gauge label="Press 4">
gauge.value = r.oee;
gauge.factors = r;`,
        render: () => row("flex-start", gauge({ label: "Press 4", value: shift.oee, factors: shift })),
      },
      {
        title: "3. What it will not hide",
        codeTitle: "unknown factors are dashes; Performance over 100% is printed as it is",
        codeDescription:
          "A machine that never ran has an OEE of 0 but no Performance or Quality — there was no run to measure. On the right, the ideal cycle time is set slower than the machine really runs, so Performance reads 113% and OEE an impossible 103%. The gauge fills its arc and prints both as they are, rather than clamping to 100%, because those numbers are how anyone finds the bad master data.",
        code: `oeeFromCounts({ plannedTime: 480, runTime: 0, idealCycleTime: 1, totalCount: 0, goodCount: 0 });
// { availability: 0, performance: null, quality: null, oee: 0 }`,
        render: () =>
          row(
            "flex-start",
            gauge({ label: "Never ran", value: neverRan.oee, factors: neverRan }),
            gauge({ label: "Ideal cycle too slow", value: overspeed.oee, factors: overspeed }),
          ),
      },
      {
        title: "4. Sizes",
        codeTitle: "sm for a tile, md by default, lg for a wall board",
        code: `<zen-oee-gauge size="sm" value="0.724"></zen-oee-gauge>
<zen-oee-gauge size="lg" value="0.724"></zen-oee-gauge>`,
        render: () =>
          row(
            "flex-end",
            gauge({ size: "sm", value: 0.724 }),
            gauge({ size: "md", value: 0.724 }),
            gauge({ size: "lg", value: 0.724 }),
          ),
      },
      {
        title: "5. A plant's own targets",
        codeTitle: "bands moves where near and on target start",
        codeDescription:
          "85% and 65% are the figures usually quoted, not a standard. The same 72.4% is on target for a plant whose goal is 70%.",
        code: `<zen-oee-gauge value="0.724" bands='{"fair":0.55,"good":0.7}'></zen-oee-gauge>`,
        render: () =>
          row(
            "flex-start",
            gauge({ label: "Default targets", value: 0.724 }),
            gauge({ label: "Target 70%", value: 0.724, bands: { fair: 0.55, good: 0.7 } }),
          ),
      },
    ],
  });
}
