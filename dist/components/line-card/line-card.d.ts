import * as React from "react";
import { type MachineState } from "../../_core/machine-state";
/**
 * LineCard — one production line at a glance: its state, the order it is
 * running, how far along, and when it will finish — or why it is not moving.
 *
 *   <LineCard
 *     name="Line A" href="/lines/a"
 *     state="running" since={stateSince}
 *     order={{ code: "WO-10042", product: "Bracket", target: 500, good: 361, scrap: 19 }}
 *     perHour={278} timeZone="Asia/Kolkata"
 *   />
 *
 * The last line answers the question a supervisor scanning a wall of these is
 * asking. Running with a rate: "Done by 13:40". Not running: what it is doing
 * instead and for how long, with the cause — never an ETA computed from a rate
 * the line is not producing at. Done: "Order complete".
 *
 * `href` makes the whole card a link (the name is the link; it stretches over
 * the card), so the progress bar inside is not nested in a button.
 */
export type LineCardProps = Omit<React.HTMLAttributes<HTMLElement>, "children"> & {
    name: string;
    state: MachineState;
    /** When it entered this state. */
    since?: Date | number;
    /** Why ("Jam at infeed"). */
    cause?: string;
    order?: {
        code: string;
        product?: string;
        target: number;
        good: number;
        scrap?: number;
    };
    /** Current output rate, per hour, for the ETA. */
    perHour?: number;
    /** OEE as a fraction, shown small in the corner. */
    oee?: number | null;
    /** Makes the card a link to the line. */
    href?: string;
    timeZone?: string;
    /** Pins the clock, for tests and screenshots. */
    now?: Date | number;
};
export declare const LineCard: React.ForwardRefExoticComponent<Omit<React.HTMLAttributes<HTMLElement>, "children"> & {
    name: string;
    state: MachineState;
    /** When it entered this state. */
    since?: Date | number;
    /** Why ("Jam at infeed"). */
    cause?: string;
    order?: {
        code: string;
        product?: string;
        target: number;
        good: number;
        scrap?: number;
    };
    /** Current output rate, per hour, for the ETA. */
    perHour?: number;
    /** OEE as a fraction, shown small in the corner. */
    oee?: number | null;
    /** Makes the card a link to the line. */
    href?: string;
    timeZone?: string;
    /** Pins the clock, for tests and screenshots. */
    now?: Date | number;
} & React.RefAttributes<HTMLElement>>;
//# sourceMappingURL=line-card.d.ts.map