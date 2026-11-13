import { liveState, type LiveState } from "@algorisys/zen-ui-core/live";
import { durationMessage } from "@algorisys/zen-ui-core/state-timeline";
import { cn } from "../../lib/cn";
import { applyProps, Disposer, type BaseProps, type ZenComponent } from "../../lib/component";
import { useLocale } from "../locale/locale";

/**
 * LiveIndicator — whether what a screen shows is current.
 *
 *   LiveIndicator({ lastUpdated: fetchedAt, connected: socketOpen })
 *   // ● Updated 12s ago   →   ● Not updated for 3m 10s   →   ● Offline
 *
 * Vanilla port; see the React binding for the reasoning. Same API, same output.
 * Call `update({ lastUpdated })` after each successful fetch.
 *
 * Pass `lastUpdated` as the time of the last SUCCESSFUL update, not the last
 * attempt: a poll that keeps failing must read as stale. `connected: false`
 * says offline at once, however recent the last update was.
 *
 * The visible age ticks every second and is not a live region. A separate,
 * hidden live region announces only a change of state (live → stale →
 * offline), which is the moment a person needs to hear.
 */

export interface LiveIndicatorProps extends Omit<BaseProps, "children"> {
  lastUpdated?: Date | number;
  /** How old data may get before it is stale. Default 2 minutes. */
  staleAfterMs?: number;
  /** false: the app knows the connection is down. */
  connected?: boolean;
  /** Pins the clock, for tests and screenshots. */
  now?: Date | number;
  size?: "sm" | "md";
}

const DOT: Record<LiveState, string> = {
  live: "zen-bg-zen-success",
  stale: "zen-bg-zen-warning-soft-fg",
  offline: "zen-bg-zen-error",
  waiting: "zen-border zen-border-solid zen-border-zen-muted-fg",
};
const TEXT: Record<LiveState, string> = {
  live: "zen-text-zen-muted-fg",
  stale: "zen-font-medium zen-text-zen-warning-soft-fg",
  offline: "zen-font-medium zen-text-zen-error",
  waiting: "zen-text-zen-muted-fg",
};
const STATE_KEY = { live: "live.live", stale: "live.stale", offline: "live.offline", waiting: "live.waiting" } as const;

export function LiveIndicator(props: LiveIndicatorProps = {}): ZenComponent<LiveIndicatorProps> {
  let current: LiveIndicatorProps = { ...props };
  const loc = useLocale();
  const el = document.createElement("span");
  const dot = document.createElement("span");
  dot.setAttribute("aria-hidden", "true");
  const label = document.createElement("span");
  const status = document.createElement("span");
  status.className = "zen-sr-only";
  status.setAttribute("role", "status");
  el.append(dot, label, status);
  const disposer = new Disposer();
  let removeProps: (() => void) | undefined;
  // The state the live region last announced; it is rewritten only when the
  // state changes, so a stale screen is announced once, not every second.
  let announced: LiveState | undefined;

  // What the clock moves: the state, the age, the classes. Run every second.
  const paint = () => {
    const { lastUpdated, staleAfterMs, connected, now, size, class: className } = current;
    const s = liveState({ lastUpdated, now: now ?? Date.now(), staleAfterMs, connected });
    const state = s.state;
    const age = () => {
      const d = durationMessage(s.ageMs ?? 0);
      return loc.t(d.key, d.values);
    };
    let text: string;
    if (state === "live") text = s.ageMs !== null && s.ageMs < 5_000 ? loc.t("live.justNow") : loc.t("live.updated", { age: age() });
    else if (state === "stale") text = loc.t("live.stale", { age: age() });
    else if (state === "offline") text = s.ageMs === null ? loc.t("live.offline") : loc.t("live.offlineFor", { age: age() });
    else text = loc.t("live.waiting");

    el.setAttribute("data-state", state);
    el.className = cn(
      "zen-inline-flex zen-items-center zen-gap-1.5 zen-tabular-nums",
      size === "sm" ? "zen-text-xs" : "zen-text-sm",
      TEXT[state],
      className,
    );
    dot.className = cn("zen-h-2 zen-w-2 zen-shrink-0 zen-rounded-zen-full", DOT[state]);
    label.textContent = text;
    if (announced !== state) {
      announced = state;
      status.textContent = state === "stale" ? loc.t("live.stale", { age: age() }) : loc.t(STATE_KEY[state]);
    }
  };

  const render = () => {
    const { lastUpdated: _l, staleAfterMs: _s, connected: _c, now: _n, size: _z, class: _k, ...rest } = current;
    paint();
    removeProps?.();
    removeProps = applyProps(el, rest as Record<string, unknown>);
  };

  render();
  const timer = setInterval(paint, 1000);
  disposer.add(() => clearInterval(timer));
  disposer.add(() => removeProps?.());

  return {
    el,
    update(next) {
      current = { ...current, ...next };
      render();
    },
    destroy() {
      disposer.dispose();
      el.remove();
    },
  };
}
