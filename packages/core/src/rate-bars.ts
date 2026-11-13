/**
 * Rate bars — the pure half of RateBars.
 *
 *   bun run check:rate-bars
 *
 * Output in equal buckets over a window. A bucket (start, end] counts the
 * counter's rise across it — readings are step values; a reading that goes
 * DOWN is a counter reset, and counts from zero rather than as negative output.
 * Each bucket takes the machine state that covered most of it ("unknown" with
 * none). The bucket containing now is partial: its rate is over the elapsed
 * part only, and it is flagged. Nothing is produced after now.
 */
import { MACHINE_STATES, type MachineState } from "./machine-state";
import type { CountPoint } from "./planned-vs-actual";

type Time = number | Date;
const ms = (t: Time) => (typeof t === "number" ? t : t.getTime());

export interface RateBucket {
  start: number;
  end: number;
  count: number;
  /** Output per hour over the time the bucket covers (elapsed only, if partial). */
  perHour: number;
  state: MachineState;
  /** Contains now: still filling. */
  partial: boolean;
}

export interface RateBucketsInput {
  readings: CountPoint[];
  segments?: { state: MachineState; start: Time; end?: Time | null }[];
  from: Time;
  to: Time;
  bucketMs: number;
  now: Time;
}

export function rateBuckets(i: RateBucketsInput): RateBucket[] {
  const from = ms(i.from);
  const to = ms(i.to);
  const now = ms(i.now);
  if (!(i.bucketMs > 0) || !(to > from)) return [];
  const readings = i.readings.map((p) => ({ at: ms(p.at), value: p.value })).sort((a, b) => a.at - b.at);
  const inForce = (t: number) => {
    let v: number | null = null;
    for (const p of readings) if (p.at <= t) v = p.value;
    return v;
  };
  const out: RateBucket[] = [];
  for (let start = from; start < to && start < now; start += i.bucketMs) {
    const end = Math.min(start + i.bucketMs, to);
    const upto = Math.min(end, now);
    let prev = inForce(start);
    let count = 0;
    for (const p of readings) {
      if (p.at <= start || p.at > upto) continue;
      // The very first reading has nothing before it: it is a baseline, not output.
      if (prev !== null) count += p.value >= prev ? p.value - prev : p.value; // a reset counts from zero
      prev = p.value;
    }
    const covered = upto - start;
    out.push({
      start,
      end,
      count,
      perHour: covered > 0 ? (count / covered) * 3_600_000 : 0,
      state: majorityState(i.segments ?? [], start, upto, now),
      partial: now < end,
    });
  }
  return out;
}

function majorityState(
  segments: NonNullable<RateBucketsInput["segments"]>,
  start: number,
  end: number,
  now: number,
): MachineState {
  const time = new Map<MachineState, number>();
  for (const s of segments) {
    const a = Math.max(ms(s.start), start);
    const b = Math.min(s.end == null ? now : ms(s.end), end);
    if (b > a) time.set(s.state, (time.get(s.state) ?? 0) + (b - a));
  }
  let best: MachineState = "unknown";
  let most = 0;
  // Vocabulary order breaks a tie the same way every time.
  for (const st of MACHINE_STATES) {
    const v = time.get(st) ?? 0;
    if (v > most) {
      most = v;
      best = st;
    }
  }
  return best;
}
