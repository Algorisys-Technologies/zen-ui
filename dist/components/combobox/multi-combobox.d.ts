import type { ComboboxOption } from "./combobox";
/**
 * MultiCombobox — searchable multi-select built on Kobalte Combobox
 * with `multiple`. Selected values render as removable chips inside the
 * trigger.
 *
 *   const [picks, setPicks] = createSignal<string[]>([]);
 *   <MultiCombobox
 *     options={…}
 *     value={picks()}
 *     onValueChange={setPicks}
 *     placeholder="Pick some"
 *   />
 */
export type MultiComboboxProps = {
    options?: ComboboxOption[];
    value?: string[];
    defaultValue?: string[];
    onValueChange?: (value: string[]) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyMessage?: string;
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
    width?: number | string;
    disabled?: boolean;
    class?: string;
};
export declare const MultiCombobox: (rawProps: MultiComboboxProps) => import("solid-js").JSX.Element;
//# sourceMappingURL=multi-combobox.d.ts.map