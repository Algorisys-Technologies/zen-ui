import { filterLookup, highlightRanges, queryWords } from "@algorisys/zen-ui-core/lookup";
import { cn } from "../../lib/cn";
import { Disposer, type ZenComponent } from "../../lib/component";
import { anchorPopup, type AnchoredPopup } from "../../lib/anchored";
import { Icon } from "../icon/icon";
import { useLocale } from "../locale/locale";

/**
 * LookupField — pick a row from a table of choices: an item, a customer, an
 * account, seeing several facts at once (code, name, stock, rate, GSTIN).
 *
 *   const field = LookupField({
 *     columns: [
 *       { key: "code", header: "Code", width: "7rem" },
 *       { key: "name", header: "Item" },
 *       { key: "stock", header: "Stock", align: "end" },
 *     ],
 *     rows: items, rowKey: (i) => i.code, rowLabel: (i) => `${i.code} · ${i.name}`,
 *     value: item, onValueChange: (row) => field.update({ value: (item = row) }),
 *     onValueHelp: openValueHelp,
 *   });
 *
 * Type any part of any column, words in any order ("bolt m8"); the likeliest
 * row comes first (the code as typed, then a code starting with it, then words
 * starting columns). The ranking is @algorisys/zen-ui-core/lookup
 * (check:lookup). With `onSearch` the rows come from you instead, as they are
 * typed for (debounced, the stale request aborted), in your order.
 *
 * The chosen row comes back whole, so the caller has its rate and UOM without
 * a second lookup. The field never holds text that is not a row: leaving it
 * puts back the chosen row's label (or clears it, if emptied).
 *
 * Keys: ↓ opens; ↑ ↓ PageUp PageDown move; Enter picks; Tab picks the active
 * row when you have typed a search, and moves on; Esc closes, then undoes the
 * typing; F4 calls `onValueHelp` with what is typed, to open the full search.
 * The list is portalled and placed by lib/anchored, as TreeSelect's is.
 *
 * Controlled when `value` is given (an `update({ value })` moves it; null is
 * "nothing chosen"), uncontrolled from `defaultValue` otherwise.
 * Mirrors react/src/components/lookup-field/lookup-field.tsx.
 */
export interface LookupColumn<T> {
  /** Names the column; also the property read when there is no `value`. */
  key: string;
  header: string;
  /** The cell's text, shown and searched. Default: `row[key]` as text. */
  value?: (row: T) => string;
  /** A CSS grid track: "7rem", "minmax(0,2fr)". Default: an equal share. */
  width?: string;
  /** "end" for numbers. */
  align?: "start" | "end";
  /** Left out of the search (still shown). Default true. */
  searchable?: boolean;
}

export interface LookupFieldProps<T> {
  columns: LookupColumn<T>[];
  /** The rows to search here. Ignored when `onSearch` is given. */
  rows?: T[];
  /** Rows from you, for what is typed: a server search. Abort on the signal; the newest query wins. */
  onSearch?: (query: string, signal: AbortSignal) => Promise<T[]>;
  /** With onSearch: the fewest characters before searching. Default 1. */
  minQueryLength?: number;
  /** With onSearch: milliseconds to wait after typing stops. Default 200. */
  debounce?: number;
  rowKey: (row: T) => string;
  /** The closed field's text for a row. Default: its first column. */
  rowLabel?: (row: T) => string;
  value?: T | null;
  defaultValue?: T | null;
  /** The chosen row, whole, or null when the field is emptied. */
  onValueChange?: (row: T | null) => void;
  /** F4, or the button: open the full search (ValueHelp) with what is typed. The field shows a button when set. */
  onValueHelp?: (query: string) => void;
  /** The most rows listed. Default 50. */
  maxRows?: number;
  placeholder?: string;
  emptyMessage?: string;
  invalid?: boolean;
  disabled?: boolean;
  /** Lands on the input, so `<label for>` names it. */
  id?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  /** Width of the field. Default 100%. */
  width?: string;
  /**
   * Width of the table under it. Default: as wide as its content needs, at
   * least the field and the --zen-lookup-list-width token, at most the
   * --zen-lookup-list-max-width token (and the window).
   */
  listWidth?: string;
  class?: string;
}

