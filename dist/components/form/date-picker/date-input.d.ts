import * as React from "react";
import { type DateOrder } from "../../../_core/date-input";
export type { DateOrder };
/**
 * DateInput — a date you type, with the calendar as a second way in.
 *
 *   <DateInput value={due} onValueChange={setDue} locale="en-IN" />
 *
 * Read in the locale's order (day first for en-IN): 15/03/2026, 15-3-26,
 * 150326, 1503 (this year), 15 (this month), or ISO 2026-03-15. Shortcuts:
 * t today, y yesterday, +7 / -1 days, +2w, +1m, +1y. ↑ ↓ move a day (with
 * Shift, a month); Alt+↓ opens the calendar; Esc undoes what was typed. Text
 * that is not a date, or a date outside min / max, is kept as typed and marked
 * aria-invalid, never silently changed. The reading is
 * @algorisys/zen-ui-core/date-input (check:date-input).
 */
export type DateInputProps = {
    value?: Date | null;
    defaultValue?: Date | null;
    /** A date, or null when the field is cleared. Not called for text that is not a date. */
    onValueChange?: (date: Date | null) => void;
    /** Called with the text when what was typed is not an acceptable date. */
    onInvalidInput?: (text: string) => void;
    /** The order dates are read and shown in, from this locale. Default: the browser's. */
    locale?: string;
    /** Overrides the locale's order. */
    order?: DateOrder;
    /** The earliest date accepted. */
    min?: Date;
    /** The latest date accepted. */
    max?: Date;
    /** Dates that cannot be chosen (holidays, say). */
    isDateDisabled?: (date: Date) => boolean;
    /** Default: the order's pattern, DD/MM/YYYY. */
    placeholder?: string;
    /** Marked invalid by the form (the field marks typed text that is not a date itself). */
    invalid?: boolean;
    disabled?: boolean;
    /** Lands on the input, so `<label htmlFor>` names it. */
    id?: string;
    "aria-label"?: string;
    "aria-labelledby"?: string;
    /** Width of the field. Default: the --zen-date-input-width token. */
    width?: string;
    className?: string;
};
export declare const DateInput: ({ value: valueProp, defaultValue, onValueChange, onInvalidInput, locale, order: orderProp, min, max, isDateDisabled, placeholder, invalid, disabled, id, "aria-label": ariaLabel, "aria-labelledby": ariaLabelledby, width, className, }: DateInputProps) => React.JSX.Element;
/** Whether a date-input's text reads as a date: for a form's own validation. */
export declare const isTypedDate: (text: string, order?: DateOrder) => boolean;
//# sourceMappingURL=date-input.d.ts.map