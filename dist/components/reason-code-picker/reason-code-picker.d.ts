import * as React from "react";
import { type ReasonCode } from "../../_core/reason-codes";
/**
 * ReasonCodePicker — a touch grid for saying why: why a machine stopped, why a
 * part was scrapped.
 *
 *   <ReasonCodePicker
 *     reasons={downtimeReasons}
 *     value={reasonId}
 *     onChange={(id) => setReasonId(id)}
 *   />
 *
 * Big targets (48px or more) for gloved hands, category chips when the list has
 * more than one category, and a search box once it is long enough to need one —
 * matching label, code and description, ignoring case and accents, every word
 * in any order. Operators who know the code type "M12".
 *
 * A listbox, one tab stop. Arrow keys move focus; Enter, Space or a tap
 * selects. Selection deliberately does NOT follow focus: choosing a reason is
 * often what records the stop, and walking the list with the arrow keys must
 * not record anything on the way.
 *
 * A selected reason the filter hides stays selected and is named under the
 * grid, so filtering can never quietly change or lose the answer.
 */
export type ReasonCodePickerProps<R extends ReasonCode = ReasonCode> = Omit<React.HTMLAttributes<HTMLDivElement>, "children" | "onChange" | "defaultValue"> & {
    reasons: R[];
    value?: string;
    defaultValue?: string;
    onChange?: (id: string, reason: R) => void;
    /** Names the list — the question it answers. Defaults to "Reason". */
    label?: string;
    /** Show the search box. Defaults to on once there are more than 12 reasons. */
    searchable?: boolean;
    /** Show category chips. Defaults to on when there is more than one category. */
    showCategories?: boolean;
};
/** Generic over the reason type, so `onChange` hands back the caller's own `R`. */
export declare const ReasonCodePicker: <R extends ReasonCode = ReasonCode>(props: ReasonCodePickerProps<R> & {
    ref?: React.Ref<HTMLDivElement>;
}) => React.ReactElement | null;
//# sourceMappingURL=reason-code-picker.d.ts.map