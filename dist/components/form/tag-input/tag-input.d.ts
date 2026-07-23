import { type JSX } from "solid-js";
/**
 * TagInput — type-and-press-Enter chip input.
 *
 *   const [tags, setTags] = createSignal<string[]>(["react", "solid"]);
 *   <TagInput value={tags()} onValueChange={setTags} placeholder="Add a skill…" />
 *
 * Interaction (mirrors GitHub / Linear / Notion):
 *   - Enter / Tab / any char in `delimiters` commits the current input.
 *   - Backspace on empty input removes the trailing tag.
 *   - Click ✕ on a chip to remove that tag.
 *   - Paste a comma-separated list to commit multiple tags at once.
 */
export type TagInputProps = {
    value?: string[];
    defaultValue?: string[];
    onValueChange?: (next: string[]) => void;
    placeholder?: string;
    disabled?: boolean;
    /** Maximum number of tags accepted. Further commits are no-ops. */
    max?: number;
    /** Characters that trigger commit in addition to Enter/Tab. Default `,` */
    delimiters?: string[];
    /** Drop duplicates silently. Default true. */
    unique?: boolean;
    /** Per-tag validator. Return false / falsy-promise to reject the
     *  candidate; the input keeps the typed text so the user can fix it. */
    validate?: (candidate: string) => boolean | Promise<boolean>;
    /** Normalize before commit. Defaults to `.trim()`. */
    normalize?: (raw: string) => string;
    class?: string;
    /** Render override for individual chips. Default is a rounded pill. */
    renderTag?: (tag: string, remove: () => void) => JSX.Element;
    /** aria-label for the underlying text input. */
    inputAriaLabel?: string;
};
export declare const TagInput: (props: TagInputProps) => JSX.Element;
//# sourceMappingURL=tag-input.d.ts.map