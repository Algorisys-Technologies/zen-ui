import * as React from "react";
import type { ComboboxOption } from "./combobox";
/**
 * MultiCombobox — multi-select sibling of Combobox. Selected values
 * render as removable chips inside the trigger; clicking an option in
 * the popover toggles its membership instead of closing.
 *
 *   const [picked, setPicked] = useState<string[]>([]);
 *   <MultiCombobox
 *     options={[{ value: "a", label: "Alpha" }, …]}
 *     value={picked}
 *     onValueChange={setPicked}
 *     placeholder="Pick one or more"
 *   />
 *
 * Async mode mirrors Combobox: replace `options` with an `onSearch`
 * function. The component maintains a `valueToLabel` cache so chips
 * keep their human labels even when the current async result page
 * doesn't contain the corresponding option.
 *
 *   <MultiCombobox onSearch={async (q) => fetch(...).then(r => r.json())} />
 *
 * Differs from TagInput: this picks from a fixed (or async-fetched)
 * option set; TagInput accepts free-text values. Reach for TagInput
 * for skills / keywords / arbitrary tags; reach for MultiCombobox for
 * "pick from this list".
 */
export interface MultiComboboxProps {
    options?: ComboboxOption[];
    onSearch?: (query: string) => Promise<ComboboxOption[]>;
    value?: string[];
    defaultValue?: string[];
    onValueChange?: (value: string[], options: ComboboxOption[]) => void;
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
     * RETURN the new option and it is APPENDED to the selection, which is what
     * "create a tag" almost always means. Return nothing and the selection is
     * left alone. Mirrors Combobox, where returning selects instead of appends —
     * the difference is the selection model, not the contract.
     */
    onCreate?: (label: string) => ComboboxOption | void;
    /** Verb on the create row — `Create "foo"`. Default "Create". */
    createLabel?: string;
    /** Trigger button min width. Defaults to 240. */
    width?: number | string;
    /** Cap how many chips show in the trigger before collapsing into
     *  "+N more". Default 3. */
    maxDisplayed?: number;
    disabled?: boolean;
    className?: string;
    /** Show a "Clear all" button inside the popover when ≥ 1 selected.
     *  Default true. */
    showClearAll?: boolean;
}
declare const MultiCombobox: React.FC<MultiComboboxProps>;
export { MultiCombobox };
//# sourceMappingURL=multi-combobox.d.ts.map