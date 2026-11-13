import * as React from "react";
import { type CountdownLevel } from "../../_core/index";
/**
 * TimerBadge and TestCountdownBar — how long is left, and what that means.
 *
 *   <TimerBadge deadline={endsAt} onExpire={submit} />
 *   <TestCountdownBar deadline={endsAt} title="Kata 3" sticky onExpire={submit} />
 *
 * Both take a DEADLINE, not a duration. A component that decrements a number on
 * an interval runs slow in a throttled background tab — the candidate sees more
 * time than they have and the server disagrees at submission. `deadline - now`
 * cannot drift, so a tab that wakes after two minutes asleep shows the truth
 * immediately rather than catching up.
 *
 * The maths is `@algorisys/zen-ui-core/countdown`, shared with every binding and
 * pinned by scripts/check-countdown.ts.
 *
 * Neither owns submission. `onExpire` fires once and hands control back: what to
 * submit, and how, is application logic that differs per assessment type, and a
 * component that guessed at it would be wrong for every caller but one.
 */
export type { CountdownLevel };
interface CountdownCore {
    /** Epoch milliseconds. */
    deadline: number;
    /**
     * Seconds remaining at which to escalate, `[warning, critical]`. Defaults to
     * `[300, 60]`.
     */
    thresholds?: readonly number[];
    /** Fires ONCE when the deadline passes. Submission is yours. */
    onExpire?: () => void;
    /** Fires once per threshold crossed, going down. For a toast or an announcement. */
    onThreshold?: (seconds: number) => void;
    /** Stop the clock without unmounting — for a paused or already-submitted test. */
    paused?: boolean;
}
export interface TimerBadgeProps extends CountdownCore {
    /** Shown before the figure — "Time left". Omit for the bare clock. */
    label?: React.ReactNode;
    /** `"soft"` (default) is a tinted pill; `"bare"` is text only, for a toolbar. */
    variant?: "soft" | "bare";
    size?: "sm" | "md";
    className?: string;
}
export declare const TimerBadge: ({ label, variant, size, className, ...core }: TimerBadgeProps) => React.JSX.Element;
export interface TestCountdownBarProps extends CountdownCore {
    /** What is being timed — the test or question name. */
    title?: React.ReactNode;
    /** Progress, question counter, anything else that belongs beside the clock. */
    children?: React.ReactNode;
    /** Actions on the right: submit, save, request more time. */
    actions?: React.ReactNode;
    /** Pin to the top of the scroll container. Default `true`. */
    sticky?: boolean;
    className?: string;
}
/**
 * The bar an assessment runs under. It is a `<header>` with the timer, whatever
 * the app wants beside it, and its actions — no submission logic of its own.
 */
export declare const TestCountdownBar: ({ title, children, actions, sticky, className, ...core }: TestCountdownBarProps) => React.JSX.Element;
//# sourceMappingURL=countdown.d.ts.map