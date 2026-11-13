import * as React from "react";
import { type MeasurementJudgement, type MeasurementSpec } from "../../_core/measurement";
/**
 * MeasurementInput — a reading checked against its limits as it is typed.
 *
 *   <MeasurementInput
 *     label="Bore diameter" unit="mm" precision={2}
 *     spec={{ nominal: 10, lower: 9.9, upper: 10.1, warnLower: 9.95, warnUpper: 10.05 }}
 *     onChange={(value, j) => record(value, j.verdict)}
 *   />
 *
 * The verdict is in words ("Above the upper limit") with an icon, and a scale
 * under the field shows where the reading sits: the tolerance band, the
 * warning band inside it, the nominal, and the reading. The scale is built from
 * the limits — a typo of 1000 against 10 ± 0.1 is pinned to the end and marked
 * off the scale rather than squashing the band to nothing.
 *
 * Input is read in the user's locale ("10,05" in German). The verdict updates as
 * you type; a screen reader hears it when the reading is committed (Enter or
 * leaving the field), not after every keystroke on the way to it.
 */
export type MeasurementInputProps = Omit<React.HTMLAttributes<HTMLDivElement>, "children" | "onChange" | "defaultValue"> & {
    spec: MeasurementSpec;
    label: string;
    /** Shown after the field and the limits ("mm", "Nm"). */
    unit?: string;
    /** Decimals for the limits shown. Defaults to what the spec needs. */
    precision?: number;
    value?: number | null;
    defaultValue?: number | null;
    /** Every valid change, with its judgement; null when the field is empty or not a number. */
    onChange?: (value: number | null, judgement: MeasurementJudgement) => void;
    disabled?: boolean;
};
export declare const MeasurementInput: React.ForwardRefExoticComponent<Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue" | "children"> & {
    spec: MeasurementSpec;
    label: string;
    /** Shown after the field and the limits ("mm", "Nm"). */
    unit?: string;
    /** Decimals for the limits shown. Defaults to what the spec needs. */
    precision?: number;
    value?: number | null;
    defaultValue?: number | null;
    /** Every valid change, with its judgement; null when the field is empty or not a number. */
    onChange?: (value: number | null, judgement: MeasurementJudgement) => void;
    disabled?: boolean;
} & React.RefAttributes<HTMLDivElement>>;
//# sourceMappingURL=measurement-input.d.ts.map