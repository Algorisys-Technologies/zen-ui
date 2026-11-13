import { RateBars } from "./rate-bars/rate-bars";
import { CodeExample } from "./demo-helpers";

// The last hour on Press 4, seen at 10:30 IST: about 300 an hour, a slow
// stretch, a 6-minute stop, and the current bucket half full.
const M = 60_000;
const TO = Date.UTC(2026, 10, 13, 5, 0);
const FROM = TO - 60 * M;
const NOW = TO - M;
const perMinute = (m: number) => (m >= 22 && m < 28 ? 0 : m >= 36 && m < 44 ? 3 : 5);
const readings: { at: number; value: number }[] = [];
for (let m = 0, v = 0; m <= 59; m++) {
  readings.push({ at: FROM + m * M, value: v });
  v += perMinute(m);
}
const segments = [
  { state: "running" as const, start: FROM, end: FROM + 22 * M },
  { state: "stopped" as const, start: FROM + 22 * M, end: FROM + 28 * M },
  { state: "running" as const, start: FROM + 28 * M, end: null },
];

const NewRateBarsDemo: React.FC = () => (
  <div className="demo-page">
    <h1>RateBars</h1>
    <p className="lede">
      Output in equal time buckets, each bar coloured by what the machine was doing. A dip
      reads at a glance: a short green bar ran slow, a red stub stopped.
    </p>

    <section className="demo-section">
      <h2>1. The last hour</h2>
      <CodeExample
        title="counter readings, the state record, a bucket width and a target"
        description="Two-minute buckets. The stop at 09:52 is a red stub — a bucket that made nothing still says why. The slow stretch after 10:06 is short green bars under the dashed target. The last bar is still filling, so it is hatched and its rate is over the minute elapsed, not the whole bucket."
        code={`<RateBars
  readings={counter} segments={stateRecord}
  from={hourAgo} to={now} bucketMs={2 * 60_000}
  target={300} unit="pcs" timeZone="Asia/Kolkata"
/>`}
      >
        <RateBars readings={readings} segments={segments} from={FROM} to={TO} now={NOW} target={300} unit="pcs" timeZone="Asia/Kolkata" data-testid="hour" />
      </CodeExample>
    </section>
  </div>
);

export default NewRateBarsDemo;
