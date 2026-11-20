import * as React from "react";
/**
 * Search — a search input as a component, not a pattern reinvented per screen.
 *
 *   <Search value={q} onValueChange={setQ} placeholder="Search components" />
 *
 * zen-ui carried this exact affordance — magnifier, a field, a clear button —
 * inlined inside ShellBar, ValueHelp, SelectDialog, DataTable, the select list,
 * Combobox and MultiCombobox. Seven copies, each slightly different. This is the
 * one place it lives now.
 *
 *   - `type="search"` so the platform exposes role="searchbox" and Escape-to-clear
 *     where the OS does it; the native webkit clear affordance is hidden (below)
 *     because we render our own, which is keyboard-reachable and labelled.
 *   - Controlled (`value` + `onValueChange`) or uncontrolled (`defaultValue`).
 *   - The clear button shows only when there is text, resets to "", fires
 *     `onClear`, and returns focus to the field — a mouse clear should not drop
 *     you out of the input.
 */
export type SearchSize = "sm" | "md" | "lg";
export interface SearchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "defaultValue" | "onChange" | "size"> {
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    /** Fired when the clear button empties the field. */
    onClear?: () => void;
    size?: SearchSize;
    /** Accessible label for the clear button. */
    clearLabel?: string;
}
declare const Search: React.ForwardRefExoticComponent<SearchProps & React.RefAttributes<HTMLInputElement>>;
export { Search };
//# sourceMappingURL=search.d.ts.map