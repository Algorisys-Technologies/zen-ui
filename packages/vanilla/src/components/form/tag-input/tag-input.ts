import { cn } from "../../../lib/cn";
import { Disposer, type ZenComponent } from "../../../lib/component";
import { controllable } from "../../../lib/state";

/**
 * TagInput — type-and-press-Enter chip input. The text input lives at the
 * trailing edge of a wrap-friendly container; each committed value renders as a
 * removable chip ahead of it. The whole control behaves like a single text-field
 * for layout / focus purposes.
 *
 *   const ti = TagInput({ value: ["react", "typescript"], onValueChange: console.log });
 *   document.body.append(ti.el);
 *
 * Interaction model (mirrors GitHub / Linear / Notion patterns):
 *   - Type + Enter (or Tab, or any character in `delimiters`) commits the
 *     current input as a new tag.
 *   - Backspace on an empty input removes the trailing tag.
 *   - Click ✕ on any chip to remove that specific tag.
 *   - Paste handler splits the pasted text on `delimiters` so a comma-separated
 *     list pastes as multiple tags at once.
 *
 * `validate` lets callers gate commit — return false (or a falsy promise) and
 * the input keeps the candidate text so the user can fix it instead of losing
 * their typing. `unique` (default true) drops duplicates silently.
 *
 * The React binding is controlled by re-rendering on a new `value` prop; here
 * the same loop is explicit — `onValueChange` fires always (even controlled),
 * and a controlled caller pushes the new array back via `update({ value })`.
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
  /** Per-tag validator. Return false / falsy-promise to reject the candidate;
   *  the input keeps the typed text so the user can fix it. */
  validate?: (candidate: string) => boolean | Promise<boolean>;
  /** Normalize before commit. Defaults to `.trim()`. */
  normalize?: (raw: string) => string;
  class?: string;
  /** Render override for individual chips. Default is a rounded pill. */
  renderTag?: (tag: string, remove: () => void) => Node;
  /** aria-label for the underlying text input. */
  inputAriaLabel?: string;
}

const arraysEqual = (a: string[], b: string[]) =>
  a.length === b.length && a.every((v, i) => v === b[i]);

const CHIP_CLASS = cn(
  "zen-inline-flex zen-items-center zen-gap-1 zen-px-2 zen-py-0.5",
  "zen-text-xs zen-font-medium",
  "zen-rounded-zen-full zen-bg-zen-primary-soft zen-text-zen-primary-soft-fg",
);

const CHIP_REMOVE_CLASS = cn(
  "zen-inline-flex zen-items-center zen-justify-center",
  "zen-h-4 zen-w-4 zen-rounded-zen-full zen-bg-transparent zen-border-0 zen-cursor-pointer",
  "zen-text-current zen-opacity-70 hover:zen-opacity-100 hover:zen-bg-black/10",
  "focus-visible:zen-outline-none focus-visible:zen-ring-1 focus-visible:zen-ring-zen-ring",
  "disabled:zen-cursor-not-allowed",
);

/** The ✕ glyph React draws inline — built here without innerHTML. */
function removeGlyph(): SVGSVGElement {
  const NS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("width", "10");
  svg.setAttribute("height", "10");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "3");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  svg.setAttribute("aria-hidden", "true");
  for (const [x1, y1, x2, y2] of [
    ["18", "6", "6", "18"],
    ["6", "6", "18", "18"],
  ]) {
    const line = document.createElementNS(NS, "line");
    line.setAttribute("x1", x1);
    line.setAttribute("y1", y1);
    line.setAttribute("x2", x2);
    line.setAttribute("y2", y2);
    svg.append(line);
  }
  return svg;
}

