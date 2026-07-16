import { cn } from "../../lib/cn";
import { Disposer, type ZenComponent } from "../../lib/component";
import { controllable } from "../../lib/state";
import { Button } from "../button/button";
import { Popover } from "../popover/popover";

/**
 * MultiCombobox — multi-select sibling of Combobox. Selected values render as
 * removable chips inside the trigger; clicking an option in the popover toggles
 * its membership instead of closing.
 *
 *   const mc = MultiCombobox({
 *     options: [{ value: "a", label: "Alpha" }, …],
 *     value: picked,
 *     onValueChange: (v) => (picked = v),
 *     placeholder: "Pick one or more",
 *   });
 *   document.querySelector("#form")!.append(mc.el);
 *
 * Async mode mirrors Combobox: replace `options` with an `onSearch` function.
 * The component maintains a label cache so chips keep their human labels even
 * when the current async result page doesn't contain the corresponding option.
 *
 * ## The divergence, and why this side of it
 *
 * React composes this from `<Popover>` + cmdk's `<Command>`. With no framework
 * and no primitive library, the popover is the vanilla `Popover` factory (portal
 * + place-and-flip + Escape / click-outside) and the command engine — filtering,
 * keyboard navigation, the create row, the highlight — is written out below. The
 * public API is React's, prop for prop; `class` merges onto the trigger exactly
 * as React's `className` does. `ComboboxOption` is exported here for the same
 * reason it lives beside Combobox in React.
 */

export interface ComboboxOption {
  value: string;
  label: string;
  /** Optional extra text used by the fuzzy match. */
  keywords?: string[];
  disabled?: boolean;
}

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
   * Called with the typed text when the create row is chosen. Adding the option
   * to your list is always yours — the component cannot know where the list lives
   * or what a new `value` should be.
   *
   * RETURN the new option and it is APPENDED to the selection, which is what
   * "create a tag" almost always means. Return nothing and the selection is left
   * alone.
   */
  onCreate?: (label: string) => ComboboxOption | void;
  /** Verb on the create row — `Create "foo"`. Default "Create". */
  createLabel?: string;
  /** Trigger button min width. Defaults to 240. */
  width?: number | string;
  /** Cap how many chips show in the trigger before collapsing into "+N more". Default 3. */
  maxDisplayed?: number;
  disabled?: boolean;
  class?: string;
  /** Show a "Clear all" button inside the popover when ≥ 1 selected. Default true. */
  showClearAll?: boolean;
}

