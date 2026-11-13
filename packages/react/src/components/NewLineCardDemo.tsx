import type * as React from "react";
import { LineCard } from "./line-card/line-card";
import { CodeExample } from "./demo-helpers";

// 10:30 in Pune.
const NOW = Date.UTC(2026, 10, 13, 5, 0);
const M = 60_000;
const GRID: React.CSSProperties = {
  display: "grid",
  gap: "12px",
  width: "100%",
  alignItems: "stretch",
  gridTemplateColumns: "repeat(auto-fill, minmax(min(18rem, 100%), 1fr))",
};

const NewLineCardDemo: React.FC = () => (
  <div className="demo-page">
    <h1>LineCard</h1>
    <p className="lede">
      One production line at a glance. The last line answers what a supervisor scanning a
      wall of these is asking: when will it finish — or, if it is not moving, what it is
      doing instead, for how long, and why. Never an ETA from a rate the line is not making.
    </p>

    <section className="demo-section">
      <h2>1. A plant's lines</h2>
      <CodeExample
        title="state, the order, a rate; href makes the card a link"
        code={`<LineCard
  name="Line A" href="/lines/a"
  state="running" since={stateSince}
  order={{ code: "WO-10042", product: "Bracket", target: 500, good: 361, scrap: 19 }}
  perHour={278} oee={0.72} timeZone="Asia/Kolkata"
/>`}
        previewStyle={GRID}
      >
        <LineCard name="Line A" href="#line-a" now={NOW} timeZone="Asia/Kolkata" state="running" since={NOW - 50 * M} perHour={278} oee={0.72}
          order={{ code: "WO-10042", product: "Bracket", target: 500, good: 361, scrap: 19 }} />
        <LineCard name="Line B" href="#line-b" now={NOW} timeZone="Asia/Kolkata" state="fault" since={NOW - 23 * M} cause="Hydraulic pressure low" perHour={240} oee={0.48}
          order={{ code: "WO-10051", product: "Hinge plate", target: 800, good: 412, scrap: 6 }} />
        <LineCard name="Line C" href="#line-c" now={NOW} timeZone="Asia/Kolkata" state="setup" since={NOW - 11 * M} cause="Changeover to SKU 4471"
          order={{ code: "WO-10060", product: "Cover", target: 1200, good: 0 }} />
        <LineCard name="Line D" href="#line-d" now={NOW} timeZone="Asia/Kolkata" state="running" since={NOW - 3 * M}
          order={{ code: "WO-10063", product: "Spacer", target: 300, good: 4 }} />
        <LineCard name="Line E" href="#line-e" now={NOW} timeZone="Asia/Kolkata" state="idle" since={NOW - 40 * M}
          order={{ code: "WO-10044", product: "Bracket", target: 500, good: 500, scrap: 7 }} />
        <LineCard name="Line F" href="#line-f" now={NOW} timeZone="Asia/Kolkata" state="unknown" since={NOW - 5 * M - 12_000} />
      </CodeExample>
    </section>
  </div>
);

export default NewLineCardDemo;
