import { type JSX } from "solid-js";
/**
 * Command primitives — command-palette / autocomplete engine: filtering,
 * keyboard nav (arrow keys, home/end, enter), grouping, accessibility.
 *
 *   <Command>
 *     <CommandInput placeholder="Search…" />
 *     <CommandList>
 *       <CommandEmpty>No results.</CommandEmpty>
 *       <CommandGroup heading="Recent">
 *         <CommandItem onSelect={…}>Foo</CommandItem>
 *       </CommandGroup>
 *     </CommandList>
 *   </Command>
 *
 * The React binding wraps `cmdk`, which is React-only — there is no Solid
 * build and no equivalent library. This is a from-scratch Solid engine that
 * mirrors cmdk's public API *and* its DOM contract: the same `cmdk-*`
 * attributes and the same `data-selected` / `data-disabled` state attributes,
 * so the styling selectors are identical across both bindings.
 *
 * Known deltas from cmdk, all documented on the props they affect:
 *  - no score-based reordering (matches keep source order; cmdk sorts best-first)
 *  - no `--cmdk-list-height` custom property
 *  - no `asChild`
 * See the port notes at the bottom of this file.
 */
/**
 * Returns a number between 0 and 1: 1 is a perfect match, 0 hides the item.
 * Same contract as cmdk's `CommandFilter`.
 */
export type CommandFilter = (value: string, search: string, keywords?: string[]) => number;
/**
 * Default scorer. cmdk delegates to the `command-score` library; this is a
 * cheaper equivalent covering the same cases in the same order of preference:
 * exact > prefix > word-boundary substring > substring > subsequence.
 * Relative ranking between two partial matches can differ from cmdk's.
 */
export declare const defaultFilter: CommandFilter;
export interface CommandProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, "class"> {
    /** Accessible label for this command menu. Not shown visibly. */
    label?: string;
    /**
     * Optionally set to `false` to turn off the automatic filtering.
     * If `false`, you must conditionally render valid items based on the search
     * query yourself. (cmdk also turns off sorting here; this port never sorts.)
     */
    shouldFilter?: boolean;
    /**
     * Custom filter function for whether each command menu item matches the
     * given search query. Should return a number between 0 and 1, with 1 being
     * the best match and 0 being hidden entirely.
     */
    filter?: CommandFilter;
    /** Optional default item value when it is initially rendered. */
    defaultValue?: string;
    /** Optional controlled state of the selected command menu item. */
    value?: string;
    /** Event handler called when the selected item of the menu changes. */
    onValueChange?: (value: string) => void;
    /** Optionally set to `true` to turn on looping around when using the arrow keys. */
    loop?: boolean;
    /** Optionally set to `true` to disable selection via pointer events. */
    disablePointerSelection?: boolean;
    /** Set to `false` to disable ctrl+n/j/p/k shortcuts. Defaults to `true`. */
    vimBindings?: boolean;
    class?: string;
    children?: JSX.Element;
}
export declare const Command: (props: CommandProps) => JSX.Element;
export interface CommandInputProps extends Omit<JSX.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type" | "class"> {
    /** Optional controlled state for the value of the search input. */
    value?: string;
    /** Event handler called when the search value changes. */
    onValueChange?: (search: string) => void;
    class?: string;
}
export declare const CommandInput: (props: CommandInputProps) => JSX.Element;
export interface CommandListProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, "class"> {
    /** Accessible label for this list of suggestions. Not shown visibly. */
    label?: string;
    class?: string;
    children?: JSX.Element;
}
export declare const CommandList: (props: CommandListProps) => JSX.Element;
export type CommandEmptyProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "class"> & {
    class?: string;
    children?: JSX.Element;
};
export declare const CommandEmpty: (props: CommandEmptyProps) => JSX.Element;
export interface CommandLoadingProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, "class"> {
    /** Estimated progress of loading asynchronous options. */
    progress?: number;
    /** Accessible label for this loading progressbar. Not shown visibly. */
    label?: string;
    class?: string;
    children?: JSX.Element;
}
export declare const CommandLoading: (props: CommandLoadingProps) => JSX.Element;
export interface CommandGroupProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, "heading" | "class"> {
    /** Optional heading to render for this group. */
    heading?: JSX.Element;
    /** If no heading is provided, you must provide a value that is unique for this group. */
    value?: string;
    /** Whether this group is forcibly rendered regardless of filtering. */
    forceMount?: boolean;
    class?: string;
    children?: JSX.Element;
}
export declare const CommandGroup: (props: CommandGroupProps) => JSX.Element;
export interface CommandSeparatorProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, "class"> {
    /** Whether this separator should always be rendered. Useful if you disable automatic filtering. */
    alwaysRender?: boolean;
    class?: string;
}
export declare const CommandSeparator: (props: CommandSeparatorProps) => JSX.Element;
export interface CommandItemProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, "onSelect" | "class"> {
    /** Whether this item is currently disabled. */
    disabled?: boolean;
    /** Event handler for when this item is selected, either via click or keyboard selection. */
    onSelect?: (value: string) => void;
    /**
     * A unique value for this item. If no value is provided, it is inferred from
     * the rendered `textContent`.
     */
    value?: string;
    /** Optional keywords to match against when filtering. */
    keywords?: string[];
    /** Whether this item is forcibly rendered regardless of filtering. */
    forceMount?: boolean;
    class?: string;
    children?: JSX.Element;
}
export declare const CommandItem: (props: CommandItemProps) => JSX.Element;
//# sourceMappingURL=command.d.ts.map