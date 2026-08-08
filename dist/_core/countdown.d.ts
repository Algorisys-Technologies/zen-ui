/**
 * Exam countdown maths — the pure half of TimerBadge and TestCountdownBar.
 *
 * It works from a DEADLINE, not a duration it decrements. Decrementing a number
 * on an interval is the obvious implementation and it is wrong in a way nobody
 * notices until it matters: a background tab is throttled, the interval fires
 * late, and the countdown runs slow. The candidate sees more time than they
 * have, the server disagrees, and the disagreement surfaces as a submission
 * rejected for being late. `deadline - now` cannot drift, however badly the
 * timer that asks for it is throttled.
 *
 * `now` is always a parameter rather than read from the clock, which is what
 * makes every case in scripts/check-countdown.ts reproducible instead of
 * something you wait an hour to observe.
 */
/** What the remaining time means, for styling and for announcements. */
export type CountdownLevel = "normal" | "warning" | "critical" | "expired";
/**
 * Seconds remaining at which to escalate: [warning, critical].
 *
 * These are the two marks the assessment app this was built against already
 * warns at — a 5-minute and a 1-minute toast. They are defaults rather than
 * invention for that reason.
 */
export declare const DEFAULT_COUNTDOWN_THRESHOLDS: readonly number[];
/** Never negative: past the deadline is zero, and zero is a state of its own. */
export declare const remainingMs: (deadline: number, now: number) => number;
/**
 * `mm:ss`, growing an hours field only when there is one — `59:59` then
 * `1:00:00`, never `60:00`.
 *
 * Part-seconds round UP. With truncation, 900ms left displays `00:00` for most
 * of a second while the form still accepts input, and a candidate looking at
 * zero on a live form trusts neither the clock nor the form.
 */
export declare const formatCountdown: (ms: number) => string;
/**
 * The band the remaining time falls in.
 *
 * Thresholds are inclusive going down — landing exactly on the 5-minute mark IS
 * the warning, not the last moment before it. The alternative reads as the
 * warning being one second late, which is exactly the second it matters.
 */
export declare const countdownLevel: (ms: number, thresholds?: readonly number[]) => CountdownLevel;
/**
 * Which thresholds were passed between two readings, going DOWN.
 *
 * Announcing on `remaining === 300` misses the mark whenever a tick skips that
 * exact second, which a throttled tab does routinely — so the 5-minute warning
 * simply never fires. Comparing two readings catches every mark in the gap, and
 * catches all of them when a tab wakes up after a long sleep.
 *
 * Going back up fires nothing: time is not supposed to run backwards, and if it
 * does (a clock correction, a resumed session) re-announcing "5 minutes
 * remaining" is worse than staying quiet.
 */
export declare const crossedThresholds: (previousMs: number, currentMs: number, thresholds?: readonly number[]) => number[];
