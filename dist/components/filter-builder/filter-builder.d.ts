import * as React from "react";
import { type FilterCondition, type FilterField, type FilterGroup, type FilterNode, type FilterOperator } from "../../_core/filter";
export type { FilterField, FilterGroup, FilterNode, FilterCondition, FilterOperator };
/**
 * FilterBuilder — nested AND/OR conditions on any field, edited as a tree:
 * "status is Overdue AND (customer is one of A, B OR amount > 1,00,000)".
 *
 *   <FilterBuilder fields={fields} value={filter} onValueChange={setFilter} />
 *
 * The value is one plain object (a FilterGroup): save it, send it to the server
 * as report criteria, put it in a saved view, or filter rows here with
 * `filterPredicate` from @algorisys/zen-ui-core/filter. Each field's type
 * decides its operators and its value editor: text, number, date (typed, with
 * a calendar), a list of choices, or yes/no. A condition still missing its
 * value filters nothing, and the summary under the builder says in words what
 * the filter does now.
 *
 * Each group's "Match" covers all four meanings (all, any, none, not all), so
 * NOT is never a separate checkbox to miss. The pure half is
 * @algorisys/zen-ui-core/filter (check:filter).
 */
export interface FilterBuilderProps {
    fields: FilterField[];
    value?: FilterGroup;
    defaultValue?: FilterGroup;
    onValueChange?: (value: FilterGroup) => void;
    /** How deep groups may nest. Default 3 (the top group and two levels inside it). */
    maxDepth?: number;
    /** The summary in words under the builder. Default true. */
    showSummary?: boolean;
    /** Spell a value in the summary (a currency, a local date). Default: as stored. */
    formatValue?: (value: string | number, field: FilterField) => string;
    /** Names the whole builder for assistive tech. Default "Filter". */
    "aria-label"?: string;
    className?: string;
}
export declare const FilterBuilder: ({ fields, value, defaultValue, onValueChange, maxDepth, showSummary, formatValue, "aria-label": ariaLabel, className, }: FilterBuilderProps) => React.JSX.Element;
//# sourceMappingURL=filter-builder.d.ts.map