const cellText = <T>(col: LookupColumn<T>, row: T): string => {
  if (col.value) return col.value(row);
  const v = (row as Record<string, unknown>)[col.key];
  return v == null ? "" : String(v);
};

const PAGE = 10;
const BUTTON_CLASS =
  "zen-flex zen-shrink-0 zen-cursor-pointer zen-items-center zen-border-0 zen-bg-transparent zen-p-0.5 zen-text-zen-muted-fg hover:zen-text-zen-foreground";

let uid = 0;

export function LookupField<T>(props: LookupFieldProps<T>): ZenComponent<LookupFieldProps<T>> {
  let current: LookupFieldProps<T> = { ...props };
  // The provider building this field; its words are used every time it opens.
  const loc = useLocale();
  const listId = `zen-lookup-${++uid}`;
  const statusId = `${listId}-status`;
  const rowId = (i: number) => `${listId}-r${i}`;
  const disposer = new Disposer();

  // The initial value seeds it; the user owns it after (uncontrolled).
  let internal: T | null = current.defaultValue ?? null;
  const value = (): T | null => (current.value !== undefined ? current.value : internal);
  const label = (row: T | null) =>
    row ? (current.rowLabel ? current.rowLabel(row) : cellText(current.columns[0], row)) : "";

  let open = false;
  let query = "";
  /** Whether the text is the user's typing (a search), not the chosen row's label. */
  let typed = false;
  let active = 0;
  let rows: T[] = [];

  // Rows asked for: the newest answer, and the request in flight.
  let remote: T[] | null = null;
  let loading = false;
  let failed = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let controller: AbortController | undefined;

  let placed: AnchoredPopup | undefined;
  let placedHeight = "";

  const asking = () => !!current.onSearch;
  const minChars = () => current.minQueryLength ?? 1;
  const tooShort = () => asking() && query.trim().length < minChars();

  /* ------------------------------- the field ------------------------------ */

  const el = document.createElement("div");
  const box = document.createElement("div");
  const input = document.createElement("input");
  input.type = "text";
  input.setAttribute("role", "combobox");
  input.setAttribute("aria-autocomplete", "list");
  input.setAttribute("aria-describedby", statusId);
  input.autocomplete = "off";
  input.spellcheck = false;
  input.className =
    "zen-min-w-0 zen-flex-1 zen-border-0 zen-bg-transparent zen-text-sm zen-text-zen-foreground zen-outline-none placeholder:zen-text-zen-muted-fg";

  const helpButton = document.createElement("button");
  helpButton.type = "button";
  helpButton.tabIndex = -1;
  helpButton.className = BUTTON_CLASS;
  helpButton.append(Icon({ name: "search", size: 16 }).el);

  const chevron = document.createElement("button");
  chevron.type = "button";
  chevron.tabIndex = -1;
  chevron.className = BUTTON_CLASS;

  const status = document.createElement("span");
  status.id = statusId;
  status.className = "zen-sr-only";
  status.setAttribute("aria-live", "polite");

  box.append(input, chevron);
  el.append(box, status);

  /* ------------------------------- the list ------------------------------- */

  const list = document.createElement("div");
  list.id = listId;
  list.setAttribute("role", "listbox");
  list.className =
    "zen-z-50 zen-gap-x-3 zen-overflow-y-auto zen-rounded-zen-md zen-border zen-border-solid zen-border-zen-border zen-bg-zen-background zen-text-sm zen-shadow-md";
  // One grid for the whole table: the header and every row are subgrids of it,
  // so a column is as wide as its widest cell and lines up on every row. Rows
  // as separate grids could only align fixed widths.
  list.style.display = "grid";
  list.style.alignContent = "start";

  // Presses in the list and on the buttons must not take focus from the field.
  const keepFocus = (e: Event) => e.preventDefault();
  for (const t of [list, chevron, helpButton]) {
    t.addEventListener("mousedown", keepFocus);
    disposer.add(() => t.removeEventListener("mousedown", keepFocus));
  }

  const computeRows = (): T[] => {
    const max = current.maxRows ?? 50;
    if (asking()) return (remote ?? []).slice(0, max);
    const searchable = (row: T) =>
      current.columns.filter((c) => c.searchable !== false).map((c) => cellText(c, row));
    return filterLookup(current.rows ?? [], searchable, typed ? query : "", max);
  };

  const statusText = () => {
    if (!open) return "";
    if (tooShort()) return loc.t("lookupField.typeMore", { count: minChars() });
    if (loading) return loc.t("lookupField.searching");
    if (failed) return loc.t("lookupField.failed");
    if (rows.length === 0) return current.emptyMessage ?? loc.t("lookupField.noMatches");
    return loc.t("lookupField.results", { count: rows.length });
  };

  const highlight = (s: string, words: string[]): Node[] => {
    if (!words.length) return [document.createTextNode(s)];
    const ranges = highlightRanges(s, words);
    if (!ranges.length) return [document.createTextNode(s)];
    const out: Node[] = [];
    let at = 0;
    for (const [a, b] of ranges) {
      if (a > at) out.push(document.createTextNode(s.slice(at, a)));
      const mark = document.createElement("mark");
      mark.className = "zen-bg-transparent zen-font-semibold zen-text-inherit";
      mark.textContent = s.slice(a, b);
      out.push(mark);
      at = b;
    }
    if (at < s.length) out.push(document.createTextNode(s.slice(at)));
    return out;
  };

  const isChosen = (row: T) => {
    const v = value();
    return !!v && current.rowKey(v) === current.rowKey(row);
  };
  const rowClass = (row: T, i: number) =>
    cn(
      "zen-col-span-full zen-mx-1 zen-grid zen-cursor-pointer zen-items-center zen-rounded-zen-sm zen-px-2 zen-py-1.5",
      active === i && "zen-bg-zen-muted",
      isChosen(row) && "zen-font-medium zen-text-zen-primary",
    );

  /**
   * Only a key moves the list to its active row (in the list's own scroller,
   * never the page's): hovering a row makes it active, and scrolling then would
   * slide the list under the pointer onto the next row. The sticky header
   * covers the top of the scroller, so a row is in sight only below it.
   */
  const scrollToActive = () => {
    const row = list.querySelector<HTMLElement>(`[data-index="${active}"]`);
    if (!row) return;
    const head = list.querySelector<HTMLElement>("[data-lookup-head]");
    const top = row.offsetTop - (head?.offsetHeight ?? 0);
    const bottom = row.offsetTop + row.offsetHeight;
    if (top < list.scrollTop) list.scrollTop = top;
    else if (bottom > list.scrollTop + list.clientHeight) list.scrollTop = bottom - list.clientHeight;
  };

  /** The active row's look and the field's aria-activedescendant. No scrolling. */
  const paintActive = () => {
    list.querySelectorAll<HTMLElement>("[role=option]").forEach((r) => {
      const i = Number(r.dataset.index);
      r.className = rowClass(rows[i], i);
    });
    if (open && rows[active]) input.setAttribute("aria-activedescendant", rowId(active));
    else input.removeAttribute("aria-activedescendant");
  };

  const setActive = (i: number, scroll: boolean) => {
    active = i;
    paintActive();
    if (scroll) scrollToActive();
  };

  const renderList = () => {
    const { columns } = current;
    rows = computeRows();
    // The active row stays in range as the list changes under it.
    if (active > rows.length - 1) active = Math.max(0, rows.length - 1);
    const name = current["aria-label"] ?? current.placeholder;
    if (name) list.setAttribute("aria-label", name);
    else list.removeAttribute("aria-label");
    list.style.gridTemplateColumns = columns.map((c) => c.width ?? "minmax(0,1fr)").join(" ");
    list.style.width = current.listWidth ?? "max-content";

    const head = document.createElement("div");
    head.dataset.lookupHead = "";
    head.setAttribute("aria-hidden", "true");
    head.className =
      "zen-sticky zen-top-0 zen-z-10 zen-col-span-full zen-grid zen-border-0 zen-border-b zen-border-solid zen-border-zen-border zen-bg-zen-muted zen-px-3 zen-py-1.5 zen-text-xs zen-font-medium zen-text-zen-muted-fg";
    head.style.gridTemplateColumns = "subgrid";
    head.append(
      ...columns.map((c) => {
        const h = document.createElement("div");
        h.className = cn("zen-truncate", c.align === "end" && "zen-text-end");
        h.textContent = c.header;
        return h;
      }),
    );

    if (rows.length === 0 || tooShort()) {
      const empty = document.createElement("div");
      empty.className = "zen-col-span-full zen-px-3 zen-py-2 zen-text-zen-muted-fg";
      empty.textContent = statusText();
      list.replaceChildren(head, empty);
      paintActive();
      return;
    }

    const words = typed ? queryWords(query) : [];
    const body = document.createElement("div");
    body.className = cn("zen-col-span-full zen-grid zen-py-1", loading && "zen-opacity-60");
    body.style.gridTemplateColumns = "subgrid";
    body.append(
      ...rows.map((row, i) => {
        const r = document.createElement("div");
        r.id = rowId(i);
        r.setAttribute("role", "option");
        r.dataset.index = String(i);
        r.setAttribute("aria-selected", String(isChosen(row)));
        r.setAttribute(
          "aria-label",
          columns
            .map((c) => cellText(c, row))
            .filter(Boolean)
            .join(", "),
        );
        r.className = rowClass(row, i);
        r.style.gridTemplateColumns = "subgrid";
        r.append(
          ...columns.map((c) => {
            const cell = document.createElement("div");
            cell.className = cn("zen-min-w-0 zen-truncate", c.align === "end" && "zen-text-end zen-tabular-nums");
            cell.append(...highlight(cellText(c, row), words));
            return cell;
          }),
        );
        // Hover makes the row active and never scrolls (see scrollToActive).
        r.addEventListener("pointermove", () => {
          if (active !== i) setActive(i, false);
        });
        r.addEventListener("click", () => pick(row));
        return r;
      }),
    );
    list.replaceChildren(head, body);
    paintActive();
  };

  /* ------------------------------ the field's look ------------------------------ */

  const paintField = () => {
    const text = typed ? query : label(value());
    if (input.value !== text) input.value = text;
    input.setAttribute("aria-expanded", String(open));
    if (open) input.setAttribute("aria-controls", listId);
    else input.removeAttribute("aria-controls");
    chevron.setAttribute("aria-label", loc.t(open ? "common.close" : "common.open"));
    chevron.replaceChildren(Icon({ name: open ? "chevron-up" : "chevron-down", size: 16 }).el);
    status.textContent = statusText();
  };

  /** After the rows changed while open: the list, the words, and its place (its width follows its content). */
  const refresh = () => {
    // The rows first: the announced count is theirs.
    if (open) renderList();
    paintField();
    if (!open) return;
    placed?.place();
    scrollToActive();
  };

  /* ------------------------------ asking for rows ------------------------------ */

  const cancelSearch = () => {
    clearTimeout(timer);
    controller?.abort();
    controller = undefined;
  };

  /** With onSearch: ask again for what is typed. The newest query wins: the older one's timer is dropped and its request aborted. */
  const search = () => {
    cancelSearch();
    if (!open || !current.onSearch) return;
    if (tooShort()) {
      remote = null;
      loading = false;
      return;
    }
    const c = new AbortController();
    controller = c;
    loading = true;
    failed = false;
    const q = query;
    timer = setTimeout(() => {
      current.onSearch!(q, c.signal).then(
        (found) => {
          if (c.signal.aborted) return;
          remote = found;
          loading = false;
          refresh();
        },
        () => {
          if (c.signal.aborted) return;
          failed = true;
          loading = false;
          refresh();
        },
      );
    }, current.debounce ?? 200);
  };

  /* ---------------------------- open, pick, close -------------------------- */

  // A press outside closes it, putting the label back.
  const onOutside = (e: PointerEvent) => {
    const t = e.target as Node;
    if (!el.contains(t) && !list.contains(t)) revert();
  };

  const show = () => {
    open = true;
    search();
    renderList();
    paintField();
    placedHeight = "";
    list.style.minWidth = `max(${el.getBoundingClientRect().width}px, var(--zen-lookup-list-width))`;
    list.style.maxWidth = "min(var(--zen-lookup-list-max-width), calc(100vw - 16px))";
    placed = anchorPopup({
      anchor: el,
      popup: list,
      maxHeight: 320,
      onPlace: ({ maxHeight }) => {
        // The placement writes the field's width as the floor; the token is a floor too.
        list.style.minWidth = `max(${list.style.minWidth || "0px"}, var(--zen-lookup-list-width))`;
        // The placement keeps 8px off each edge.
        list.style.maxWidth = "min(var(--zen-lookup-list-max-width), calc(100vw - 16px))";
        // The list is only a scroller once its height is capped, so a list
        // opening on a row far down is scrolled there again after the cap
        // (TreeSelect found this). Only when the cap changes: on every scroll it
        // would pull a list the user is wheeling through back to the active row.
        const h = String(maxHeight);
        if (h === placedHeight) return;
        placedHeight = h;
        scrollToActive();
      },
    });
    scrollToActive();
    document.addEventListener("pointerdown", onOutside, true);
  };

  const openList = () => {
    if (current.disabled || open) return;
    // Open on the chosen row when it is listed.
    const v = value();
    const at = v && !typed ? computeRows().findIndex((r) => current.rowKey(r) === current.rowKey(v)) : -1;
    active = at >= 0 ? at : 0;
    show();
  };

  function close() {
    if (!open) return;
    open = false;
    cancelSearch();
    loading = false;
    document.removeEventListener("pointerdown", onOutside, true);
    placed?.destroy();
    placed = undefined;
    paintField();
    paintActive();
  }

  /** Back to the chosen row's label: no text that is not a row survives. */
  function revert() {
    typed = false;
    query = "";
    close();
    paintField();
  }

  function pick(row: T | null) {
    const v = value();
    const changed = row === null ? v !== null : !v || current.rowKey(v) !== current.rowKey(row);
    if (current.value === undefined) internal = row;
    revert();
    if (changed) current.onValueChange?.(row);
  }

  const move = (to: number) => {
    const n = rows.length;
    if (n === 0) return;
    setActive(Math.max(0, Math.min(n - 1, to)), true);
  };

  const valueHelp = () => {
    const q = typed ? query : "";
    revert();
    current.onValueHelp?.(q);
  };

  /* -------------------------------- events -------------------------------- */

  const onInput = () => {
    query = input.value;
    typed = true;
    active = 0;
    if (!open) {
      show();
      return;
    }
    search();
    refresh();
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (current.disabled) return;
    if (e.key === "F4" && current.onValueHelp) {
      e.preventDefault();
      valueHelp();
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (!open) openList();
        else if (!e.altKey) move(active + 1);
        return;
      case "ArrowUp":
        e.preventDefault();
        if (open) move(active - 1);
        return;
      case "PageDown":
        if (!open) return;
        e.preventDefault();
        move(active + PAGE);
        return;
      case "PageUp":
        if (!open) return;
        e.preventDefault();
        move(active - PAGE);
        return;
      case "Enter": {
        // Mid-composition (an IME), Enter confirms the composed text, not a row.
        if (!open || e.isComposing) return;
        e.preventDefault();
        const row = rows[active];
        if (row) pick(row);
        return;
      }
      case "Tab": {
        // Typed a search and Tab: take the likeliest row, as clerks expect.
        const row = open && typed && query.trim() ? rows[active] : undefined;
        if (row) pick(row);
        return;
      }
      case "Escape":
        if (open || typed) {
          e.preventDefault();
          if (open && typed && query) close();
          else revert();
        }
        return;
    }
  };

  const onBlur = () => {
    // Emptied: cleared. Anything else typed and not picked: the label comes back.
    if (typed && query.trim() === "") pick(null);
    else revert();
  };
  const onClick = () => openList();
  const onChevron = () => {
    if (open) close();
    else {
      openList();
      input.focus();
    }
  };

  input.addEventListener("input", onInput);
  input.addEventListener("keydown", onKeyDown);
  input.addEventListener("click", onClick);
  input.addEventListener("blur", onBlur);
  chevron.addEventListener("click", onChevron);
  helpButton.addEventListener("click", valueHelp);
  disposer.add(() => input.removeEventListener("input", onInput));
  disposer.add(() => input.removeEventListener("keydown", onKeyDown));
  disposer.add(() => input.removeEventListener("click", onClick));
  disposer.add(() => input.removeEventListener("blur", onBlur));
  disposer.add(() => chevron.removeEventListener("click", onChevron));
  disposer.add(() => helpButton.removeEventListener("click", valueHelp));
  disposer.add(() => {
    cancelSearch();
    document.removeEventListener("pointerdown", onOutside, true);
    placed?.destroy();
  });

  /* -------------------------------- render -------------------------------- */

  const render = () => {
    const { invalid, disabled, onValueHelp } = current;
    el.className = cn("zen-relative", current.class);
    el.style.width = current.width ?? "100%";
    box.className = cn(
      "zen-flex zen-h-zen-control zen-items-center zen-gap-1 zen-rounded-zen-md zen-border zen-border-solid zen-bg-zen-background zen-px-zen-control-x",
      "focus-within:zen-ring-2 focus-within:zen-ring-zen-ring focus-within:zen-ring-offset-2",
      invalid ? "zen-border-zen-error" : "zen-border-zen-border",
      disabled && "zen-cursor-not-allowed zen-opacity-50",
    );
    const attr = (name: string, v: string | undefined) => (v ? input.setAttribute(name, v) : input.removeAttribute(name));
    attr("id", current.id);
    attr("aria-label", current["aria-label"]);
    attr("aria-labelledby", current["aria-labelledby"]);
    attr("aria-invalid", invalid ? "true" : undefined);
    attr("aria-keyshortcuts", onValueHelp ? "F4" : undefined);
    attr("placeholder", current.placeholder);
    input.disabled = !!disabled;
    chevron.disabled = !!disabled;
    helpButton.disabled = !!disabled;
    if (onValueHelp) {
      const words = loc.t("lookupField.searchAll");
      helpButton.setAttribute("aria-label", words);
      helpButton.title = words;
      if (!helpButton.isConnected || helpButton.parentNode !== box) box.insertBefore(helpButton, chevron);
    } else helpButton.remove();
    if (disabled) revert();
    if (open) {
      // New rows, columns or a new search function while open: list what they give.
      renderList();
      placed?.place();
    }
    paintField();
  };

  render();

  return {
    el,
    update(next) {
      current = { ...current, ...next };
      render();
    },
    destroy() {
      disposer.dispose();
      el.remove();
    },
  };
}
