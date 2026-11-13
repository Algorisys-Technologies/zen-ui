/**
 * Live-data state — the pure half of LiveIndicator.
 *
 *   bun run check:live
 *
 * offline (the app says the connection is down) > waiting (nothing has
 * arrived) > stale (past `staleAfterMs` since the last SUCCESSFUL update) >
 * live.
 */
import { boardFreshness, DEFAULT_ANDON_STALE_MS } from "./andon";

export type LiveState = "live" | "stale" | "waiting" | "offline";

export function liveState(o: {
  lastUpdated?: Date | number;
  now: Date | number;
  staleAfterMs?: number;
  /** false: the app knows the connection is down. Undefined: judge by time alone. */
  connected?: boolean;
}): { state: LiveState; ageMs: number | null } {
  const { stale, ageMs } = boardFreshness(o.lastUpdated, o.now, o.staleAfterMs ?? DEFAULT_ANDON_STALE_MS);
  if (o.connected === false) return { state: "offline", ageMs };
  if (ageMs === null) return { state: "waiting", ageMs };
  return { state: stale ? "stale" : "live", ageMs };
}
