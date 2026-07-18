import { cn } from "../../lib/cn";
import { applyProps, Disposer, type ZenComponent } from "../../lib/component";
import { controllable } from "../../lib/state";
import { dismissable } from "../../lib/dismissable";
import { setPresence } from "../../lib/presence";
import { Button } from "../button/button";

/**
 * Combobox — a searchable single-select with optional async option loading.
 *
 *   Combobox({
 *     options: [{ value: "a", label: "Alpha" }, …],
 *     value: picked,
 *     onValueChange: (v, opt) => setPicked(v),
 *     placeholder: "Pick one",
 *   })
 *
 * ## What Radix + cmdk did, and who does it here
 *
 * React builds this on cmdk (fuzzy filtering + keyboard) inside a Radix Popover
 * (positioning + dismissal). With no primitive library the two jobs split:
 *
 *  - The Popover half is `select.ts`'s call — an absolutely-positioned panel on a
 *    relative wrapper, `dismissable` for Escape + click-outside, `setPresence` for
 *    the enter/exit animation. No portal: the panel is the trigger's width and
 *    sits directly under it, so there is nothing to escape a clipping ancestor for.
 *  - The cmdk half — the search input, the filter, the roving highlight, the
 *    keyboard — is written out below. The highlight is NOT DOM focus (focus stays
 *    on the input so the user can keep typing); it is a `data-selected` attribute
 *    on the active row, which is exactly cmdk's own `data-[selected=true]` contract
 *    and reuses the same class string React ships.
 *
 * ## The three modes, matching React's public API exactly
 *
 *  - **Synchronous**: pass `options`. Filtered in memory as you type, matching the
 *    label and every keyword.
 *  - **Async**: pass `onSearch` instead. Every keystroke is debounced, the previous
 *    request is abandoned (a stale response cannot overwrite a newer one), and the
 *    list shows a loader while in flight. `onSearch` replaces `options`; in-memory
 *    filtering is off, because the server already filtered.
 *  - **Creatable**: `creatable` + `onCreate`. When the typed text matches no
 *    option's LABEL (what the user reads, not the value), a create row is offered
 *    instead of "No results". Adding the option to the caller's list is always the
 *    caller's — the component cannot know where the list lives or what a new
 *    `value` should be. RETURN the new option from `onCreate` and it is selected
 *    for you; return nothing and the value is left alone.
 */

export interface ComboboxOption {
  value: string;
  label: string;
  /** Optional extra text used by the fuzzy match. */
  keywords?: string[];
  disabled?: boolean;
}

export interface ComboboxProps {
  /** Static option list (synchronous mode). Ignored if `onSearch` is provided. */
  options?: ComboboxOption[];
  /** Async loader (server-driven). Called on every input change, debounced. */
  onSearch?: (query: string) => Promise<ComboboxOption[]>;
  /** Selected value. Pass "" to clear. */
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
   * Called with the typed text when the create row is chosen. Adding the option to
   * your list is always yours. RETURN the new option and it is selected for you;
   * return nothing and the value is left alone.
   */
  onCreate?: (label: string) => ComboboxOption | void;
  /** Verb on the create row — `Create "foo"`. Default "Create". */
  createLabel?: string;
  /** Trigger button's width. Defaults to 240. */
  width?: number | string;
  disabled?: boolean;
  class?: string;
  id?: string;
  [key: `data-${string}`]: unknown;
}

/** Our own trusted markup — never a caller's string. See PORTING.md. */
const CHEVRON = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>`;
const CHECK = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>`;
const PLUS = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`;
const SEARCH = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="zen-mr-2 zen-shrink-0 zen-opacity-50" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`;

const svgNode = (markup: string): SVGElement => {
  const t = document.createElement("template");
  t.innerHTML = markup;
  return t.content.firstChild as SVGElement;
};

let uid = 0;

/** A selectable row in the list: an option pick, or the create row. */
interface Row {
  el: HTMLElement;
  select: () => void;
}

