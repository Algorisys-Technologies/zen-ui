import {
  remainingMs,
  formatCountdown,
  countdownLevel,
  crossedThresholds,
  DEFAULT_COUNTDOWN_THRESHOLDS,
  type CountdownLevel,
} from "@algorisys/zen-ui-core";
import { cn } from "../../lib/cn";
import { applyProps, Disposer, setChildren, toNodes, type BaseProps, type Child, type ZenComponent } from "../../lib/component";

/**
 * TimerBadge and TestCountdownBar — how long is left, and what that means.
 *
 *   TimerBadge({ deadline: endsAt, onExpire: submit }).el
 *   TestCountdownBar({ deadline: endsAt, title: "Kata 3", onExpire: submit }).el
 *
 * Vanilla port; see the React binding for the reasoning. Same API, same output.
 *
 * Both take a DEADLINE, not a duration. A component that decrements a number on
 * an interval runs slow in a throttled background tab — the candidate sees more
 * time than they have and the server disagrees at submission. `deadline - now`
 * cannot drift.
 *
 * The maths is `@algorisys/zen-ui-core/countdown`, shared with every binding and
 * pinned by scripts/check-countdown.ts. This file owns only DOM and a timer.
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

export interface CountdownCore {
  /** Epoch milliseconds. */
  deadline: number;
  /** Seconds remaining at which to escalate, `[warning, critical]`. Default `[300, 60]`. */
  thresholds?: readonly number[];
  /** Fires ONCE when the deadline passes. Submission is yours. */
  onExpire?: () => void;
  /** Fires once per threshold crossed, going down. */
  onThreshold?: (seconds: number) => void;
  /** Stop the clock without destroying — a paused or already-submitted test. */
  paused?: boolean;
}

interface Reading {
  ms: number;
  level: CountdownLevel;
  text: string;
}

/**
 * The clock, as a plain object rather than a hook.
 *
 * `read()` is called on every tick AND on wake. It reads the CURRENT core off a
 * getter rather than closing over it: the factory's `update()` replaces the
 * props object, and a callback that captured the old one would keep counting to
 * the old deadline while the badge showed the new one.
 */
function startCountdown(getCore: () => CountdownCore, onRead: (r: Reading) => void): () => void {
  let firedExpiry = false;
  let lastDeadline = getCore().deadline;
  let previous = remainingMs(lastDeadline, Date.now());
  let timer: ReturnType<typeof setInterval> | undefined;

  const read = () => {
    const core = getCore();
    const marks = core.thresholds ?? DEFAULT_COUNTDOWN_THRESHOLDS;

    /* A new deadline is a new countdown, including one that has already run. */
    if (core.deadline !== lastDeadline) {
      lastDeadline = core.deadline;
      firedExpiry = false;
      previous = remainingMs(core.deadline, Date.now());
    }

    const next = remainingMs(core.deadline, Date.now());
    const passed = crossedThresholds(previous, next, marks);
    previous = next;

    onRead({ ms: next, level: countdownLevel(next, marks), text: formatCountdown(next) });

    for (const mark of passed) core.onThreshold?.(mark);
    if (next <= 0 && !firedExpiry) {
      firedExpiry = true;
      core.onExpire?.();
    }
  };

  const sync = () => {
    clearInterval(timer);
    timer = undefined;
    read();
    if (!getCore().paused) timer = setInterval(read, TICK_MS);
  };

  /* A tab returning from the background is the case a plain interval gets
     wrong; reading on wake means the first thing the user sees is correct. */
  const onVisible = () => {
    if (!document.hidden) read();
  };
  document.addEventListener("visibilitychange", onVisible);
  sync();

  /* Returned as the disposer; `sync` is reachable through it for update(). */
  const stop = () => {
    clearInterval(timer);
    timer = undefined;
    document.removeEventListener("visibilitychange", onVisible);
  };
  (stop as { resync?: () => void }).resync = sync;
  return stop;
}

export interface TimerBadgeProps extends CountdownCore, BaseProps {
  /** Shown before the figure — "Time left". Omit for the bare clock. */
  label?: Child;
  /** `"soft"` (default) is a tinted pill; `"bare"` is text only, for a toolbar. */
  variant?: "soft" | "bare";
  size?: "sm" | "md";
}

