import { PlannedVsActual } from "./planned-vs-actual/planned-vs-actual";
import { CodeExample } from "./demo-helpers";

// The 13th's morning shift in Pune, 06:00–14:00 IST, seen at 10:30.
const START = Date.UTC(2026, 10, 13, 0, 30);
const END = START + 8 * 3_600_000;
const NOW = START + 4.5 * 3_600_000;
const M = 60_000;
// A counter read every 20 minutes, with a 25-minute stop after 08:00.
const readings = [
  20, 40, 60, 80, 100, 120, 140, 160, 180, 200, 220, 240, 260,
].map((min, i) => ({ at: START + min * M, value: [64, 130, 196, 262, 330, 330, 351, 412, 480, 548, 615, 680, 744][i] }));
// A plan with a 30-minute break from 10:00.
const plan = [
  { at: START, value: 0 },
  { at: START + 4 * 60 * M, value: 1000 },
  { at: START + 4.5 * 60 * M, value: 1000 },
  { at: END, value: 1875 },
];
// A whole shift read every half hour, finishing 120 short.
const finalShift = Array.from({ length: 16 }, (_, i) => ({ at: START + (i + 1) * 30 * M, value: Math.round(117.5 * (i + 1)) }));
const STACK = { display: "grid", gap: "32px", width: "100%" } as const;
// Fixed at module scope so each render passes the same arrays.
const onPlan = [{ at: NOW - M, value: 1110 }];
const ahead = [{ at: NOW - M, value: 1240 }];
const early = [{ at: START + 45 * M, value: 160 }];

const NewPlannedVsActualDemo: React.FC = () => (
  <div className="demo-page">
    <h1>PlannedVsActual</h1>
    <p className="lede">
      Pieces made this shift against the plan. The headline is the gap in words; under it,
      what was made against what was planned so far, and where the pace will end up.
    </p>

    <section className="demo-section">
      <h2>1. A shift in progress</h2>
      <CodeExample
        title="start, end, a plan, and counter readings"
        description="The plan is dashed over the whole shift and stands still through the 10:00 break. The actual is drawn as steps — a counter reading holds until the next one — and stops at now; the stop after 08:00 shows as a flat step. The red bar at now is the gap."
        code={`<PlannedVsActual
  start={shift.start} end={shift.end}
  plan={[{ at: start, value: 0 }, { at: tenAm, value: 1000 },
         { at: tenThirty, value: 1000 }, { at: end, value: 1875 }]}
  actual={counterReadings}
  unit="pcs" timeZone="Asia/Kolkata"
/>`}
      >
        <PlannedVsActual start={START} end={END} now={NOW} plan={plan} actual={readings} unit="pcs" timeZone="Asia/Kolkata" data-testid="mid" />
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>2. On plan, ahead, early and final</h2>
      <CodeExample
        title="planTotal spreads evenly; tolerance keeps one piece from flipping the headline"
        code={`<PlannedVsActual planTotal={2000} … />`}
        previewStyle={STACK}
      >
        <PlannedVsActual start={START} end={END} now={NOW} planTotal={2000} actual={onPlan} unit="pcs" timeZone="Asia/Kolkata" hideChart data-testid="on" />
        <PlannedVsActual start={START} end={END} now={NOW} planTotal={2000} actual={ahead} unit="pcs" timeZone="Asia/Kolkata" hideChart data-testid="ahead" />
        <PlannedVsActual start={START} end={END} now={START + 50 * M} planTotal={2000} actual={early} unit="pcs" timeZone="Asia/Kolkata" hideChart data-testid="early" />
        <PlannedVsActual start={START} end={END} now={END + 10 * M} planTotal={2000} actual={finalShift} unit="pcs" timeZone="Asia/Kolkata" data-testid="final" />
      </CodeExample>
    </section>
  </div>
);

export default NewPlannedVsActualDemo;