export function Combobox(props: ComboboxProps): ZenComponent<ComboboxProps> {
  let current: ComboboxProps = { ...props };
  const id = current.id ?? `zen-combobox-${++uid}`;

  const el = document.createElement("div");
  const disposer = new Disposer();
  const session = new Disposer();
  let removeProps: (() => void) | undefined;

  let open = false;
  let query = "";

  // Async-mode state
  let asyncResults: ComboboxOption[] = [];
  let asyncLoading = false;
  let ac: AbortController | null = null;
  let debounceTimer: ReturnType<typeof setTimeout> | undefined;
  let seq = 0;

  // Last-known label for the selected value, so the trigger keeps reading right
  // even when that value is not in the current async result page.
  let lastLabel = "";

  const isAsync = () => typeof current.onSearch === "function";
  const allOptions = (): ComboboxOption[] => (isAsync() ? asyncResults : current.options ?? []);

  const state = controllable<string>({
    value: current.value,
    defaultValue: current.defaultValue ?? "",
  });

  /* ------------------------------- trigger ------------------------------- */

  const labelSpan = document.createElement("span");
  labelSpan.style.overflow = "hidden";
  labelSpan.style.textOverflow = "ellipsis";

  const widthOf = (): string =>
    typeof current.width === "number" ? `${current.width}px` : current.width ?? "240px";

  const trigger = Button({
    variant: "outline",
    color: "neutral",
    disabled: current.disabled,
    class: cn("zen-justify-between zen-font-normal", current.class),
    style: { width: widthOf() },
    iconRight: svgNode(CHEVRON),
    children: labelSpan,
    onClick: () => (open ? close() : openList()),
  });
  const triggerEl = trigger.el as HTMLButtonElement;
  triggerEl.setAttribute("role", "combobox");
  triggerEl.setAttribute("aria-expanded", "false");
  triggerEl.setAttribute("aria-controls", id);
  triggerEl.setAttribute("aria-haspopup", "listbox");

  /* --------------------------------- panel ------------------------------- */

  const panel = document.createElement("div");
  panel.id = id;
  // No display-utility on the panel: it is toggled by the `hidden` attribute, and
  // `.zen-flex { display:flex }` — loaded after preflight — would override
  // `[hidden] { display:none }` and leave a "closed" panel on screen. The input
  // wrapper and list are block-level and already stack vertically, so nothing is
  // lost. This is the same reason select.ts keeps its listbox flex-free.
  panel.className = cn(
    "zen-absolute zen-left-0 zen-top-full zen-mt-1 zen-z-50 zen-overflow-hidden",
    "zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-text-zen-foreground zen-shadow-md",
    "data-[state=open]:zen-anim-fade-in data-[state=closed]:zen-anim-fade-out",
  );
  panel.hidden = true;

  const inputWrapper = document.createElement("div");
  inputWrapper.className = "zen-flex zen-items-center zen-border-b zen-border-zen-border zen-px-3";
  const input = document.createElement("input");
  input.type = "text";
  input.className = cn(
    "zen-flex zen-h-10 zen-w-full zen-bg-transparent zen-py-3 zen-text-sm zen-outline-none",
    "placeholder:zen-text-zen-muted-fg",
    "disabled:zen-cursor-not-allowed disabled:zen-opacity-50",
  );
  input.setAttribute("role", "combobox");
  input.setAttribute("aria-autocomplete", "list");
  inputWrapper.append(svgNode(SEARCH), input);

  const list = document.createElement("div");
  list.className = "zen-max-h-72 zen-overflow-y-auto zen-overflow-x-hidden";
  list.setAttribute("role", "listbox");

  panel.append(inputWrapper, list);

  /* ------------------------------ filtering ------------------------------ */

  // Substring match on the label plus every keyword — the same terms cmdk fuzzes.
  const matches = (o: ComboboxOption, q: string): boolean => {
    if (!q) return true;
    const hay = `${o.label} ${(o.keywords ?? []).join(" ")}`.toLowerCase();
    return hay.includes(q.toLowerCase());
  };

  /* ----------------------------- active row ------------------------------ */

  let rows: Row[] = [];
  let activeIndex = -1;

  const paintActive = () => {
    rows.forEach((r, i) => r.el.setAttribute("data-selected", String(i === activeIndex)));
    rows[activeIndex]?.el.scrollIntoView({ block: "nearest" });
  };

  const setActive = (i: number) => {
    if (rows.length === 0) {
      activeIndex = -1;
      return;
    }
    activeIndex = ((i % rows.length) + rows.length) % rows.length;
    paintActive();
  };

  /* --------------------------- committing value -------------------------- */

  const commit = (next: string, opt: ComboboxOption | null) => {
    current.onValueChange?.(next, opt);
    // Uncontrolled: stores and notifies subscribers (which repaint the trigger).
    // Controlled: no-op store; the caller repaints via update(). Either way
    // onValueChange has already fired.
    state.set(next);
    paintTrigger();
  };

  const pick = (o: ComboboxOption) => {
    if (o.disabled) return;
    const next = o.value === state.get() ? "" : o.value;
    const nextOpt = next === "" ? null : allOptions().find((x) => x.value === next) ?? null;
    commit(next, nextOpt);
    close();
  };

  const doCreate = (typed: string) => {
    const created = current.onCreate?.(typed);
    if (created) {
      // Cache the label BEFORE committing: the caller's options update has not
      // landed yet, so a lookup would miss and the trigger would fall back to the
      // placeholder.
      lastLabel = created.label;
      commit(created.value, created);
    }
    query = "";
    input.value = "";
    close();
  };

  /* ------------------------------ list render ---------------------------- */

  const renderList = () => {
    rows = [];
    activeIndex = -1;
    list.replaceChildren();

    const selected = state.get();
    const opts = allOptions();
    const visible = isAsync() ? opts : opts.filter((o) => matches(o, query));

    const typed = query.trim();
    const alreadyExists = opts.some((o) => o.label.trim().toLowerCase() === typed.toLowerCase());
    const showCreate = Boolean(current.creatable && current.onCreate) && typed.length > 0 && !alreadyExists;

    if (isAsync() && asyncLoading) {
      const loading = document.createElement("div");
      loading.className = "zen-py-4 zen-text-center zen-text-sm zen-text-zen-muted-fg";
      loading.textContent = "Searching…";
      list.append(loading);
    }

    if (!asyncLoading && visible.length === 0 && !showCreate) {
      const empty = document.createElement("div");
      empty.className = "zen-py-6 zen-text-center zen-text-sm zen-text-zen-muted-fg";
      empty.textContent = current.emptyMessage ?? "No results.";
      list.append(empty);
    }

    if (visible.length > 0) {
      const group = document.createElement("div");
      group.setAttribute("role", "group");
      group.className = "zen-overflow-hidden zen-p-1 zen-text-zen-foreground";
      for (const o of visible) {
        const item = document.createElement("div");
        item.setAttribute("role", "option");
        item.dataset.value = o.value;
        item.className = cn(
          "zen-relative zen-flex zen-cursor-default zen-select-none zen-items-center zen-gap-2 zen-rounded-zen-sm zen-px-2 zen-py-1.5 zen-text-sm zen-outline-none",
          "data-[selected=true]:zen-bg-zen-muted",
          "data-[disabled=true]:zen-pointer-events-none data-[disabled=true]:zen-opacity-50",
        );
        item.setAttribute("aria-selected", String(o.value === selected));

        const check = svgNode(CHECK);
        check.style.opacity = o.value === selected ? "1" : "0";
        check.style.marginRight = "6px";
        const text = document.createElement("span");
        text.style.flex = "1";
        text.textContent = o.label;
        item.append(check, text);

        if (o.disabled) {
          item.setAttribute("data-disabled", "true");
        } else {
          const rowIndex = rows.length;
          item.addEventListener("click", () => pick(o));
          item.addEventListener("pointermove", () => setActive(rowIndex));
          rows.push({ el: item, select: () => pick(o) });
        }
        group.append(item);
      }
      list.append(group);
    }

    if (showCreate) {
      const group = document.createElement("div");
      group.setAttribute("role", "group");
      group.className = "zen-overflow-hidden zen-p-1 zen-text-zen-foreground";
      const item = document.createElement("div");
      item.setAttribute("role", "option");
      item.className = cn(
        "zen-relative zen-flex zen-cursor-default zen-select-none zen-items-center zen-gap-2 zen-rounded-zen-sm zen-px-2 zen-py-1.5 zen-text-sm zen-outline-none",
        "data-[selected=true]:zen-bg-zen-muted",
      );
      const plus = svgNode(PLUS);
      plus.style.marginRight = "6px";
      const text = document.createElement("span");
      text.style.flex = "1";
      text.textContent = `${current.createLabel ?? "Create"} “${typed}”`;
      item.append(plus, text);
      const rowIndex = rows.length;
      item.addEventListener("click", () => doCreate(typed));
      item.addEventListener("pointermove", () => setActive(rowIndex));
      rows.push({ el: item, select: () => doCreate(typed) });
      group.append(item);
      list.append(group);
    }

    // Land the highlight on the first selectable row, cmdk's default.
    if (rows.length > 0) setActive(0);
  };

  /* -------------------------------- trigger ------------------------------ */

  const paintTrigger = () => {
    const v = state.get();
    const opt = allOptions().find((o) => o.value === v) ?? null;
    if (opt) lastLabel = opt.label;
    labelSpan.textContent = v && lastLabel ? lastLabel : current.placeholder ?? "Select…";
    triggerEl.classList.toggle("zen-text-zen-muted-fg", !v);
  };

  /* ----------------------------- async search ---------------------------- */

  const scheduleSearch = () => {
    if (!isAsync() || !open) return;
    const q = query;
    const mySeq = ++seq;
    clearTimeout(debounceTimer);
    ac?.abort();
    ac = new AbortController();
    const signal = ac.signal;

    debounceTimer = setTimeout(async () => {
      asyncLoading = true;
      renderList();
      try {
        const results = await current.onSearch!(q);
        if (mySeq === seq && !signal.aborted) asyncResults = results;
      } catch {
        if (mySeq === seq && !signal.aborted) asyncResults = [];
      } finally {
        if (mySeq === seq && !signal.aborted) {
          asyncLoading = false;
          renderList();
          paintTrigger();
        }
      }
    }, current.debounceMs ?? 250);
  };

  /* ------------------------------ open / close --------------------------- */

  function openList() {
    if (open || current.disabled) return;
    open = true;
    triggerEl.setAttribute("aria-expanded", "true");
    panel.hidden = false;
    setPresence(panel, "open");

    input.value = query;
    renderList();
    // Async opens on a fresh (possibly empty-query) fetch, exactly as React's
    // effect fires when `open` flips true.
    scheduleSearch();
    input.focus();

    session.add(
      dismissable(panel, {
        ignore: [triggerEl],
        onDismiss: () => close(),
      }),
    );
  }

  function close() {
    if (!open) return;
    open = false;
    triggerEl.setAttribute("aria-expanded", "false");
    setPresence(panel, "closed", () => {
      panel.hidden = true;
    });
    session.dispose();
    clearTimeout(debounceTimer);
    ac?.abort();
    triggerEl.focus();
  }

  /* ------------------------------- keyboard ------------------------------ */

  const onInput = () => {
    query = input.value;
    renderList();
    scheduleSearch();
  };

  const onInputKey = (e: KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActive(activeIndex + 1);
        break;
      case "ArrowUp":
        e.preventDefault();
        setActive(activeIndex - 1);
        break;
      case "Home":
        e.preventDefault();
        setActive(0);
        break;
      case "End":
        e.preventDefault();
        setActive(rows.length - 1);
        break;
      case "Enter":
        if (activeIndex >= 0 && rows[activeIndex]) {
          e.preventDefault();
          rows[activeIndex].select();
        }
        break;
    }
  };

  input.addEventListener("input", onInput);
  input.addEventListener("keydown", onInputKey);

  /* -------------------------------- render ------------------------------- */

  const KNOWN = new Set([
    "options",
    "onSearch",
    "value",
    "defaultValue",
    "onValueChange",
    "placeholder",
    "searchPlaceholder",
    "emptyMessage",
    "debounceMs",
    "creatable",
    "onCreate",
    "createLabel",
    "width",
    "disabled",
    "class",
    "id",
  ]);

  const render = () => {
    // The user's `class` goes on the trigger (React puts it on the Button), so the
    // wrapper only owns the positioning context the panel is absolute against.
    el.className = "zen-relative zen-inline-block";
    el.replaceChildren(triggerEl, panel);

    input.placeholder = current.searchPlaceholder ?? "Search…";
    triggerEl.style.width = widthOf();
    panel.style.width = widthOf();
    triggerEl.disabled = Boolean(current.disabled);

    paintTrigger();
    if (open) renderList();

    const rest: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(current)) {
      if (!KNOWN.has(k)) rest[k] = v;
    }
    removeProps?.();
    removeProps = applyProps(el, rest);
  };

  render();

  disposer.add(state.subscribe(paintTrigger));
  disposer.add(() => input.removeEventListener("input", onInput));
  disposer.add(() => input.removeEventListener("keydown", onInputKey));
  disposer.add(() => session.dispose());
  disposer.add(() => {
    clearTimeout(debounceTimer);
    ac?.abort();
  });
  disposer.add(() => trigger.destroy());
  disposer.add(() => removeProps?.());

  return {
    el,
    update(next) {
      current = { ...current, ...next };
      if (next.value !== undefined) state.sync(next.value);
      render();
    },
    destroy() {
      disposer.dispose();
      el.remove();
    },
  };
}
