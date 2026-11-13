import { DemoPage } from "./demo-helpers";

/**
 * Every chart below is a <zen-planned-vs-actual>, bound with PROPERTIES for the
 * point arrays and moments (epoch numbers already) and attributes for the plain
 * values. The code examples are the hand-written markup, where the json
 * attributes carry ISO strings and the element revives them.
 */
type PvaEl = HTMLElement & Record<string, unknown>;

const pva = (testid: string, props: Record<string, unknown>): PvaEl => {
  const el = document.createElement("zen-planned-vs-actual") as PvaEl;
  el.setAttribute("data-testid", testid);
  for (const [key, value] of Object.entries(props)) {
    if (value !== undefined) el[key] = value;
  }
  return el;
};

// The 13th's morning shift in Pune, 06:00–14:00 IST, seen at 10:30.
const START = Date.UTC(2026, 10, 13, 0, 30);
const END = START + 8 * 3_600_000;
const NOW = START + 4.5 * 3_600_000;
const M = 60_000;
// A counter read every 20 minutes, with a 25-minute stop after 08:00.
const readings = [20, 40, 60, 80, 100, 120, 140, 160, 180, 200, 220, 240, 260].map((min, i) => ({
  at: START + min * M,
  value: [64, 130, 196, 262, 330, 330, 351, 412, 480, 548, 615, 680, 744][i],
}));
// A plan with a 30-minute break from 10:00.
const plan = [
  { at: START, value: 0 },
  { at: START + 4 * 60 * M, value: 1000 },
  { at: START + 4.5 * 60 * M, value: 1000 },
  { at: END, value: 1875 },
];
// A whole shift read every half hour, finishing 120 short.
const finalShift = Array.from({ length: 16 }, (_, i) => ({ at: START + (i + 1) * 30 * M, value: Math.round(117.5 * (i + 1)) }));
const onPlan = [{ at: NOW - M, value: 1110 }];
const ahead = [{ at: NOW - M, value: 1240 }];
const early = [{ at: START + 45 * M, value: 160 }];

export default function PlannedVsActualDemo(): HTMLElement {
  return DemoPage({
    title: "PlannedVsActual",
    description:
      "Pieces made this shift against the plan. The headline is the gap in words; under it, what was made against what was planned so far, and where the pace will end up.",
    sections: [
      {
        title: "1. A shift in progress",
        codeTitle: "start, end, a plan, and counter readings",
        codeDescription:
          "The plan is dashed over the whole shift and stands still through the 10:00 break. The actual is drawn as steps — a counter reading holds until the next one — and stops at now; the stop after 08:00 shows as a flat step. The red bar at now is the gap.",
        code: `<zen-planned-vs-actual
  start="2026-11-13T00:30:00Z" end="2026-11-13T08:30:00Z"
  plan='[{ "at": "2026-11-13T00:30:00Z", "value": 0 }, { "at": "2026-11-13T04:30:00Z", "value": 1000 },
         { "at": "2026-11-13T05:00:00Z", "value": 1000 }, { "at": "2026-11-13T08:30:00Z", "value": 1875 }]'
  actual='[{ "at": "…", "value": 64 }, …]'
  unit="pcs" time-zone="Asia/Kolkata"
></zen-planned-vs-actual>`,
        render: () =>
          pva("mid", { start: START, end: END, now: NOW, plan, actual: readings, unit: "pcs", timeZone: "Asia/Kolkata" }),
      },
      {
        title: "2. On plan, ahead, early and final",
        codeTitle: "plan-total spreads evenly; tolerance keeps one piece from flipping the headline",
        code: `<zen-planned-vs-actual plan-total="2000" …></zen-planned-vs-actual>`,
        render: () => {
          // The React demo's previewStyle: one column, 32px apart.
          const stack = document.createElement("div");
          stack.className = "zen-grid zen-w-full zen-gap-8";
          const common = { start: START, end: END, planTotal: 2000, unit: "pcs", timeZone: "Asia/Kolkata" };
          stack.append(
            pva("on", { ...common, now: NOW, actual: onPlan, hideChart: true }),
            pva("ahead", { ...common, now: NOW, actual: ahead, hideChart: true }),
            pva("early", { ...common, now: START + 50 * M, actual: early, hideChart: true }),
            pva("final", { ...common, now: END + 10 * M, actual: finalShift }),
          );
          return stack;
        },
      },
    ],
  });
}
