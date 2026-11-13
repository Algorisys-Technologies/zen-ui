import * as React from "react";
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
export declare const LiveIndicator: React.ForwardRefExoticComponent<Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> & {
    lastUpdated?: Date | number;
    /** How old data may get before it is stale. Default 2 minutes. */
    staleAfterMs?: number;
    /** false: the app knows the connection is down. */
    connected?: boolean;
    /** Pins the clock, for tests and screenshots. */
    now?: Date | number;
    size?: "sm" | "md";
} & React.RefAttributes<HTMLSpanElement>>;
//# sourceMappingURL=live-indicator.d.ts.map