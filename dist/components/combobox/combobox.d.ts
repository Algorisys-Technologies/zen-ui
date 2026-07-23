/**
 * Combobox — searchable single-select built on Kobalte Combobox.
 *
 * Sync (in-memory):
 *
 *   <Combobox
 *     options={[{ value: "a", label: "Alpha" }, …]}
 *     value={picked()}
 *     onValueChange={setPicked}
 *   />
 *
 * Async (server-driven):
 *
 *   <Combobox
 *     value={picked()}
 *     onValueChange={setPicked}
 *     onSearch={async (q) => { const r = await fetch(...); return r.json(); }}
 *     debounceMs={250}
 *   />
 *
 * API delta from the React (cmdk) binding: filtering is provided by
 * Kobalte's built-in default text filter for sync mode, or by your
 * onSearch loader for async mode. The shape `{value, label, keywords}`
 * is the same.
 */
export interface ComboboxOption {
    value: string;
    label: string;
    keywords?: string[];
    disabled?: boolean;
}
export type ComboboxProps = {
    options?: ComboboxOption[];
    onSearch?: (query: string) => Promise<ComboboxOption[]>;
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string, option: ComboboxOption | null) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyMessage?: string;
    debounceMs?: number;
    /**
     * Offer to create the typed text when it matches no option's label.
     * Needs `onCreate` to do anything.
     */
    creatable?: boolean;
    /**
     * Called with the typed text when the create row is chosen. Adding the
     * option to your list is always yours — the component cannot know where the
     * list lives or what a new `value` should be.
     *
     * RETURN the new option and it is selected for you. Return nothing and the
     * value is left alone, so a caller who wants to select it later (after a
     * round trip to a server, say) stays in control. Both are supported on
     * purpose; returning is just the short path.
     */
    onCreate?: (label: string) => ComboboxOption | void;
    /** Verb on the create row — `Create "foo"`. Default "Create". */
    createLabel?: string;
    width?: number | string;
    disabled?: boolean;
    class?: string;
};
export declare const Combobox: (rawProps: ComboboxProps) => import("solid-js").JSX.Element;
//# sourceMappingURL=combobox.d.ts.map