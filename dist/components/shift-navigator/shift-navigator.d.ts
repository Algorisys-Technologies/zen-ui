import * as React from "react";
import { type ShiftDef, type ShiftRef } from "../../_core/shifts";
/**
 * ShiftNavigator — step through a plant's shifts: previous, next, back to now.
 *
 *   <ShiftNavigator
 *     shifts={[{ id: "A", start: "06:00", end: "14:00" }, …]}
 *     timeZone="Asia/Kolkata"
 *     value={shift} onChange={setShift}
 *   />
 *
 * Times are the plant's: pass `timeZone` and a supervisor in another city sees
 * the shift as the floor works it. A night shift belongs to the day it starts.
 * Without `value` it starts on the current shift (or the next one, in a gap
 * between shifts).
 *
 * Future shifts have no data yet, so "next" stops at the current shift unless
 * `allowFuture` is set — a planning screen sets it.
 */
export type ShiftNavigatorProps = Omit<React.HTMLAttributes<HTMLDivElement>, "children" | "onChange" | "defaultValue"> & {
    shifts: ShiftDef[];
    /** IANA zone the shifts are worked in. Defaults to the browser's. */
    timeZone?: string;
    value?: ShiftRef;
    defaultValue?: ShiftRef;
    onChange?: (ref: ShiftRef, window: {
        start: number;
        end: number;
    }) => void;
    /** Let "next" go past the current shift. Default false. */
    allowFuture?: boolean;
    /** Pins the clock, for tests and screenshots. */
    now?: Date | number;
};
export declare const ShiftNavigator: React.ForwardRefExoticComponent<Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue" | "children"> & {
    shifts: ShiftDef[];
    /** IANA zone the shifts are worked in. Defaults to the browser's. */
    timeZone?: string;
    value?: ShiftRef;
    defaultValue?: ShiftRef;
    onChange?: (ref: ShiftRef, window: {
        start: number;
        end: number;
    }) => void;
    /** Let "next" go past the current shift. Default false. */
    allowFuture?: boolean;
    /** Pins the clock, for tests and screenshots. */
    now?: Date | number;
} & React.RefAttributes<HTMLDivElement>>;
//# sourceMappingURL=shift-navigator.d.ts.map