export function TimerBadge(props: TimerBadgeProps): ZenComponent<TimerBadgeProps> {
  let current: TimerBadgeProps = { ...props };
  const disposer = new Disposer();
  let removeProps: (() => void) | undefined;

  const el = document.createElement("span");
  el.setAttribute("role", "timer");
  /* Polite is still too loud: a timer that interrupts a screen reader every
     second makes the page unusable. The per-second value is for looking at; the
     thresholds are what get announced, through onThreshold. */
  el.setAttribute("aria-live", "off");

  const labelEl = document.createElement("span");
  labelEl.className = "zen-font-normal zen-opacity-80";
  const figure = document.createElement("span");
  const sr = document.createElement("span");
  sr.className = "zen-sr-only";

  const paint = ({ ms, level, text }: Reading) => {
    const { label, variant = "soft", size = "md", class: className } = current;

    el.dataset.level = level;
    el.className = cn(
      "zen-inline-flex zen-items-center zen-gap-2 zen-font-medium zen-tabular-nums",
      size === "sm" ? "zen-text-xs" : "zen-text-sm",
      variant === "soft" && cn("zen-rounded-zen-full zen-px-3 zen-py-1", LEVEL_SOFT[level]),
      variant === "bare" && LEVEL_TEXT[level],
      /* The last minute pulses. Colour alone fails a colour-blind candidate, and
         this is the one moment the component must not be missable. */
      level === "critical" && "zen-animate-pulse motion-reduce:zen-animate-none",
      className,
    );
    el.setAttribute("aria-label", typeof label === "string" ? `${label}: ${text} remaining` : `${text} remaining`);

    figure.className = cn(size === "sm" ? "zen-text-sm" : "zen-text-base", "zen-font-semibold");
    figure.textContent = text;

    /* The state in words, for anyone who cannot use the colour. */
    sr.textContent =
      level === "critical" && ms > 0 ? "Less than a minute remaining" : level === "expired" ? "Time is up" : "";

    el.replaceChildren();
    if (label !== undefined && label !== null && label !== false) {
      setChildren(labelEl, label);
      el.append(labelEl);
    }
    el.append(figure);
    if (sr.textContent) el.append(sr);
  };

  const render = () => {
    const {
      label: _l, variant: _v, size: _s, class: _c, children: _ch,
      deadline: _d, thresholds: _t, onExpire: _e, onThreshold: _o, paused: _p,
      ...rest
    } = current;
    removeProps?.();
    removeProps = applyProps(el, rest as Record<string, unknown>);
  };

  const stop = startCountdown(() => current, paint);
  render();
  disposer.add(() => removeProps?.());
  disposer.add(stop);

  return {
    el,
    update(next) {
      current = { ...current, ...next };
      render();
      /* Re-arm: a change to `paused` or `deadline` has to reach the interval,
         not merely the next paint. */
      (stop as { resync?: () => void }).resync?.();
    },
    destroy() {
      disposer.dispose();
      el.remove();
    },
  };
}

export interface TestCountdownBarProps extends CountdownCore, BaseProps {
  /** What is being timed — the test or question name. */
  title?: Child;
  /** Progress, a question counter, anything else that belongs beside the clock. */
  content?: Child;
  /** Actions on the right: submit, save, request more time. */
  actions?: Child;
  /** Pin to the top of the scroll container. Default `true`. */
  sticky?: boolean;
}

/**
 * The bar an assessment runs under: the timer, whatever the app wants beside it,
 * and its actions — no submission logic of its own.
 *
 * `content` rather than React's `children`, because `children` on a vanilla
 * factory already means "the root's children" throughout this binding.
 */
export function TestCountdownBar(props: TestCountdownBarProps): ZenComponent<TestCountdownBarProps> {
  let current: TestCountdownBarProps = { ...props };
  const disposer = new Disposer();
  let removeProps: (() => void) | undefined;

  const el = document.createElement("header");

  /* ONE badge instance, which is what makes the callbacks fire once rather than
     twice: the bar's own clock only paints the border. */
  const badge = TimerBadge({ label: "Time left", ...countOf(current) });
  disposer.add(() => badge.destroy());

  const paint = ({ level }: Reading) => {
    const { sticky = true, class: className } = current;
    el.dataset.level = level;
    el.className = cn(
      "zen-flex zen-w-full zen-flex-wrap zen-items-center zen-gap-3 zen-border-b zen-px-4 zen-py-2",
      "zen-bg-zen-background",
      level === "critical" ? "zen-border-zen-error" : "zen-border-zen-border",
      /* z-30 matches Banner's sticky layer, so two sticky bars in one app stack
         in a predictable order rather than by DOM accident. */
      sticky && "zen-sticky zen-top-0 zen-z-30",
      className,
    );
  };

  const render = () => {
    const { title, content, actions } = current;

    el.replaceChildren();
    if (title !== undefined && title !== null && title !== false) {
      const t = document.createElement("span");
      t.className = "zen-truncate zen-text-sm zen-font-medium zen-text-zen-foreground";
      t.append(...toNodes(title));
      el.append(t);
    }
    if (content !== undefined && content !== null && content !== false) {
      const c = document.createElement("div");
      c.className = "zen-flex zen-min-w-0 zen-items-center zen-gap-3";
      c.append(...toNodes(content));
      el.append(c);
    }

    const right = document.createElement("div");
    right.className = "zen-ms-auto zen-flex zen-items-center zen-gap-2";
    right.append(badge.el);
    if (actions !== undefined && actions !== null && actions !== false) right.append(...toNodes(actions));
    el.append(right);

    const {
      title: _t, content: _co, actions: _a, sticky: _s, class: _c, children: _ch,
      deadline: _d, thresholds: _th, onExpire: _e, onThreshold: _o, paused: _p,
      ...rest
    } = current;
    removeProps?.();
    removeProps = applyProps(el, rest as Record<string, unknown>);
  };

  /* The bar's own clock takes NO callbacks — the badge owns those. Two clocks
     both firing onExpire is a test submitted twice. */
  const stop = startCountdown(() => ({ ...countOf(current), onExpire: undefined, onThreshold: undefined }), paint);
  render();
  disposer.add(() => removeProps?.());
  disposer.add(stop);

  return {
    el,
    update(next) {
      current = { ...current, ...next };
      badge.update({ label: "Time left", ...countOf(current) });
      render();
      (stop as { resync?: () => void }).resync?.();
    },
    destroy() {
      disposer.dispose();
      el.remove();
    },
  };
}

/** Just the clock props, so the bar can hand them on without its own layout ones. */
function countOf(p: TestCountdownBarProps): CountdownCore {
  return {
    deadline: p.deadline,
    thresholds: p.thresholds,
    onExpire: p.onExpire,
    onThreshold: p.onThreshold,
    paused: p.paused,
  };
}
