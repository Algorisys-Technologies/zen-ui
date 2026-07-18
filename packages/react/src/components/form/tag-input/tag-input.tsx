import * as React from "react";
import { cn } from "../../../lib/cn";

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

export const TagInput = React.forwardRef<HTMLInputElement, TagInputProps>(
  (
    {
      value: valueProp,
      defaultValue,
      onValueChange,
      placeholder = "Add a tag…",
      disabled,
      max,
      delimiters = [","],
      unique = true,
      validate,
      normalize = (s) => s.trim(),
      className,
      renderTag,
      inputAriaLabel,
    },
    ref,
  ) => {
    const [tagsInner, setTagsInner] = React.useState<string[]>(
      defaultValue ?? [],
    );
    const tags = valueProp ?? tagsInner;
    const [input, setInput] = React.useState("");

    const setTags = React.useCallback(
      (next: string[]) => {
        if (valueProp === undefined) setTagsInner(next);
        onValueChange?.(next);
      },
      [valueProp, onValueChange],
    );

    const commit = React.useCallback(
      async (raw: string): Promise<boolean> => {
        const candidate = normalize(raw);
        if (!candidate) return false;
        if (unique && tags.includes(candidate)) return true; // already present, consume input
        if (max !== undefined && tags.length >= max) return false;
        if (validate) {
          const ok = await validate(candidate);
          if (!ok) return false;
        }
        setTags([...tags, candidate]);
        return true;
      },
      [tags, max, unique, validate, normalize, setTags],
    );

    const removeAt = (idx: number) => {
      const next = tags.slice();
      next.splice(idx, 1);
      setTags(next);
    };

    const onKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const ok = await commit(input);
        if (ok) setInput("");
      } else if (e.key === "Tab" && input.trim().length > 0) {
        // Tab also commits unless empty — lets the user move focus on.
        const ok = await commit(input);
        if (ok) {
          e.preventDefault();
          setInput("");
        }
      } else if (
        e.key === "Backspace" &&
        input.length === 0 &&
        tags.length > 0
      ) {
        removeAt(tags.length - 1);
      } else if (delimiters.includes(e.key) && input.trim().length > 0) {
        e.preventDefault();
        const ok = await commit(input);
        if (ok) setInput("");
      }
    };

    const onPaste = async (e: React.ClipboardEvent<HTMLInputElement>) => {
      const text = e.clipboardData.getData("text");
      if (!text) return;
      const pattern = new RegExp(
        `[${delimiters.map((d) => `\\${d}`).join("")}\\n\\r\\t]+`,
      );
      const parts = text.split(pattern).map(normalize).filter(Boolean);
      if (parts.length <= 1) return; // single token: let it land normally
      e.preventDefault();
      let next = tags;
      for (const part of parts) {
        if (max !== undefined && next.length >= max) break;
        if (unique && next.includes(part)) continue;
        if (validate) {
          const ok = await validate(part);
          if (!ok) continue;
        }
        next = [...next, part];
      }
      setTags(next);
    };

    return (
      <div
        className={cn(
          "zen-flex zen-flex-wrap zen-items-center zen-gap-1.5",
          "zen-min-h-10 zen-w-full zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background",
          "zen-px-2 zen-py-1.5 zen-text-sm",
          "focus-within:zen-outline-none focus-within:zen-ring-2 focus-within:zen-ring-zen-ring focus-within:zen-ring-offset-2",
          disabled && "zen-opacity-50 zen-cursor-not-allowed",
          className,
        )}
        onClick={(e) => {
          /* Click anywhere in the wrap region to focus the input —
           * makes the whole tile feel like one big text field. */
          const target = e.target as HTMLElement;
          if (target.tagName !== "BUTTON" && target.tagName !== "INPUT") {
            const input = (e.currentTarget as HTMLDivElement).querySelector(
              "input",
            );
            input?.focus();
          }
        }}
      >
        {tags.map((tag, i) =>
          renderTag ? (
            <React.Fragment key={`${tag}-${i}`}>
              {renderTag(tag, () => removeAt(i))}
            </React.Fragment>
          ) : (
            <span
              key={`${tag}-${i}`}
              className={cn(
                "zen-inline-flex zen-items-center zen-gap-1 zen-px-2 zen-py-0.5",
                "zen-text-xs zen-font-medium",
                "zen-rounded-zen-full zen-bg-zen-primary-soft zen-text-zen-primary-soft-fg",
              )}
            >
              <span>{tag}</span>
              <button
                type="button"
                onClick={() => removeAt(i)}
                aria-label={`Remove ${tag}`}
                disabled={disabled}
                className={cn(
                  "zen-inline-flex zen-items-center zen-justify-center",
                  "zen-h-4 zen-w-4 zen-rounded-zen-full zen-bg-transparent zen-border-0 zen-cursor-pointer",
                  "zen-text-current zen-opacity-70 hover:zen-opacity-100 hover:zen-bg-black/10",
                  "focus-visible:zen-outline-none focus-visible:zen-ring-1 focus-visible:zen-ring-zen-ring",
                  "disabled:zen-cursor-not-allowed",
                )}
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </span>
          ),
        )}
        <input
          ref={ref}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          onPaste={onPaste}
          onBlur={async () => {
            /* Commit pending text on blur — most users expect this. */
            if (input.trim().length === 0) return;
            const ok = await commit(input);
            if (ok) setInput("");
          }}
          placeholder={tags.length === 0 ? placeholder : ""}
          disabled={disabled}
          aria-label={inputAriaLabel}
          className={cn(
            "zen-flex-1 zen-min-w-[6rem] zen-bg-transparent zen-border-0",
            "zen-text-sm zen-outline-none placeholder:zen-text-zen-muted-fg",
            "disabled:zen-cursor-not-allowed",
          )}
        />
      </div>
    );
  },
);
TagInput.displayName = "TagInput";
