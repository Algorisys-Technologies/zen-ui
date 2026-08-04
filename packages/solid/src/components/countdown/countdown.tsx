import { createSignal, createEffect, onCleanup, Show, type JSX } from "solid-js";
import {
  remainingMs,
  formatCountdown,
  countdownLevel,
  crossedThresholds,
  DEFAULT_COUNTDOWN_THRESHOLDS,
  type CountdownLevel,
} from "@algorisys/zen-ui-core/countdown";
import { cn } from "../../lib/cn";

/**
 * TimerBadge and TestCountdownBar — how long is left, and what that means.
 *
 *   <TimerBadge deadline={endsAt()} onExpire={submit} />
 *   <TestCountdownBar deadline={endsAt()} title="Kata 3" sticky onExpire={submit} />
 *
 * Both take a DEADLINE, not a duration. A component that decrements a number on
 * an interval runs slow in a throttled background tab — the candidate sees more
 * time than they have and the server disagrees at submission. `deadline - now`
 * cannot drift, so a tab that wakes after two minutes asleep shows the truth
 * immediately rather than catching up.
 *
 * The maths is `@algorisys/zen-ui-core/countdown`, shared with React and pinned
 * by scripts/check-countdown.ts. This file owns the DOM and the clock.
 *
 * Neither owns submission. `onExpire` fires once and hands control back.
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

const TICK_MS = 1000;

export interface CountdownCoreProps {
  /** Epoch milliseconds. */
  deadline: number;
  /** Seconds remaining at which to escalate, `[warning, critical]`. Default `[300, 60]`. */
  thresholds?: readonly number[];
  /** Fires ONCE when the deadline passes. Submission is yours. */
  onExpire?: () => void;
  /** Fires once per threshold crossed, going down. */
  onThreshold?: (seconds: number) => void;
  /** Stop the clock without unmounting. */
  paused?: boolean;
}

/**
 * The shared clock.
 *
 * Reads `props` inside the effect rather than destructuring at setup — in Solid
 * a destructured prop is a snapshot, so a caller who changes `deadline` would
 * be timing the old one forever. That is the porting hazard here, and it is
 * invisible until someone extends a test.
 */
const useCountdown = (props: CountdownCoreProps) => {
  const marks = () => props.thresholds ?? DEFAULT_COUNTDOWN_THRESHOLDS;
  /* The INITIAL reading only. The effect below re-reads the deadline and resets
     this, so tracking it here would build a second reactive path to the same
     value — and the untracked read is what makes the first paint correct rather
     than a frame of "00:00". */
  // eslint-disable-next-line solid/reactivity
  const [ms, setMs] = createSignal(remainingMs(props.deadline, Date.now()));

  let firedExpiry = false;
  /* Seeded once; every tick writes it. Not reactive by design — it is the
     PREVIOUS reading, and a tracked one would always equal the current. */
  // eslint-disable-next-line solid/reactivity
  let previous = ms();

  createEffect(() => {
    const deadline = props.deadline;
    const paused = props.paused ?? false;

    /* A new deadline is a new countdown, including one that has already run. */
    firedExpiry = false;
    previous = remainingMs(deadline, Date.now());
    setMs(previous);
    if (paused) return;

    const read = () => {
      const next = remainingMs(deadline, Date.now());
      const passed = crossedThresholds(previous, next, marks());
      previous = next;
      setMs(next);

      for (const mark of passed) props.onThreshold?.(mark);
      if (next <= 0 && !firedExpiry) {
        firedExpiry = true;
        props.onExpire?.();
      }
    };

    const id = setInterval(read, TICK_MS);
    /* A tab returning from the background is the case a plain interval gets
       wrong; reading on wake means the first thing the user sees is correct. */
    const onVisible = () => {
      if (!document.hidden) read();
    };
    document.addEventListener("visibilitychange", onVisible);

    onCleanup(() => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    });
  });

  return {
    ms,
    level: () => countdownLevel(ms(), marks()),
    text: () => formatCountdown(ms()),
  };
};