export function TagInput(props: TagInputProps): ZenComponent<TagInputProps, HTMLDivElement> {
  let current: TagInputProps = { ...props };
  const disposer = new Disposer();

  const on = <K extends keyof HTMLElementEventMap>(
    target: EventTarget,
    type: K | string,
    fn: (e: Event) => void,
  ) => {
    target.addEventListener(type, fn as EventListener);
    disposer.add(() => target.removeEventListener(type, fn as EventListener));
  };

  const state = controllable<string[]>({
    value: current.value,
    defaultValue: current.defaultValue ?? [],
    onChange: (v) => current.onValueChange?.(v),
    equals: arraysEqual,
  });

  const getDelims = () => current.delimiters ?? [","];
  const isUnique = () => current.unique ?? true;
  const normalize = (raw: string) => (current.normalize ? current.normalize(raw) : raw.trim());

  const commit = async (raw: string): Promise<boolean> => {
    const candidate = normalize(raw);
    const tags = state.get();
    if (!candidate) return false;
    if (isUnique() && tags.includes(candidate)) return true; // already present, consume input
    if (current.max !== undefined && tags.length >= current.max) return false;
    if (current.validate) {
      const ok = await current.validate(candidate);
      if (!ok) return false;
    }
    state.set([...tags, candidate]);
    return true;
  };

  const removeAt = (idx: number) => {
    const next = state.get().slice();
    next.splice(idx, 1);
    state.set(next);
  };

  // --- DOM ------------------------------------------------------------------
  const el = document.createElement("div");
  const input = document.createElement("input");
  input.className = cn(
    "zen-flex-1 zen-min-w-[6rem] zen-bg-transparent zen-border-0",
    "zen-text-sm zen-outline-none placeholder:zen-text-zen-muted-fg",
    "disabled:zen-cursor-not-allowed",
  );
  el.append(input);

  const buildChip = (tag: string, i: number): Node => {
    if (current.renderTag) return current.renderTag(tag, () => removeAt(i));

    const span = document.createElement("span");
    span.className = CHIP_CLASS;

    const label = document.createElement("span");
    label.textContent = tag;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = CHIP_REMOVE_CLASS;
    btn.setAttribute("aria-label", `Remove ${tag}`);
    btn.disabled = !!current.disabled;
    btn.addEventListener("click", () => removeAt(i));
    btn.append(removeGlyph());

    span.append(label, btn);
    return span;
  };

  const updatePlaceholder = () => {
    input.placeholder = state.get().length === 0 ? current.placeholder ?? "Add a tag…" : "";
  };

  const renderChrome = () => {
    el.className = cn(
      "zen-flex zen-flex-wrap zen-items-center zen-gap-1.5",
      "zen-min-h-10 zen-w-full zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background",
      "zen-px-2 zen-py-1.5 zen-text-sm",
      "focus-within:zen-outline-none focus-within:zen-ring-2 focus-within:zen-ring-zen-ring focus-within:zen-ring-offset-2",
      current.disabled && "zen-opacity-50 zen-cursor-not-allowed",
      current.class,
    );
    input.disabled = !!current.disabled;
    if (current.inputAriaLabel) input.setAttribute("aria-label", current.inputAriaLabel);
    else input.removeAttribute("aria-label");
    updatePlaceholder();
  };

  const renderTags = () => {
    // Rebuild the chips ahead of the input; the input node stays put so it never
    // loses focus (Backspace-to-remove happens while it is focused).
    while (el.firstChild && el.firstChild !== input) el.removeChild(el.firstChild);
    state.get().forEach((tag, i) => el.insertBefore(buildChip(tag, i), input));
    updatePlaceholder();
  };

  disposer.add(state.subscribe(renderTags));

  // --- listeners ------------------------------------------------------------
  on(el, "click", (e) => {
    /* Click anywhere in the wrap region to focus the input — makes the whole
     * tile feel like one big text field. */
    const target = e.target as HTMLElement;
    if (target.tagName !== "BUTTON" && target.tagName !== "INPUT") input.focus();
  });

  on(input, "keydown", async (e) => {
    const ev = e as KeyboardEvent;
    const value = input.value;
    if (ev.key === "Enter") {
      ev.preventDefault();
      if (await commit(value)) input.value = "";
    } else if (ev.key === "Tab" && value.trim().length > 0) {
      // Tab also commits unless empty — lets the user move focus on.
      if (await commit(value)) {
        ev.preventDefault();
        input.value = "";
      }
    } else if (ev.key === "Backspace" && value.length === 0 && state.get().length > 0) {
      removeAt(state.get().length - 1);
    } else if (getDelims().includes(ev.key) && value.trim().length > 0) {
      ev.preventDefault();
      if (await commit(value)) input.value = "";
    }
  });

  on(input, "paste", async (e) => {
    const text = (e as ClipboardEvent).clipboardData?.getData("text");
    if (!text) return;
    const pattern = new RegExp(`[${getDelims().map((d) => `\\${d}`).join("")}\\n\\r\\t]+`);
    const parts = text.split(pattern).map(normalize).filter(Boolean);
    if (parts.length <= 1) return; // single token: let it land normally
    e.preventDefault();
    let next = state.get();
    for (const part of parts) {
      if (current.max !== undefined && next.length >= current.max) break;
      if (isUnique() && next.includes(part)) continue;
      if (current.validate) {
        const ok = await current.validate(part);
        if (!ok) continue;
      }
      next = [...next, part];
    }
    state.set(next);
  });

  on(input, "blur", async () => {
    /* Commit pending text on blur — most users expect this. */
    if (input.value.trim().length === 0) return;
    if (await commit(input.value)) input.value = "";
  });

  renderChrome();
  renderTags();

  return {
    el,
    update(next) {
      current = { ...current, ...next };
      // A controlled caller hands back a new array here; sync it in so the chips
      // re-render (state.subscribe fires renderTags).
      if (next.value !== undefined) state.sync(next.value);
      renderChrome();
      renderTags();
    },
    destroy() {
      disposer.dispose();
      el.remove();
    },
  };
}
