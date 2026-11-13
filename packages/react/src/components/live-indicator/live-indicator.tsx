import * as React from "react";
import { liveState, type LiveState } from "@algorisys/zen-ui-core/live";
import { durationMessage } from "@algorisys/zen-ui-core/state-timeline";
import { cn } from "../../lib/cn";
import { useLocale } from "../locale/locale";

/**
 * LiveIndicator — whether what a screen shows is current.
 *
 *   <LiveIndicator lastUpdated={fetchedAt} connected={socketOpen} />
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

export type LiveIndicatorProps = Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> & {
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

export const LiveIndicator = React.forwardRef<HTMLSpanElement, LiveIndicatorProps>(
  ({ lastUpdated, staleAfterMs, connected, now, size, className, ...rest }, ref) => {
    const loc = useLocale();
    const [clock, setClock] = React.useState(() => Date.now());
    React.useEffect(() => {
      const timer = setInterval(() => setClock(Date.now()), 1000);
      return () => clearInterval(timer);
    }, []);

    const s = liveState({ lastUpdated, now: now ?? clock, staleAfterMs, connected });
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

    // Recomputed when the STATE changes only, with the age as it was at that
    // moment, so a stale screen is announced once ("Not updated for 2m 1s"),
    // not every second. Adjusted during render rather than in an effect, so the
    // region never shows the previous state's words for a frame.
    const announce = () => (state === "stale" ? loc.t("live.stale", { age: age() }) : loc.t(STATE_KEY[state]));
    const [announcement, setAnnouncement] = React.useState(() => ({ state, text: announce() }));
    if (announcement.state !== state) setAnnouncement({ state, text: announce() });

    return (
      <span
        ref={ref}
        data-state={state}
        className={cn(
          "zen-inline-flex zen-items-center zen-gap-1.5 zen-tabular-nums",
          size === "sm" ? "zen-text-xs" : "zen-text-sm",
          TEXT[state],
          className,
        )}
        {...rest}
      >
        <span aria-hidden="true" className={cn("zen-h-2 zen-w-2 zen-shrink-0 zen-rounded-zen-full", DOT[state])} />
        <span>{text}</span>
        <span className="zen-sr-only" role="status">
          {announcement.text}
        </span>
      </span>
    );
  },
);
LiveIndicator.displayName = "LiveIndicator";
