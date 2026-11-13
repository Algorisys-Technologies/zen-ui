import * as React from "react";
/**
 * TagInput — type-and-press-Enter chip input. The text input lives at
 * the trailing edge of a wrap-friendly container; each committed value
 * renders as a removable chip ahead of it. The whole control behaves
 * like a single text-field for layout / focus purposes.
 *
 *   const [tags, setTags] = useState<string[]>(["react", "typescript"]);
 *   <TagInput value={tags} onValueChange={setTags} placeholder="Add a skill…" />
 *
 * Interaction model (mirrors GitHub / Linear / Notion patterns):
 *   - Type + Enter (or Tab, or any character in `delimiters`) commits
 *     the current input as a new tag.
 *   - Backspace on an empty input removes the trailing tag.
 *   - Click ✕ on any chip to remove that specific tag.
 *   - Paste handler splits the pasted text on `delimiters` so a
 *     comma-separated list pastes as multiple tags at once.
 *
 * `validate` lets callers gate commit — return false (or a falsy
 * promise) and the input keeps the candidate text so the user can fix
 * it instead of losing their typing. `unique` (default true) drops
 * duplicates silently.
 */
export interface TagInputProps {
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
    className?: string;
    /** Render override for individual chips. Default is a rounded pill. */
    renderTag?: (tag: string, remove: () => void) => React.ReactNode;
    /** aria-label for the underlying text input. */
    inputAriaLabel?: string;
}
export declare const TagInput: React.ForwardRefExoticComponent<TagInputProps & React.RefAttributes<HTMLInputElement>>;
//# sourceMappingURL=tag-input.d.ts.map