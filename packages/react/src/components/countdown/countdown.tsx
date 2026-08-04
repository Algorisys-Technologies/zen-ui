import * as React from "react";
import {
  remainingMs,
  formatCountdown,
  countdownLevel,
  crossedThresholds,
  DEFAULT_COUNTDOWN_THRESHOLDS,
  type CountdownLevel,
} from "@algorisys/zen-ui-core";
import { cn } from "../../lib/cn";

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

const LEVEL_TEXT: Record<CountdownLevel, string> = {
  normal: "zen-text-zen-foreground",
  warning: "zen-text-zen-warning",
  critical: "zen-text-zen-error",
  expired: "zen-text-zen-muted-fg",
};

const LEVEL_SOFT: Record<CountdownLevel, string> = {
  normal: "zen-bg-zen-muted zen-text-zen-foreground",
  warning: "zen-bg-zen-warning-soft zen-text-zen-warning-soft-fg",
  critical: "zen-bg-zen-error-soft zen-text-zen-error-soft-fg",
  expired: "zen-bg-zen-muted zen-text-zen-muted-fg",
};

/** How often the display re-reads the clock. One second is what a countdown needs. */
const TICK_MS = 1000;

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

/**
 * The shared clock. A single interval per component, reading the deadline each
 * tick rather than accumulating, and re-reading immediately on wake.
 */
const useCountdown = ({ deadline, thresholds, onExpire, onThreshold, paused }: CountdownCore) => {
  const marks = thresholds ?? DEFAULT_COUNTDOWN_THRESHOLDS;
  const [ms, setMs] = React.useState(() => remainingMs(deadline, Date.now()));

  /* Held in refs so changing a handler does not restart the interval — a
     caller who passes an inline arrow would otherwise re-subscribe every
     render and could miss the tick that crosses a threshold. */
  const onExpireRef = React.useRef(onExpire);
  const onThresholdRef = React.useRef(onThreshold);
  onExpireRef.current = onExpire;
  onThresholdRef.current = onThreshold;

  const firedExpiry = React.useRef(false);
  const previous = React.useRef(ms);

  React.useEffect(() => {
    /* A new deadline is a new countdown, including one that has already run. */
    firedExpiry.current = false;
    previous.current = remainingMs(deadline, Date.now());
    setMs(previous.current);
  }, [deadline]);

  React.useEffect(() => {
    if (paused) return;

    const read = () => {
      const next = remainingMs(deadline, Date.now());
      const passed = crossedThresholds(previous.current, next, marks);
      previous.current = next;
      setMs(next);

      for (const mark of passed) onThresholdRef.current?.(mark);
      if (next <= 0 && !firedExpiry.current) {
        firedExpiry.current = true;
        onExpireRef.current?.();
      }
    };

    read();
    const id = setInterval(read, TICK_MS);
    /* A tab returning from the background is the case a plain interval gets
       wrong; reading on wake means the first thing the user sees is correct. */
    const onVisible = () => {
      if (!document.hidden) read();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [deadline, paused, marks]);

  return { ms, level: countdownLevel(ms, marks), text: formatCountdown(ms) };
};

export interface TimerBadgeProps extends CountdownCore {
  /** Shown before the figure — "Time left". Omit for the bare clock. */
  label?: React.ReactNode;
  /** `"soft"` (default) is a tinted pill; `"bare"` is text only, for a toolbar. */
  variant?: "soft" | "bare";
  size?: "sm" | "md";
  className?: string;
}

export const TimerBadge = ({
  label,
  variant = "soft",
  size = "md",
  className,
  ...core
}: TimerBadgeProps) => {
  const { ms, level, text } = useCountdown(core);

  return (
    <span
      role="timer"
      /*
       * Polite, not assertive. A timer that interrupts a screen reader every
       * second makes the page unusable — the per-second value is for looking
       * at, and the thresholds are what get announced, through onThreshold.
       */
      aria-live="off"
      aria-label={
        typeof label === "string" ? `${label}: ${text} remaining` : `${text} remaining`
      }
      data-level={level}
      className={cn(
        "zen-inline-flex zen-items-center zen-gap-2 zen-font-medium zen-tabular-nums",
        size === "sm" ? "zen-text-xs" : "zen-text-sm",
        variant === "soft" &&
          cn("zen-rounded-zen-full zen-px-3 zen-py-1", LEVEL_SOFT[level]),
        variant === "bare" && LEVEL_TEXT[level],
        /* The last minute pulses. Colour alone fails a colour-blind candidate,
           and this is the one moment the component must not be missable. */
        level === "critical" && "zen-animate-pulse motion-reduce:zen-animate-none",
        className,
      )}
    >
      {label ? <span className="zen-font-normal zen-opacity-80">{label}</span> : null}
      <span className={cn(size === "sm" ? "zen-text-sm" : "zen-text-base", "zen-font-semibold")}>
        {text}
      </span>
      {/* The state in words, for anyone who cannot use the colour. */}
      {level === "critical" && ms > 0 ? (
        <span className="zen-sr-only">Less than a minute remaining</span>
      ) : null}
      {level === "expired" ? <span className="zen-sr-only">Time is up</span> : null}
    </span>
  );
};

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
export const TestCountdownBar = ({
  title,
  children,
  actions,
  sticky = true,
  className,
  ...core
}: TestCountdownBarProps) => {
  const { level } = useCountdown({ ...core, onExpire: undefined, onThreshold: undefined });

  return (
    <header
      data-level={level}
      className={cn(
        "zen-flex zen-w-full zen-flex-wrap zen-items-center zen-gap-3 zen-border-b zen-px-4 zen-py-2",
        "zen-bg-zen-background",
        level === "critical" ? "zen-border-zen-error" : "zen-border-zen-border",
        /* z-30 matches Banner's sticky layer, so two sticky bars in one app
           stack in a predictable order rather than by DOM accident. */
        sticky && "zen-sticky zen-top-0 zen-z-30",
        className,
      )}
    >
      {title ? (
        <span className="zen-truncate zen-text-sm zen-font-medium zen-text-zen-foreground">
          {title}
        </span>
      ) : null}
      {children ? <div className="zen-flex zen-min-w-0 zen-items-center zen-gap-3">{children}</div> : null}
      <div className="zen-ms-auto zen-flex zen-items-center zen-gap-2">
        {/* The one that owns the callbacks, so they fire once rather than twice. */}
        <TimerBadge label="Time left" {...core} />
        {actions}
      </div>
    </header>
  );
};
