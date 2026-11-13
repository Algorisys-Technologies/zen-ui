import { useState } from "react";
import { ShiftNavigator } from "./shift-navigator/shift-navigator";
import type { ShiftDef, ShiftRef } from "@algorisys/zen-ui-core/shifts";
import { CodeExample } from "./demo-helpers";

const three: ShiftDef[] = [
  { id: "A", start: "06:00", end: "14:00", label: "Morning" },
  { id: "B", start: "14:00", end: "22:00", label: "Afternoon" },
  { id: "C", start: "22:00", end: "06:00", label: "Night" },
];
// A pinned clock: 13 Nov 2026, 03:00 in Pune — inside the 12th's night shift.
const NOW = Date.UTC(2026, 10, 12, 21, 30);

const NewShiftNavigatorDemo: React.FC = () => {
  const [shift, setShift] = useState<ShiftRef>();
  const [span, setSpan] = useState<{ start: number; end: number }>();
  return (
    <div className="demo-page">
      <h1>ShiftNavigator</h1>
      <p className="lede">
        Step through a plant's shifts — previous, next, back to now — in the plant's own
        timezone. Every shift report, board and chart is read one shift at a time, and this
        is the control that picks it.
      </p>

      <section className="demo-section">
        <h2>1. Three shifts in Pune</h2>
        <CodeExample
          title="shifts, timeZone, value / onChange"
          description={`The clock is pinned at 03:00 on the 13th, which is the 12th's night shift: a night shift belongs to the day it starts. Next is disabled at the current shift — later shifts have no data yet. Go back and "Current shift" returns.`}
          code={`<ShiftNavigator
  shifts={[
    { id: "A", start: "06:00", end: "14:00", label: "Morning" },
    { id: "B", start: "14:00", end: "22:00", label: "Afternoon" },
    { id: "C", start: "22:00", end: "06:00", label: "Night" },
  ]}
  timeZone="Asia/Kolkata"
  value={shift}
  onChange={(ref, window) => setShift(ref)}
/>`}
        >
          <div className="zen-flex zen-flex-col zen-gap-3">
            <ShiftNavigator
              shifts={three}
              timeZone="Asia/Kolkata"
              now={NOW}
              value={shift}
              onChange={(ref, w) => {
                setShift(ref);
                setSpan(w);
              }}
              data-testid="pune"
            />
            <p className="zen-m-0 zen-text-sm zen-tabular-nums" data-testid="pune-out">
              onChange:{" "}
              {shift
                ? `${shift.id} on ${shift.day} · ${new Date(span?.start ?? 0).toISOString()} → ${new Date(span?.end ?? 0).toISOString()}`
                : "—"}
            </p>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>2. Planning ahead</h2>
        <CodeExample
          title="allowFuture lets next go past now"
          code={`<ShiftNavigator shifts={shifts} timeZone="Asia/Kolkata" allowFuture />`}
        >
          <ShiftNavigator shifts={three} timeZone="Asia/Kolkata" now={NOW} allowFuture data-testid="future" />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>3. The clocks going back</h2>
        <CodeExample
          title="a shift keeps its wall-clock times; its length changes"
          description="Berlin's night shift starting 24 October 2026 runs 22:00 to 06:00 — nine hours, because the clocks go back at 03:00."
          code={`<ShiftNavigator shifts={shifts} timeZone="Europe/Berlin" defaultValue={{ id: "C", day: "2026-10-24" }} />`}
        >
          <ShiftNavigator
            shifts={three}
            timeZone="Europe/Berlin"
            now={Date.UTC(2026, 10, 1)}
            defaultValue={{ id: "C", day: "2026-10-24" }}
            data-testid="berlin"
          />
        </CodeExample>
      </section>
    </div>
  );
};

export default NewShiftNavigatorDemo;
