export type LiveState = "live" | "stale" | "waiting" | "offline";
export declare function liveState(o: {
    lastUpdated?: Date | number;
    now: Date | number;
    staleAfterMs?: number;
    /** false: the app knows the connection is down. Undefined: judge by time alone. */
    connected?: boolean;
}): {
    state: LiveState;
    ageMs: number | null;
};
