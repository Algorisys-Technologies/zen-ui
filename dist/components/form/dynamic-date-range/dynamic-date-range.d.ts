import { type DateRangeOperator, type DateRangeValue, type ResolvedRange } from "@algorisys/zen-ui-core/date-range";
/**
 * DynamicDateRange — a date range you describe rather than point at.
 *
 * The difference from DateRangePicker is the value, not the popover.
 * DateRangePicker answers "which two dates?" and stores two dates. This
 * answers "which period?" and stores the period — `{operator: "LAST_DAYS",
 * count: 7}`. Save that in a filter variant and it still means the last seven
 * days next month; save two dates and it means the same frozen week forever.
 * So `onValueChange` hands back both: the semantic value to store, and the
 * resolved dates to query with.
 *
 * All the date maths is in @algorisys/zen-ui-core/date-range, shared with the
 * React binding.
 *
 * Mirrors the React binding's API.
 */
export type DynamicDateRangeProps = {
    value?: DateRangeValue;
    defaultValue?: DateRangeValue;
    /** Hands back the value to STORE and the dates to QUERY with. */
    onValueChange?: (value: DateRangeValue | undefined, resolved: ResolvedRange) => void;
    /** Restrict the operator list. Defaults to all of them. */
    operators?: DateRangeOperator[];
    /** 0 = Sunday, matching the calendar. */
    weekStartsOn?: number;
    /** Override "now". For tests and stories — resolution is otherwise live. */
    now?: Date;
    placeholder?: string;
    disabled?: boolean;
    /** Formats dates in the trigger and the preview. */
    formatDate?: (date: Date) => string;
    class?: string;
};
export declare const DynamicDateRange: (props: DynamicDateRangeProps) => import("solid-js").JSX.Element;
//# sourceMappingURL=dynamic-date-range.d.ts.map