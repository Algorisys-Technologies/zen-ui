import { type JSX, createMemo, createSignal, For } from "solid-js";
import { cn } from "../../../lib/cn";

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

export const TagInput = (props: TagInputProps) => {
  const isControlled = () => props.value !== undefined;
  const [inner, setInner] = createSignal<string[]>(props.defaultValue ?? []);
  const tags = createMemo<string[]>(() => (isControlled() ? (props.value as string[]) : inner()));
  const [input, setInput] = createSignal("");
  const delimiters = () => props.delimiters ?? [","];
  const unique = () => props.unique ?? true;
  const normalize = (raw: string) =>
    props.normalize ? props.normalize(raw) : raw.trim();

  const setTags = (next: string[]) => {
    if (!isControlled()) setInner(next);
    props.onValueChange?.(next);
  };

  const commit = async (raw: string): Promise<boolean> => {
    const candidate = normalize(raw);
    if (!candidate) return false;
    const current = tags();
    if (unique() && current.includes(candidate)) return true;
    if (props.max !== undefined && current.length >= props.max) return false;
    if (props.validate) {
      const ok = await props.validate(candidate);
      if (!ok) return false;
    }
    setTags([...current, candidate]);
    return true;
  };

  const removeAt = (idx: number) => {
    const next = tags().slice();
    next.splice(idx, 1);
    setTags(next);
  };

  const onKeyDown = async (e: KeyboardEvent) => {
    const v = input();
    if (e.key === "Enter") {
      e.preventDefault();
      const ok = await commit(v);
      if (ok) setInput("");
    } else if (e.key === "Tab" && v.trim().length > 0) {
      const ok = await commit(v);
      if (ok) {
        e.preventDefault();
        setInput("");
      }
    } else if (e.key === "Backspace" && v.length === 0 && tags().length > 0) {
      removeAt(tags().length - 1);
    } else if (delimiters().includes(e.key) && v.trim().length > 0) {
      e.preventDefault();
      const ok = await commit(v);
      if (ok) setInput("");
    }
  };

  const onPaste = async (e: ClipboardEvent) => {
    const text = e.clipboardData?.getData("text") ?? "";
    if (!text) return;
    const pattern = new RegExp(
      `[${delimiters().map((d) => `\\${d}`).join("")}\\n\\r\\t]+`,
    );
    const parts = text.split(pattern).map(normalize).filter(Boolean);
    if (parts.length <= 1) return;
    e.preventDefault();
    let next = tags();
    for (const part of parts) {
      if (props.max !== undefined && next.length >= props.max) break;
      if (unique() && next.includes(part)) continue;
      if (props.validate) {
        const ok = await props.validate(part);
        if (!ok) continue;
      }
      next = [...next, part];
    }
    setTags(next);
  };

  return (
    <div
      class={cn(
        "zen-flex zen-flex-wrap zen-items-center zen-gap-1.5",
        "zen-min-h-10 zen-w-full zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background",
        "zen-px-2 zen-py-1.5 zen-text-sm",
        "focus-within:zen-outline-none focus-within:zen-ring-2 focus-within:zen-ring-zen-ring focus-within:zen-ring-offset-2",
        props.disabled && "zen-opacity-50 zen-cursor-not-allowed",
        props.class,
      )}
      onClick={(e) => {
        const target = e.target as HTMLElement;
        if (target.tagName !== "BUTTON" && target.tagName !== "INPUT") {
          (e.currentTarget as HTMLDivElement).querySelector("input")?.focus();
        }
      }}
    >
      <For each={tags()}>
        {(tag, i) =>
          props.renderTag ? (
            <>{props.renderTag(tag, () => removeAt(i()))}</>
          ) : (
            <span
              class={cn(
                "zen-inline-flex zen-items-center zen-gap-1 zen-px-2 zen-py-0.5",
                "zen-text-xs zen-font-medium",
                "zen-rounded-zen-full zen-bg-zen-primary-soft zen-text-zen-primary-soft-fg",
              )}
            >
              <span>{tag}</span>
              <button
                type="button"
                onClick={() => removeAt(i())}
                aria-label={`Remove ${tag}`}
                disabled={props.disabled}
                class={cn(
                  "zen-inline-flex zen-items-center zen-justify-center",
                  "zen-h-4 zen-w-4 zen-rounded-zen-full zen-bg-transparent zen-border-0 zen-cursor-pointer",
                  "zen-text-current zen-opacity-70 hover:zen-opacity-100 hover:zen-bg-black/10",
                  "focus-visible:zen-outline-none focus-visible:zen-ring-1 focus-visible:zen-ring-zen-ring",
                  "disabled:zen-cursor-not-allowed",
                )}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </span>
          )
        }
      </For>
      <input
        value={input()}
        onInput={(e) => setInput(e.currentTarget.value)}
        onKeyDown={onKeyDown}
        onPaste={onPaste}
        onBlur={async () => {
          if (input().trim().length === 0) return;
          const ok = await commit(input());
          if (ok) setInput("");
        }}
        placeholder={tags().length === 0 ? (props.placeholder ?? "Add a tag…") : ""}
        disabled={props.disabled}
        aria-label={props.inputAriaLabel}
        class={cn(
          "zen-flex-1 zen-min-w-[6rem] zen-bg-transparent zen-border-0",
          "zen-text-sm zen-outline-none placeholder:zen-text-zen-muted-fg",
          "disabled:zen-cursor-not-allowed",
        )}
      />
    </div>
  );
};
