import { cn } from "../../lib/cn";
import { Input } from "../form/input/input";
import { NumberField } from "../form/number-field/number-field";
import { anchorPopup, type AnchoredPopup } from "../../lib/anchored";
import { dismissable } from "../../lib/dismissable";
import { rovingFocus } from "../../lib/roving-focus";

/**
 * Inline cell editing for the vanilla DataTable: the three editors a column's
 * `meta.editVariant` picks (text, number, select). Mirrors React's and Solid's
 * edit-cell: the editor takes focus when it opens (its value selected, or the
 * cursor after what was typed when typing started it), Enter commits, Esc
 * cancels, blur commits, and an editor ends ONCE, whichever comes first.
 *
 * The table owns the editing state; an editor only reports how it ended.
 */

export type EditVariant = "text" | "number" | "select";

/** One edit, as `onCellEdit` / `onCellsEdit` receive it. */
export interface CellEditPayload {
  /** Stable row id: pass `getRowId` for one that survives a sort or an insert. */
  rowId: string;
  columnId: string;
  /** The committed value: a string for text and select, a number (or null when cleared) for number. */
  value: unknown;
}

export interface EditOption {
  label: string;
  value: string;
}

export interface CellEditorOptions {
  variant: EditVariant;
  initialValue: unknown;
  /** The edit began by typing: keep the cursor after what was typed, not select it. */
  seeded?: boolean;
  options?: EditOption[];
  onCommit: (value: unknown, how: "key" | "blur" | "pick") => void;
  onCancel: () => void;
  /**
   * True while the table moves the editor to a rebuilt row. Moving a focused
   * element blurs it, synchronously, mid-update; that blur is not the user
   * leaving the editor, so it must not commit. The table puts focus back.
   */
  moving: () => boolean;
}

export interface CellEditor {
  el: HTMLElement;
  /** The editor is in the document: take focus as it opens (value selected, or the cursor after a typed start). */
  start(): void;
  /** Focus the editor's own control again (after the table moved it). */
  focus(): void;
  /** Whether focus is inside the editor (its popup included). */
  holdsFocus(): boolean;
  destroy(): void;
}

const EDITOR_WRAP_CLASS =
  "zen-flex zen-items-center zen-w-full zen-h-full zen-m-[-0.5rem] zen-p-[0.4rem] zen-bg-zen-background zen-ring-2 zen-ring-zen-ring zen-rounded-zen-sm";
const EDITOR_INPUT_CLASS = "zen-h-7 zen-text-sm zen-border-0 zen-ring-0 focus-visible:zen-ring-0 zen-px-1";

/**
 * An editor ends once: whichever of commit and cancel comes first wins, and
 * the other is ignored. Cancelling removes the input, and removing a focused
 * input fires its blur, which must not then save what Esc threw away.
 */
function endsOnce(opts: CellEditorOptions) {
  let done = false;
  return {
    commit: (value: unknown, how: "key" | "blur" | "pick") => {
      if (done) return;
      done = true;
      opts.onCommit(value, how);
    },
    cancel: () => {
      if (done) return;
      done = true;
      opts.onCancel();
    },
    get done() {
      return done;
    },
  };
}

function textEditor(opts: CellEditorOptions): CellEditor {
  const end = endsOnce(opts);
  const wrap = document.createElement("div");
  wrap.className = EDITOR_WRAP_CLASS;
  const input = Input({
    value: String(opts.initialValue ?? ""),
    class: EDITOR_INPUT_CLASS,
    onKeyDown: (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        end.commit(input.el.value, "key");
      } else if (e.key === "Escape") {
        e.preventDefault();
        end.cancel();
      }
    },
    onBlur: () => {
      if (!opts.moving()) end.commit(input.el.value, "blur");
    },
  });
  wrap.append(input.el);
  return {
    el: wrap,
    start() {
      const el = input.el;
      el.focus({ preventScroll: true });
      if (opts.seeded) el.setSelectionRange(el.value.length, el.value.length);
      else el.select();
    },
    focus() {
      input.el.focus({ preventScroll: true });
    },
    holdsFocus: () => wrap.contains(document.activeElement),
    destroy() {
      input.destroy();
      wrap.remove();
    },
  };
}

