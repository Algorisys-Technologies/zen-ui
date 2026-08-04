/**
 * Exam countdown contract.
 *
 *   bun run check:countdown
 *
 * The pure half of TimerBadge and TestCountdownBar. Everything here is
 * arithmetic over a deadline, so it is testable with no clock and no DOM — the
 * caller passes `now`, which is also what makes the component's behaviour at
 * 4:59:59 reproducible instead of a thing you wait an hour to see.
 *
 * It takes a DEADLINE rather than a duration it decrements. The app this was
 * built against decrements a number every 1000ms with no `Date.now()` anchor,
 * so a throttled background tab loses time and the countdown silently runs
 * slow — the candidate gets more than they should and the server disagrees.
 * A deadline cannot drift: the remaining time is always `deadline - now`.
 */
import {
  remainingMs,
  formatCountdown,
  countdownLevel,
  crossedThresholds,
  DEFAULT_COUNTDOWN_THRESHOLDS,
} from "../packages/core/src/countdown";

let f = 0;
const t = (got: unknown, want: unknown, name: string) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) f++;
  console.log(
    `  ${ok ? "ok  " : "FAIL"} ${name.padEnd(58)} ${ok ? "" : `got=${JSON.stringify(got)} want=${JSON.stringify(want)}`}`,
  );
};

const T0 = 1_000_000_000_000;
const s = (n: number) => n * 1000;

console.log("\nremainingMs — a deadline cannot drift");
t(remainingMs(T0 + s(60), T0), s(60), "a minute out");
t(remainingMs(T0, T0), 0, "exactly at the deadline");
t(remainingMs(T0 - s(30), T0), 0, "past the deadline clamps to zero, never negative");
t(remainingMs(T0 + s(3600), T0), s(3600), "an hour out");

console.log("\nformatCountdown");
t(formatCountdown(s(0)), "00:00", "zero");
t(formatCountdown(s(9)), "00:09", "seconds pad");
t(formatCountdown(s(59)), "00:59", "under a minute");
t(formatCountdown(s(60)), "01:00", "a minute");
t(formatCountdown(s(3599)), "59:59", "just under an hour stays mm:ss");
t(formatCountdown(s(3600)), "1:00:00", "an hour grows an hours field rather than 60:00");
t(formatCountdown(s(3661)), "1:01:01", "hours, minutes, seconds");
t(formatCountdown(s(36000)), "10:00:00", "double-digit hours");
/* Rounding UP is deliberate: 59.4s left displayed as 00:59 means the last
   second shows "00:00" for a whole second before the deadline actually passes,
   and a candidate watching zero while the box still accepts input does not
   trust either. */
t(formatCountdown(500), "00:01", "a part second still reads as one second, not zero");
t(formatCountdown(1), "00:01", "…right down to a millisecond");
t(formatCountdown(0), "00:00", "only true zero reads zero");
t(formatCountdown(-5000), "00:00", "negative is zero, not a minus sign");

console.log("\ncountdownLevel — the visual state");
/* Two thresholds, taken from the real app's two warning toasts (300s and 60s)
   rather than invented. Everything above the first is normal. */
t(DEFAULT_COUNTDOWN_THRESHOLDS, [300, 60], "the defaults are the app's own 5-minute and 1-minute marks");
t(countdownLevel(s(600)), "normal", "ten minutes is normal");
t(countdownLevel(s(301)), "normal", "just above the warning mark");
t(countdownLevel(s(300)), "warning", "exactly at the warning mark IS the warning");
t(countdownLevel(s(120)), "warning", "inside the warning band");
t(countdownLevel(s(61)), "warning", "just above the critical mark");
t(countdownLevel(s(60)), "critical", "exactly at the critical mark");
t(countdownLevel(s(1)), "critical", "one second");
t(countdownLevel(0), "expired", "zero is its own state, not merely critical");
t(countdownLevel(-1), "expired", "past the deadline");
t(countdownLevel(s(90), [120, 30]), "warning", "custom thresholds");
t(countdownLevel(s(20), [120, 30]), "critical", "…both of them");
t(countdownLevel(s(500), []), "normal", "no thresholds means it never escalates");

console.log("\ncrossedThresholds — fires once, on the way DOWN only");
/* The warning must fire when the countdown PASSES the mark, exactly once. A
   naive `remaining === 300` misses it whenever a tick skips the exact second,
   which a throttled tab does constantly. */
t(crossedThresholds(s(301), s(300), [300, 60]), [300], "crossing the mark fires it");
t(crossedThresholds(s(400), s(299), [300, 60]), [300], "…even when the tick jumps over it");
t(crossedThresholds(s(400), s(30), [300, 60]), [300, 60], "a big jump fires every mark it passed");
t(crossedThresholds(s(300), s(299), [300, 60]), [], "already at the mark does not re-fire");
t(crossedThresholds(s(299), s(298), [300, 60]), [], "below the mark is silent");
t(crossedThresholds(s(299), s(400), [300, 60]), [], "going back UP fires nothing");
t(crossedThresholds(s(600), s(500), [300, 60]), [], "no mark passed");
t(crossedThresholds(s(61), 0, [300, 60]), [60], "running to zero fires the last mark");
t(crossedThresholds(s(400), s(300), []), [], "no thresholds, nothing to cross");

console.log(f === 0 ? "\nall passed\n" : `\n${f} FAILED\n`);
process.exit(f === 0 ? 0 : 1);
