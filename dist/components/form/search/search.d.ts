import { type JSX } from "solid-js";
/**
 * Search — a search input as a component, not a pattern reinvented per screen.
 * Solid port of the React binding's Search; same API, same behaviour.
 *
 *   <Search value={q()} onValueChange={setQ} placeholder="Search components" />
 *
 *   - `type="search"` so the platform exposes role="searchbox"; the native webkit
 *     clear affordance is hidden because we render our own, keyboard-reachable and
 *     labelled.
 *   - Controlled (`value` + `onValueChange`) or uncontrolled (`defaultValue`).
 *   - The clear button shows only when there is text, resets to "", fires
 *     `onClear`, and returns focus to the field.
 */
export type SearchSize = "sm" | "md" | "lg";
export interface SearchProps extends Omit<JSX.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "onInput" | "size"> {
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    /** Fired when the clear button empties the field. */
    onClear?: () => void;
    size?: SearchSize;
    /** Accessible label for the clear button. */
    clearLabel?: string;
}
export declare const Search: (props: SearchProps) => JSX.Element;
//# sourceMappingURL=search.d.ts.map