function numberEditor(opts: CellEditorOptions): CellEditor {
  const end = endsOnce(opts);
  const iv = opts.initialValue;
  const initial =
    typeof iv === "number" ? iv : iv === "" || iv === null || iv === undefined ? null : Number(iv);
  let value: number | null = Number.isNaN(initial as number) ? null : initial;
  const wrap = document.createElement("div");
  wrap.className = EDITOR_WRAP_CLASS;
  wrap.tabIndex = -1;
  const field = NumberField({
    value,
    class: EDITOR_INPUT_CLASS,
    onValueChange: (v) => (value = v),
  });
  wrap.append(field.el);
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      end.commit(value, "key");
    } else if (e.key === "Escape") {
      e.preventDefault();
      end.cancel();
    }
  };
  // Only when focus leaves the whole editor, not on a jump inside it (the ± steppers).
  const onOut = (e: FocusEvent) => {
    if (opts.moving()) return;
    if (!wrap.contains(e.relatedTarget as Node | null)) end.commit(value, "blur");
  };
  wrap.addEventListener("keydown", onKey);
  wrap.addEventListener("focusout", onOut);
  const input = () => field.el.querySelector("input");
  return {
    el: wrap,
    // The editor takes focus with its value selected: without it, it opened
    // with focus nowhere and typing went to the page. A number input has no
    // settable cursor; focusing leaves it after the value.
    start() {
      const el = input();
      el?.focus({ preventScroll: true });
      if (!opts.seeded) el?.select();
    },
    focus() {
      input()?.focus({ preventScroll: true });
    },
    holdsFocus: () => wrap.contains(document.activeElement),
    destroy() {
      wrap.removeEventListener("keydown", onKey);
      wrap.removeEventListener("focusout", onOut);
      field.destroy();
      wrap.remove();
    },
  };
}

const CHEVRON = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>`;
const CHECK = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>`;
let selectUid = 0;

/**
 * The select editor opens its list at once, on the current value. A pick
 * commits it; closing the list without one (Esc, a click elsewhere) cancels.
 * The list is portalled and placed against the cell (lib/anchored), so a
 * table that scrolls does not cut it off: React's Radix Select does the same.
 */