export interface TimerBadgeProps extends CountdownCoreProps {
  /** Shown before the figure — "Time left". Omit for the bare clock. */
  label?: JSX.Element;
  /** `"soft"` (default) is a tinted pill; `"bare"` is text only. */
  variant?: "soft" | "bare";
  size?: "sm" | "md";
  class?: string;
}

export const TimerBadge = (props: TimerBadgeProps) => {
  const clock = useCountdown(props);
  const variant = () => props.variant ?? "soft";
  const size = () => props.size ?? "md";

  return (
    <span
      role="timer"
      /* Polite, not assertive. A timer that interrupts a screen reader every
         second makes the page unusable — the per-second value is for looking
         at, and the thresholds are what get announced, via onThreshold. */
      aria-live="off"
      aria-label={
        typeof props.label === "string"
          ? `${props.label}: ${clock.text()} remaining`
          : `${clock.text()} remaining`
      }
      data-level={clock.level()}
      class={cn(
        "zen-inline-flex zen-items-center zen-gap-2 zen-font-medium zen-tabular-nums",
        size() === "sm" ? "zen-text-xs" : "zen-text-sm",
        variant() === "soft" &&
          cn("zen-rounded-zen-full zen-px-3 zen-py-1", LEVEL_SOFT[clock.level()]),
        variant() === "bare" && LEVEL_TEXT[clock.level()],
        /* The last minute pulses. Colour alone fails a colour-blind candidate,
           and this is the one moment the component must not be missable. */
        clock.level() === "critical" && "zen-animate-pulse motion-reduce:zen-animate-none",
        props.class,
      )}
    >
      <Show when={props.label}>
        <span class="zen-font-normal zen-opacity-80">{props.label}</span>
      </Show>
      <span class={cn(size() === "sm" ? "zen-text-sm" : "zen-text-base", "zen-font-semibold")}>
        {clock.text()}
      </span>
      {/* The state in words, for anyone who cannot use the colour. */}
      <Show when={clock.level() === "critical" && clock.ms() > 0}>
        <span class="zen-sr-only">Less than a minute remaining</span>
      </Show>
      <Show when={clock.level() === "expired"}>
        <span class="zen-sr-only">Time is up</span>
      </Show>
    </span>
  );
};

export interface TestCountdownBarProps extends CountdownCoreProps {
  /** What is being timed — the test or question name. */
  title?: JSX.Element;
  /** Progress, question counter, anything else beside the clock. */
  children?: JSX.Element;
  /** Actions on the right. */
  actions?: JSX.Element;
  /** Pin to the top of the scroll container. Default `true`. */
  sticky?: boolean;
  class?: string;
}

export const TestCountdownBar = (props: TestCountdownBarProps) => {
  /* A second clock purely for the border colour. It is deliberately given no
     callbacks, so onExpire and onThreshold fire exactly once — from the badge. */
  const clock = useCountdown({
    get deadline() {
      return props.deadline;
    },
    get thresholds() {
      return props.thresholds;
    },
    get paused() {
      return props.paused;
    },
  });

  return (
    <header
      data-level={clock.level()}
      class={cn(
        "zen-flex zen-w-full zen-flex-wrap zen-items-center zen-gap-3 zen-border-b zen-px-4 zen-py-2",
        "zen-bg-zen-background",
        clock.level() === "critical" ? "zen-border-zen-error" : "zen-border-zen-border",
        /* z-30 matches Banner's sticky layer, so two sticky bars in one app
           stack predictably rather than by DOM accident. */
        (props.sticky ?? true) && "zen-sticky zen-top-0 zen-z-30",
        props.class,
      )}
    >
      <Show when={props.title}>
        <span class="zen-truncate zen-text-sm zen-font-medium zen-text-zen-foreground">
          {props.title}
        </span>
      </Show>
      <Show when={props.children}>
        <div class="zen-flex zen-min-w-0 zen-items-center zen-gap-3">{props.children}</div>
      </Show>
      <div class="zen-ms-auto zen-flex zen-items-center zen-gap-2">
        <TimerBadge label="Time left" {...props} />
        {props.actions}
      </div>
    </header>
  );
};