/* Trusted, hand-written markup — never a caller's string. See PORTING.md. */
const CHEVRON = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>`;
const CHECK = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>`;
const PLUS = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`;
const SEARCH = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="zen-mr-2 zen-shrink-0 zen-opacity-50" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`;
const CHIP_X = `<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;

const svg = (markup: string): SVGSVGElement => {
  const t = document.createElement("template");
  t.innerHTML = markup;
  return t.content.firstChild as SVGSVGElement;
};

const arraysEqual = (a: string[], b: string[]) =>
  a.length === b.length && a.every((x, i) => x === b[i]);

export function MultiCombobox(props: MultiComboboxProps): ZenComponent<MultiComboboxProps> {
  let current: MultiComboboxProps = { ...props };
  const disposer = new Disposer();

  const isAsync = () => typeof current.onSearch === "function";

  /* Async state — debounce + a monotonic seq to drop stale responses. */
  let asyncResults: ComboboxOption[] = [];
  let asyncLoading = false;
  let searchTimer: ReturnType<typeof setTimeout> | undefined;
  let searchSeq = 0;

  let query = "";
  let open = false;

  /* Cache the label for every option we've seen so chips keep their human label
   * even after the async result page rotates away from the selected values. */
  const labelCache = new Map<string, string>();
  const labelFor = (v: string) => labelCache.get(v) ?? v;
  const cacheLabels = (opts: ComboboxOption[]) => {
    for (const o of opts) labelCache.set(o.value, o.label);
  };

  const allOptions = (): ComboboxOption[] =>
    isAsync() ? asyncResults : current.options ?? [];

  const resolve = (next: string[]): ComboboxOption[] => {
    const opts = allOptions();
    return next.map(
      (v) => opts.find((o) => o.value === v) ?? { value: v, label: labelFor(v) },
    );
  };

  const state = controllable<string[]>({
    value: current.value,
    defaultValue: current.defaultValue ?? [],
    equals: arraysEqual,
    onChange: (v) => current.onValueChange?.(v, resolve(v)),
  });

  const selected = () => state.get();

  const commit = (next: string[]) => state.set(next);

  const toggle = (v: string) => {
    const cur = selected();
    commit(cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v]);
  };

  const remove = (v: string) => commit(selected().filter((x) => x !== v));

  // ---- Trigger --------------------------------------------------------------

  const widthCss =
    current.width === undefined
      ? "240px"
      : typeof current.width === "number"
        ? `${current.width}px`
        : current.width;

  const chips = document.createElement("span");
  chips.className =
    "zen-flex zen-flex-wrap zen-items-center zen-gap-1 zen-flex-1 zen-min-w-0";

  const triggerBtn = Button({
    variant: "outline",
    color: "neutral",
    disabled: current.disabled,
    class: cn(
      "zen-justify-between zen-font-normal zen-text-left zen-min-h-10 zen-h-auto zen-py-1.5",
      current.class,
    ),
    style: { minWidth: widthCss },
    iconRight: svg(CHEVRON),
    children: chips,
  });
  const triggerEl = triggerBtn.el as HTMLButtonElement;
  triggerEl.setAttribute("role", "combobox");

  const makeChip = (v: string): HTMLElement => {
    const label = labelFor(v);
    const chip = document.createElement("span");
    chip.className = cn(
      "zen-inline-flex zen-items-center zen-gap-1 zen-px-1.5 zen-py-0.5",
      "zen-text-xs zen-font-medium",
      "zen-rounded-zen-sm zen-bg-zen-primary-soft zen-text-zen-primary-soft-fg",
      "zen-max-w-[10rem]",
    );
    const text = document.createElement("span");
    text.className = "zen-truncate";
    text.textContent = label;

    // role="button" span (not a <button>) so it can live inside the trigger
    // <button> without nesting interactive controls (invalid HTML).
    const x = document.createElement("span");
    x.setAttribute("role", "button");
    x.tabIndex = 0;
    x.setAttribute("aria-label", `Remove ${label}`);
    x.className = cn(
      "zen-inline-flex zen-items-center zen-justify-center",
      "zen-h-3.5 zen-w-3.5 zen-rounded-zen-full zen-bg-transparent zen-border-0 zen-cursor-pointer",
      "zen-text-current zen-opacity-70 hover:zen-opacity-100 hover:zen-bg-black/10",
      "focus-visible:zen-outline-none focus-visible:zen-ring-1 focus-visible:zen-ring-zen-ring",
    );
    x.append(svg(CHIP_X));
    const doRemove = (e: Event) => {
      // Stop the press from reaching the trigger button (which would toggle the
      // popover when the user just wanted to remove a chip).
      e.stopPropagation();
      e.preventDefault();
      remove(v);
    };
    x.addEventListener("click", doRemove);
    x.addEventListener("pointerdown", (e) => e.stopPropagation());
    x.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") doRemove(e);
    });

    chip.append(text, x);
    return chip;
  };

  const paintTrigger = () => {
    // Seed the cache from the current sync options so preselected chips read
    // their human label on the very first paint, before the list has opened.
    cacheLabels(allOptions());
    const sel = selected();
    const max = current.maxDisplayed ?? 3;
    triggerEl.classList.toggle("zen-text-zen-muted-fg", sel.length === 0);
    chips.replaceChildren();
    if (sel.length === 0) {
      chips.textContent = current.placeholder ?? "Select…";
      return;
    }
    const visible = sel.slice(0, max);
    for (const v of visible) chips.append(makeChip(v));
    const overflow = sel.length - visible.length;
    if (overflow > 0) {
      const more = document.createElement("span");
      more.className = "zen-text-xs zen-text-zen-muted-fg zen-ml-0.5";
      more.textContent = `+${overflow} more`;
      chips.append(more);
    }
  };

  // ---- Panel (the command engine) ------------------------------------------

  const panel = document.createElement("div");
  panel.className =
    "zen-flex zen-h-full zen-w-full zen-flex-col zen-overflow-hidden zen-rounded-zen-md zen-bg-zen-background zen-text-zen-foreground";
  if (typeof current.width === "number") panel.style.width = `${current.width}px`;

  const inputWrap = document.createElement("div");
  inputWrap.className =
    "zen-flex zen-items-center zen-border-b zen-border-zen-border zen-px-3";
  inputWrap.append(svg(SEARCH));
  const input = document.createElement("input");
  input.type = "text";
  input.className = cn(
    "zen-flex zen-h-10 zen-w-full zen-bg-transparent zen-py-3 zen-text-sm zen-outline-none",
    "placeholder:zen-text-zen-muted-fg",
    "disabled:zen-cursor-not-allowed disabled:zen-opacity-50",
  );
  input.setAttribute("role", "combobox");
  input.setAttribute("aria-autocomplete", "list");
  inputWrap.append(input);

  const list = document.createElement("div");
  list.className = "zen-max-h-72 zen-overflow-y-auto zen-overflow-x-hidden";

  panel.append(inputWrap, list);

  // Keep focus in the input across a mouse press on any row: without this,
  // pressing a row blurs the input and the next keystroke is lost.
  panel.addEventListener("mousedown", (e) => {
    if (e.target !== input) e.preventDefault();
  });

  /** Enabled, navigable rows in DOM order, with the action each one runs. */
  let navRows: HTMLElement[] = [];
  const actions = new Map<HTMLElement, () => void>();
  let activeKey: string | null = null;

  const setActive = (el: HTMLElement | null) => {
    for (const r of navRows) r.removeAttribute("data-selected");
    if (el) {
      el.setAttribute("data-selected", "true");
      el.scrollIntoView({ block: "nearest" });
      activeKey = el.dataset.key ?? null;
    } else {
      activeKey = null;
    }
  };

  const move = (dir: 1 | -1) => {
    if (navRows.length === 0) return;
    const cur = navRows.findIndex((r) => r.dataset.key === activeKey);
    const from = cur === -1 ? (dir === 1 ? -1 : 0) : cur;
    const next = (from + dir + navRows.length) % navRows.length;
    setActive(navRows[next]);
  };

  const matches = (o: ComboboxOption, needle: string): boolean => {
    if (!needle) return true;
    const hay = [o.label, o.value, ...(o.keywords ?? [])].join(" ").toLowerCase();
    return hay.includes(needle);
  };

  const item = (o: ComboboxOption): HTMLElement => {
    const row = document.createElement("div");
    row.dataset.key = o.value;
    row.dataset.value = o.value;
    row.setAttribute("role", "option");
    row.className = cn(
      "zen-relative zen-flex zen-cursor-default zen-select-none zen-items-center zen-gap-2 zen-rounded-zen-sm zen-px-2 zen-py-1.5 zen-text-sm zen-outline-none",
      "data-[selected=true]:zen-bg-zen-muted",
      "data-[disabled=true]:zen-pointer-events-none data-[disabled=true]:zen-opacity-50",
    );
    const isSelected = selected().includes(o.value);
    row.setAttribute("aria-selected", String(isSelected));

    const check = svg(CHECK);
    check.style.opacity = isSelected ? "1" : "0";
    check.style.marginRight = "6px";
    const text = document.createElement("span");
    text.className = "zen-flex-1";
    text.textContent = o.label;
    row.append(check, text);

    if (o.disabled) {
      row.setAttribute("data-disabled", "true");
      row.setAttribute("aria-disabled", "true");
    } else {
      const act = () => toggle(o.value);
      actions.set(row, act);
      row.addEventListener("click", act);
      row.addEventListener("mouseenter", () => setActive(row));
    }
    return row;
  };

  const group = (...rows: HTMLElement[]): HTMLElement => {
    const g = document.createElement("div");
    g.className = "zen-overflow-hidden zen-p-1 zen-text-zen-foreground";
    g.append(...rows);
    return g;
  };

  const renderList = () => {
    const opts = allOptions();
    cacheLabels(opts);
    actions.clear();

    const needle = query.trim().toLowerCase();
    const filtered = isAsync() ? opts : opts.filter((o) => matches(o, needle));

    const typed = query.trim();
    const alreadyExists = opts.some(
      (o) => o.label.trim().toLowerCase() === typed.toLowerCase(),
    );
    const showCreate =
      Boolean(current.creatable && current.onCreate) && typed.length > 0 && !alreadyExists;

    list.replaceChildren();
    navRows = [];

    if (isAsync() && asyncLoading) {
      const loading = document.createElement("div");
      loading.className = "zen-py-4 zen-text-center zen-text-sm zen-text-zen-muted-fg";
      loading.textContent = "Searching…";
      list.append(loading);
    }

    if (filtered.length === 0 && !showCreate && !(isAsync() && asyncLoading)) {
      const empty = document.createElement("div");
      empty.className = "zen-py-6 zen-text-center zen-text-sm zen-text-zen-muted-fg";
      empty.textContent = current.emptyMessage ?? "No results.";
      list.append(empty);
    }

    if (filtered.length > 0) {
      const rows = filtered.map(item);
      list.append(group(...rows));
      for (const r of rows) if (!r.hasAttribute("data-disabled")) navRows.push(r);
    }

    if (showCreate) {
      const row = document.createElement("div");
      row.dataset.key = "__create__";
      row.setAttribute("role", "option");
      row.className = cn(
        "zen-relative zen-flex zen-cursor-default zen-select-none zen-items-center zen-gap-2 zen-rounded-zen-sm zen-px-2 zen-py-1.5 zen-text-sm zen-outline-none",
        "data-[selected=true]:zen-bg-zen-muted",
      );
      const plus = svg(PLUS);
      plus.style.marginRight = "6px";
      const text = document.createElement("span");
      text.className = "zen-flex-1";
      text.textContent = `${current.createLabel ?? "Create"} “${typed}”`;
      row.append(plus, text);

      const act = () => {
        const created = current.onCreate!(typed);
        if (created) {
          // Cache the label first: the caller's options update has not landed,
          // so the chip would otherwise fall back to the raw value.
          labelCache.set(created.value, created.label);
          if (!selected().includes(created.value)) {
            commit([...selected(), created.value]);
          }
        }
        query = "";
        input.value = "";
        renderList();
      };
      actions.set(row, act);
      row.addEventListener("click", act);
      row.addEventListener("mouseenter", () => setActive(row));
      list.append(group(row));
      navRows.push(row);
    }

    // Clear-all footer — always torn down and rebuilt so it never duplicates.
    const oldFooter = panel.querySelector(":scope > [data-mc-footer]");
    oldFooter?.remove();
    const showClearAll = current.showClearAll !== false;
    if (showClearAll && selected().length > 0) {
      const footer = document.createElement("div");
      footer.setAttribute("data-mc-footer", "");
      footer.className = "zen-border-t zen-border-zen-border zen-p-1";
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = cn(
        "zen-w-full zen-text-left zen-text-xs zen-px-2 zen-py-1 zen-rounded-zen-sm",
        "zen-text-zen-muted-fg hover:zen-text-zen-foreground hover:zen-bg-zen-muted",
        "zen-bg-transparent zen-border-0 zen-cursor-pointer",
        "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
      );
      btn.textContent = `Clear all (${selected().length})`;
      btn.addEventListener("click", () => commit([]));
      footer.append(btn);
      // The footer lives after the scrolling list, inside the panel.
      panel.append(footer);
    }

    // Restore / seed the highlight. cmdk keeps the first row highlighted so Enter
    // has something to act on the moment the list appears.
    const keep = navRows.find((r) => r.dataset.key === activeKey);
    setActive(keep ?? navRows[0] ?? null);
  };

  // ---- Async search ---------------------------------------------------------

  const runSearch = () => {
    if (!isAsync()) return;
    clearTimeout(searchTimer);
    const seq = ++searchSeq;
    searchTimer = setTimeout(async () => {
      asyncLoading = true;
      renderList();
      try {
        const results = await current.onSearch!(query);
        if (seq === searchSeq) {
          asyncResults = results;
          cacheLabels(results);
        }
      } catch {
        if (seq === searchSeq) asyncResults = [];
      } finally {
        if (seq === searchSeq) {
          asyncLoading = false;
          renderList();
        }
      }
    }, current.debounceMs ?? 250);
  };

  // ---- Input wiring ---------------------------------------------------------

  input.addEventListener("input", () => {
    query = input.value;
    renderList();
    if (isAsync()) runSearch();
  });
  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      move(1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      move(-1);
    } else if (e.key === "Enter") {
      const row = navRows.find((r) => r.dataset.key === activeKey);
      if (row) {
        e.preventDefault();
        actions.get(row)?.();
      }
    }
    // Escape is handled by the Popover's dismissable layer.
  });

  // ---- Popover --------------------------------------------------------------

  const pop = Popover({
    trigger: triggerBtn,
    children: panel,
    align: "start",
    class: "zen-p-0 zen-w-auto",
    onOpenChange: (o) => {
      open = o;
      if (o) {
        renderList();
        if (isAsync()) runSearch();
        // The Popover focuses its panel on open; a microtask later wins the
        // focus race so typing lands in the search input.
        queueMicrotask(() => input.focus());
      } else {
        clearTimeout(searchTimer);
        searchSeq++;
      }
    },
  });

  paintTrigger();

  disposer.add(state.subscribe(() => {
    paintTrigger();
    if (open) renderList();
  }));
  disposer.add(() => clearTimeout(searchTimer));
  disposer.add(() => pop.destroy());
  disposer.add(() => triggerBtn.destroy());

  return {
    el: pop.el,
    update(next) {
      current = { ...current, ...next };
      if (next.value !== undefined) state.sync(next.value);
      if (next.disabled !== undefined) triggerEl.disabled = Boolean(next.disabled);
      paintTrigger();
      if (open) renderList();
    },
    destroy() {
      disposer.dispose();
    },
  };
}
