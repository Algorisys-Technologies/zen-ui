import { type JSX, createMemo, createSignal, on, onCleanup, splitProps, untrack } from "solid-js";
import { liveState, type LiveState } from "@algorisys/zen-ui-core/live";
import { durationMessage } from "@algorisys/zen-ui-core/state-timeline";
import { cn } from "../../lib/cn";
import { useLocale } from "../locale/locale";

/**
 * LiveIndicator — whether what a screen shows is current.
 *
 *   <LiveIndicator lastUpdated={fetchedAt()} connected={socketOpen()} />
 *   // ● Updated 12s ago   →   ● Not updated for 3m 10s   →   ● Offline
 *
 * Pass `lastUpdated` as the time of the last SUCCESSFUL update, not the last
 * attempt: a poll that keeps failing must read as stale. `connected={false}`
 * says offline at once, however recent the last update was.
 *
 * The visible age ticks every second and is not a live region — a screen
 * reader would otherwise speak every second. A separate, hidden live region
 * announces only a change of state (live → stale → offline), which is the
 * moment a person needs to hear.
 */

export type LiveIndicatorProps = Omit<JSX.HTMLAttributes<HTMLSpanElement>, "children"> & {
  lastUpdated?: Date | number;
  /** How old data may get before it is stale. Default 2 minutes. */
  staleAfterMs?: number;
  /** false: the app knows the connection is down. */
  connected?: boolean;
  /** Pins the clock, for tests and screenshots. */
  now?: Date | number;
  size?: "sm" | "md";
};

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

export const LiveIndicator = (props: LiveIndicatorProps) => {
  const [local, rest] = splitProps(props, ["lastUpdated", "staleAfterMs", "connected", "now", "size", "class"]);
  const loc = useLocale();
  const [clock, setClock] = createSignal(Date.now());
  const timer = setInterval(() => setClock(Date.now()), 1000);
  onCleanup(() => clearInterval(timer));

  const s = createMemo(() =>
    liveState({ lastUpdated: local.lastUpdated, now: local.now ?? clock(), staleAfterMs: local.staleAfterMs, connected: local.connected }),
  );
  // Only the state, so the live region changes when the state does — not every second.
  const state = createMemo(() => s().state);
  const age = () => {
    const d = durationMessage(s().ageMs ?? 0);
    return loc.t(d.key, d.values);
  };
  const text = () => {
    const { state: st, ageMs } = s();
    if (st === "live") return ageMs !== null && ageMs < 5_000 ? loc.t("live.justNow") : loc.t("live.updated", { age: age() });
    if (st === "stale") return loc.t("live.stale", { age: age() });
    if (st === "offline") return ageMs === null ? loc.t("live.offline") : loc.t("live.offlineFor", { age: age() });
    return loc.t("live.waiting");
  };
  // Recomputed when the STATE changes only; the age is read untracked, so a
  // stale screen is announced once ("Not updated for 2m 1s"), not every second.
  const announcement = createMemo(
    on(state, (st) => untrack(() => (st === "stale" ? loc.t("live.stale", { age: age() }) : loc.t(STATE_KEY[st])))),
  );

  return (
    <span
      data-state={state()}
      class={cn(
        "zen-inline-flex zen-items-center zen-gap-1.5 zen-tabular-nums",
        local.size === "sm" ? "zen-text-xs" : "zen-text-sm",
        TEXT[state()],
        local.class,
      )}
      {...rest}
    >
      <span aria-hidden="true" class={cn("zen-h-2 zen-w-2 zen-shrink-0 zen-rounded-zen-full", DOT[state()])} />
      <span>{text()}</span>
      <span class="zen-sr-only" role="status">
        {announcement()}
      </span>
    </span>
  );
};
