import * as React from "react";
import { type MachineState, type MachineStateTone } from "../../_core/machine-state";
/**
 * StatePill — a machine's (or line's, or station's) state as a labelled pill.
 *
 *   <StatePill state="running" />                 // "Running", in the running tone
 *   <StatePill state="stopped">Jam at infeed</StatePill>
 *   <StatePill tone="down">Starved</StatePill>    // a state that is not ours
 *
 * The label is always drawn: colour alone must not carry the state, and red
 * and green are the pair colour-blind operators most often cannot tell apart.
 * `unknown` is a dashed outline with no fill — nothing has been heard from the
 * machine, and a solid colour would claim something about those minutes.
 *
 * Colours are the `--zen-state-<tone>` tokens; retheme a tone there, not here.
 */
export type StatePillSize = "sm" | "md";
export type StatePillProps = Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> & {
    /** One of the shared machine states. Gives both the colour and the label. */
    state?: MachineState;
    /**
     * The colour, for a state outside the shared vocabulary (PackML's "Held", a
     * plant's own "Starved"). Wins over the tone `state` would give.
     */
    tone?: MachineStateTone;
    size?: StatePillSize;
    /** The label. Defaults to the state's own ("Running", "No data", …). */
    children?: React.ReactNode;
};
export declare const StatePill: React.ForwardRefExoticComponent<Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> & {
    /** One of the shared machine states. Gives both the colour and the label. */
    state?: MachineState;
    /**
     * The colour, for a state outside the shared vocabulary (PackML's "Held", a
     * plant's own "Starved"). Wins over the tone `state` would give.
     */
    tone?: MachineStateTone;
    size?: StatePillSize;
    /** The label. Defaults to the state's own ("Running", "No data", …). */
    children?: React.ReactNode;
} & React.RefAttributes<HTMLSpanElement>>;
//# sourceMappingURL=state-pill.d.ts.map