function selectEditor(opts: CellEditorOptions): CellEditor {
  const end = endsOnce(opts);
  const options = opts.options ?? [];
  const current = String(opts.initialValue ?? "");
  const id = `zen-cell-select-${++selectUid}`;
  const wrap = document.createElement("div");
  wrap.className = EDITOR_WRAP_CLASS;

  const trigger = document.createElement("button");
  trigger.type = "button";
  trigger.id = `${id}-trigger`;
  trigger.setAttribute("role", "combobox");
  trigger.setAttribute("aria-haspopup", "listbox");
  trigger.setAttribute("aria-expanded", "true");
  trigger.setAttribute("aria-controls", `${id}-listbox`);
  trigger.className = cn(
    "zen-flex zen-items-center zen-justify-between zen-gap-2 zen-px-zen-control-x zen-w-full",
    "zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-text-zen-foreground",
    "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
    "zen-h-7 zen-text-sm",
  );
  const valueSpan = document.createElement("span");
  valueSpan.className = "zen-truncate";
  valueSpan.textContent = options.find((o) => o.value === current)?.label ?? "";
  const chev = document.createElement("span");
  chev.className = "zen-text-zen-muted-fg";
  chev.innerHTML = CHEVRON;
  trigger.append(valueSpan, chev);
  wrap.append(trigger);

  const listbox = document.createElement("div");
  listbox.id = `${id}-listbox`;
  listbox.setAttribute("role", "listbox");
  listbox.setAttribute("aria-labelledby", trigger.id);
  listbox.className = cn(
    "zen-z-50 zen-min-w-32 zen-overflow-y-auto",
    "zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-p-1 zen-text-zen-foreground zen-shadow-zen-md",
  );
  const items: HTMLElement[] = [];
  const cleanups: Array<() => void> = [];
  for (const o of options) {
    const item = document.createElement("div");
    item.setAttribute("role", "option");
    item.dataset.value = o.value;
    item.tabIndex = -1;
    item.setAttribute("aria-selected", String(o.value === current));
    item.className = cn(
      "zen-relative zen-flex zen-w-full zen-cursor-default zen-select-none zen-items-center zen-rounded-zen-sm zen-py-zen-menu-y zen-pl-8 zen-pr-2 zen-text-sm zen-outline-none",
      "focus:zen-bg-zen-muted hover:zen-bg-zen-muted",
    );
    const tick = document.createElement("span");
    tick.className = "zen-absolute zen-start-2 zen-flex zen-h-3.5 zen-w-3.5 zen-items-center zen-justify-center";
    tick.innerHTML = CHECK;
    tick.style.visibility = o.value === current ? "visible" : "hidden";
    const text = document.createElement("span");
    text.textContent = o.label;
    item.append(tick, text);
    const pick = () => end.commit(o.value, "pick");
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        pick();
      }
    };
    item.addEventListener("click", pick);
    item.addEventListener("keydown", onKey);
    cleanups.push(() => {
      item.removeEventListener("click", pick);
      item.removeEventListener("keydown", onKey);
    });
    listbox.append(item);
    items.push(item);
  }
  const onListKey = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      end.cancel();
    } else if (e.key === "Tab") {
      // Tab leaves the list: as Radix's Select, the edit is cancelled.
      e.preventDefault();
      end.cancel();
    }
  };
  listbox.addEventListener("keydown", onListKey);
  cleanups.push(() => listbox.removeEventListener("keydown", onListKey));
  const onTriggerKey = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      end.cancel();
    }
  };
  trigger.addEventListener("keydown", onTriggerKey);
  cleanups.push(() => trigger.removeEventListener("keydown", onTriggerKey));

  const focusSelected = () =>
    (items.find((i) => i.dataset.value === current) ?? items[0])?.focus({ preventScroll: true });
  let placed: AnchoredPopup | null = null;
  let releaseDismiss: (() => void) | null = null;
  let releaseRoving: (() => void) | null = null;
  // Opened once the editor is in the document (the table calls focus()).
  const open = () => {
    if (placed || end.done || !wrap.isConnected) return;
    placed = anchorPopup({
      anchor: trigger,
      popup: listbox,
      maxHeight: 288,
      onPlace: () => items.find((i) => i.dataset.value === current)?.scrollIntoView({ block: "nearest" }),
    });
    releaseDismiss = dismissable(listbox, {
      ignore: [trigger],
      // Closing the list without a pick: back to the value as it was.
      onDismiss: () => end.cancel(),
      disableEscape: true,
    });
    releaseRoving = rovingFocus(listbox, { items: () => items, orientation: "vertical" });
  };
  return {
    el: wrap,
    start() {
      open();
      focusSelected();
    },
    focus() {
      if (!listbox.contains(document.activeElement)) focusSelected();
    },
    holdsFocus: () => wrap.contains(document.activeElement) || listbox.contains(document.activeElement),
    destroy() {
      for (const c of cleanups) c();
      releaseDismiss?.();
      releaseRoving?.();
      placed?.destroy();
      listbox.remove();
      wrap.remove();
    },
  };
}

/** The editor `variant` names, opened on `initialValue`. */
export function createCellEditor(opts: CellEditorOptions): CellEditor {
  switch (opts.variant) {
    case "number":
      return numberEditor(opts);
    case "select":
      return selectEditor(opts);
    case "text":
    default:
      return textEditor(opts);
  }
}

/**
 * The value an edit started by typing begins from: a digit for a number,
 * anything for text; a select just opens on its value.
 */
export function seededValue(variant: EditVariant, value: unknown, seed: string | undefined): unknown {
  if (seed === undefined || variant === "select") return value;
  if (variant === "number") return /^[0-9]$/.test(seed) ? Number(seed) : null;
  return seed;
}
