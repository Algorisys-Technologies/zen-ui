import * as React from "react";
/**
 * Combobox — searchable single-select with optional async option loading.
 * Built on cmdk (filtering + keyboard) + Radix Popover (positioning +
 * dismissal). Replaces Select when free-text search is needed across a
 * large or remote option set.
 *
 * Synchronous (in-memory):
 *
 *   <Combobox
 *     options={[{ value: "a", label: "Alpha" }, …]}
 *     value={picked}
 *     onValueChange={setPicked}
 *     placeholder="Pick one"
 *   />
 *
 * Async (server-driven):
 *
 *   <Combobox
 *     value={picked}
 *     onValueChange={setPicked}
 *     onSearch={async (query) => {
 *       const res = await fetch(`/api/options?q=${query}`);
 *       return res.json();
 *     }}
 *     debounceMs={250}
 *   />
 *
 * The async signature replaces `options`; the component handles
 * debounce, abort-on-stale, and loading / no-results states.
 *
 * Creatable (the option does not exist yet):
 *
 *   <Combobox
 *     options={tags}
 *     creatable
 *     onCreate={(label) => {
 *       const opt = { value: slug(label), label };
 *       setTags((prev) => [...prev, opt]);
 *       return opt;               // returned -> selected for you
 *     }}
 *   />
 *
 * The component never touches `options`: it cannot know where the list lives
 * or what a new option's `value` should be, so creating is always the
 * caller's. Selecting does not have to be. RETURN the new option and it is
 * selected; return nothing and the value is left alone for the caller to set.
 */
export interface ComboboxOption {
    value: string;
    label: string;
    /**
     * Rich row content, rendered INSTEAD of `label`.
     *
     * `label` stays the string: it is what the filter matches, what the trigger
     * shows once a value is picked, and what `creatable` compares against. This
     * is only what the row looks like — a second line of metadata, a highlighted
     * match, an avatar beside the name.
     */
    content?: React.ReactNode;
    /** Optional extra text used by cmdk's fuzzy match. */
    keywords?: string[];
    disabled?: boolean;
}
export interface ComboboxProps {
    /** Static option list (synchronous mode). Ignored if `onSearch` is provided. */
    options?: ComboboxOption[];
    /** Async loader (server-driven). Called on every input change, debounced. */
    onSearch?: (query: string) => Promise<ComboboxOption[]>;
    /** Selected value. Pass "" / null to clear. */
    value?: string;
    /** Defaults to "". */
    defaultValue?: string;
    onValueChange?: (value: string, option: ComboboxOption | null) => void;
    /** Text shown when no value is selected. */
    placeholder?: string;
    /** Placeholder inside the search input. */
    searchPlaceholder?: string;
    /** Message when the result list is empty after filtering / search. */
    emptyMessage?: string;
    /** Async-mode: ms to wait after the last keystroke before calling onSearch. */
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
    /** Trigger button's width. Defaults to 240. */
    width?: number | string;
    disabled?: boolean;
    className?: string;
}
declare const Combobox: React.FC<ComboboxProps>;
export { Combobox };
//# sourceMappingURL=combobox.d.ts.map