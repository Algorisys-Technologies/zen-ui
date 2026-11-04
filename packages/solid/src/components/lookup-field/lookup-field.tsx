import { For, Show, createEffect, createMemo, createSignal, createUniqueId, on, onCleanup, splitProps, type JSX } from "solid-js";
import { Portal } from "solid-js/web";
import { filterLookup, highlightRanges, queryWords } from "@algorisys/zen-ui-core/lookup";
import { cn } from "../../lib/cn";
import { createAnchoredPlacement } from "../../lib/anchored";
import { Icon } from "../icon/icon";

/**
 * LookupField — pick a row from a table of choices: an item, a customer, an
 * account, seeing several facts at once (code, name, stock, rate, GSTIN).
 *
 *   <LookupField
 *     columns={[
 *       { key: "code", header: "Code", width: "7rem" },
 *       { key: "name", header: "Item" },
 *       { key: "stock", header: "Stock", align: "end" },
 *     ]}
 *     rows={items} rowKey={(i) => i.code} rowLabel={(i) => `${i.code} · ${i.name}`}
 *     value={item()} onValueChange={setItem} onValueHelp={openValueHelp}
 *   />
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

export type LookupFieldProps<T> = {
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
};

const cellText = <T,>(col: LookupColumn<T>, row: T): string => {
  if (col.value) return col.value(row);
  const v = (row as Record<string, unknown>)[col.key];
  return v == null ? "" : String(v);
};

const PAGE = 10;

export function LookupField<T>(props: LookupFieldProps<T>) {
  const [local] = splitProps(props, [
    "columns", "rows", "onSearch", "minQueryLength", "debounce", "rowKey", "rowLabel", "value", "defaultValue",
    "onValueChange", "onValueHelp", "maxRows", "placeholder", "emptyMessage", "invalid", "disabled", "id",
    "aria-label", "aria-labelledby", "width", "listWidth", "class",
  ]);
  const listId = createUniqueId();
  const statusId = createUniqueId();
  const rowId = (i: number) => `${listId}-r${i}`;
  let wrap: HTMLDivElement | undefined;
  let input: HTMLInputElement | undefined;
  let list: HTMLDivElement | undefined;

  // The initial value seeds it; the user owns it after.
  const [internal, setInternal] = createSignal<T | null>(local.defaultValue ?? null);
  const value = () => (local.value !== undefined ? local.value : internal());
  const label = (row: T | null) => (row ? (local.rowLabel ? local.rowLabel(row) : cellText(local.columns[0], row)) : "");

  const [open, setOpen] = createSignal(false);
  const [query, setQuery] = createSignal("");
  /** Whether the text is the user's typing (a search), not the chosen row's label. */
  const [typed, setTyped] = createSignal(false);
  const [active, setActive] = createSignal(0);
  const text = () => (typed() ? query() : label(value()));

  // Rows: searched here, or asked for.
  const searchable = (row: T) => local.columns.filter((c) => c.searchable !== false).map((c) => cellText(c, row));
  const [remote, setRemote] = createSignal<{ rows: T[]; for: string } | null>(null);
  const [loading, setLoading] = createSignal(false);
  const [failed, setFailed] = createSignal(false);
  const minChars = () => local.minQueryLength ?? 1;
  const asking = () => !!local.onSearch;
  const tooShort = () => asking() && query().trim().length < minChars();

  createEffect(
    on([open, query], ([isOpen, q]) => {
      if (!isOpen || !local.onSearch) return;
      if (q.trim().length < minChars()) {
        setRemote(null);
        setLoading(false);
        return;
      }
      const controller = new AbortController();
      setLoading(true);
      setFailed(false);
      const timer = setTimeout(() => {
        local.onSearch!(q, controller.signal).then(
          (rows) => {
            if (controller.signal.aborted) return;
            setRemote({ rows, for: q });
            setLoading(false);
          },
          () => {
            if (controller.signal.aborted) return;
            setFailed(true);
            setLoading(false);
          },
        );
      }, local.debounce ?? 200);
      onCleanup(() => {
        clearTimeout(timer);
        controller.abort();
      });
    }),
  );

  const rows = createMemo<T[]>(() => {
    const max = local.maxRows ?? 50;
    if (asking()) return (remote()?.rows ?? []).slice(0, max);
    return filterLookup(local.rows ?? [], searchable, typed() ? query() : "", max);
  });
  const words = createMemo(() => (typed() ? queryWords(query()) : []));

  const placement = createAnchoredPlacement({ anchor: () => wrap, popup: () => list, open, maxHeight: 320 });

  const openList = () => {
    if (local.disabled || open()) return;
    setOpen(true);
    // Open on the chosen row when it is listed.
    const v = value();
    const at = v && !typed() ? rows().findIndex((r) => local.rowKey(r) === local.rowKey(v)) : -1;
    setActive(at >= 0 ? at : 0);
  };
  const close = () => setOpen(false);
  /** Back to the chosen row's label: no text that is not a row survives. */
  const revert = () => {
    close();
    setTyped(false);
    setQuery("");
  };
  const pick = (row: T | null) => {
    const v = value();
    const changed = row === null ? v !== null : !v || local.rowKey(v) !== local.rowKey(row);
    if (local.value === undefined) setInternal(() => row);
    revert();
    if (changed) local.onValueChange?.(row);
  };

  createEffect(() => {
    const n = rows().length;
    if (active() > n - 1) setActive(Math.max(0, n - 1));
  });
  // Only a key scrolls the list to its active row (hovering one must not slide the list).
  let fromPointer = false;
  createEffect(() => {
    if (!open() || !list) return;
    const index = active();
    rows();
    if (fromPointer) {
      fromPointer = false;
      return;
    }
    const el = list.querySelector<HTMLElement>(`[data-index="${index}"]`);
    const head = list.querySelector<HTMLElement>("[data-lookup-head]");
    if (!el) return;
    const top = el.offsetTop - (head?.offsetHeight ?? 0);
    const bottom = el.offsetTop + el.offsetHeight;
    if (top < list.scrollTop) list.scrollTop = top;
    else if (bottom > list.scrollTop + list.clientHeight) list.scrollTop = bottom - list.clientHeight;
  });

  // A press outside closes it, putting the label back.
  createEffect(() => {
    if (!open()) return;
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!wrap?.contains(t) && !list?.contains(t)) revert();
    };
    document.addEventListener("pointerdown", onDown, true);
    onCleanup(() => document.removeEventListener("pointerdown", onDown, true));
  });

  const move = (to: number) => {
    const n = rows().length;
    if (n === 0) return;
    setActive(Math.max(0, Math.min(n - 1, to)));
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (local.disabled) return;
    if (e.key === "F4" && local.onValueHelp) {
      e.preventDefault();
      const q = typed() ? query() : "";
      revert();
      local.onValueHelp(q);
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (!open()) openList();
        else if (!e.altKey) move(active() + 1);
        return;
      case "ArrowUp":
        e.preventDefault();
        if (open()) move(active() - 1);
        return;
      case "PageDown":
        if (!open()) return;
        e.preventDefault();
        move(active() + PAGE);
        return;
      case "PageUp":
        if (!open()) return;
        e.preventDefault();
        move(active() - PAGE);
        return;
      case "Enter": {
        if (!open()) return;
        e.preventDefault();
        const row = rows()[active()];
        if (row) pick(row);
        return;
      }
      case "Tab": {
        // Typed a search and Tab: take the likeliest row, as clerks expect.
        const row = open() && typed() && query().trim() ? rows()[active()] : undefined;
        if (row) pick(row);
        return;
      }
      case "Escape":
        if (open() || typed()) {
          e.preventDefault();
          if (open() && typed() && query()) close();
          else revert();
        }
        return;
    }
  };

  const highlight = (s: string): JSX.Element => {
    const ws = words();
    if (!ws.length) return s;
    const ranges = highlightRanges(s, ws);
    if (!ranges.length) return s;
    const out: JSX.Element[] = [];
    let at = 0;
    for (const [a, b] of ranges) {
      if (a > at) out.push(s.slice(at, a));
      out.push(<mark class="zen-bg-transparent zen-font-semibold zen-text-inherit">{s.slice(a, b)}</mark>);
      at = b;
    }
    if (at < s.length) out.push(s.slice(at));
    return out;
  };

  const template = () => local.columns.map((c) => c.width ?? "minmax(0,1fr)").join(" ");
  const status = () => {
    if (!open()) return "";
    if (tooShort()) return `Type ${minChars()} or more characters to search`;
    if (loading()) return "Searching…";
    if (failed()) return "The search failed";
    if (rows().length === 0) return local.emptyMessage ?? "No matches";
    return `${rows().length} ${rows().length === 1 ? "result" : "results"}`;
  };

  return (
    <div
      ref={wrap}
      class={cn("zen-relative", local.class)}
      style={{ width: local.width ?? "100%" }}
    >
      <div
        class={cn(
          "zen-flex zen-h-zen-control zen-items-center zen-gap-1 zen-rounded-zen-md zen-border zen-border-solid zen-bg-zen-background zen-px-zen-control-x",
          "focus-within:zen-ring-2 focus-within:zen-ring-zen-ring focus-within:zen-ring-offset-2",
          local.invalid ? "zen-border-zen-error" : "zen-border-zen-border",
          local.disabled && "zen-cursor-not-allowed zen-opacity-50",
        )}
      >
        <input
          ref={input}
          id={local.id}
          type="text"
          role="combobox"
          autocomplete="off"
          spellcheck={false}
          aria-autocomplete="list"
          aria-expanded={open()}
          aria-controls={open() ? listId : undefined}
          aria-activedescendant={open() && rows()[active()] ? rowId(active()) : undefined}
          aria-describedby={statusId}
          aria-label={local["aria-label"]}
          aria-labelledby={local["aria-labelledby"]}
          aria-invalid={local.invalid ? "true" : undefined}
          aria-keyshortcuts={local.onValueHelp ? "F4" : undefined}
          disabled={local.disabled}
          placeholder={local.placeholder}
          value={text()}
          onInput={(e) => {
            setQuery(e.currentTarget.value);
            setTyped(true);
            setActive(0);
            if (!open()) setOpen(true);
          }}
          onClick={() => openList()}
          onBlur={() => {
            // Emptied: cleared. Anything else typed and not picked: the label comes back.
            if (typed() && query().trim() === "") pick(null);
            else revert();
          }}
          onKeyDown={onKeyDown}
          class="zen-min-w-0 zen-flex-1 zen-border-0 zen-bg-transparent zen-text-sm zen-text-zen-foreground zen-outline-none placeholder:zen-text-zen-muted-fg"
        />
        <Show when={local.onValueHelp}>
          <button
            type="button"
            tabIndex={-1}
            aria-label="Search all (F4)"
            title="Search all (F4)"
            disabled={local.disabled}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              const q = typed() ? query() : "";
              revert();
              local.onValueHelp?.(q);
            }}
            class="zen-flex zen-shrink-0 zen-cursor-pointer zen-items-center zen-border-0 zen-bg-transparent zen-p-0.5 zen-text-zen-muted-fg hover:zen-text-zen-foreground"
          >
            <Icon name="search" size={16} />
          </button>
        </Show>
        <button
          type="button"
          tabIndex={-1}
          aria-label={open() ? "Close" : "Open"}
          disabled={local.disabled}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            if (open()) close();
            else {
              openList();
              input?.focus();
            }
          }}
          class="zen-flex zen-shrink-0 zen-cursor-pointer zen-items-center zen-border-0 zen-bg-transparent zen-p-0.5 zen-text-zen-muted-fg hover:zen-text-zen-foreground"
        >
          <Icon name={open() ? "chevron-up" : "chevron-down"} size={16} />
        </button>
      </div>
      <span id={statusId} class="zen-sr-only" aria-live="polite">
        {status()}
      </span>

      <Show when={open()}>
        <Portal>
          <div
            ref={list}
            id={listId}
            role="listbox"
            aria-label={local["aria-label"] ?? local.placeholder}
            dir={placement.dir()}
            // Presses in the list must not take focus from the field.
            onMouseDown={(e) => e.preventDefault()}
            // One grid for the whole table: the header and every row are subgrids
            // of it, so a column is as wide as its widest cell and lines up on
            // every row. Rows as separate grids could only align fixed widths.
            style={{
              ...placement.style(),
              display: "grid",
              "grid-template-columns": template(),
              "align-content": "start",
              width: local.listWidth ?? "max-content",
              "min-width": `max(${placement.style()["min-width"] ?? "0px"}, var(--zen-lookup-list-width))`,
              "max-width": `min(var(--zen-lookup-list-max-width), calc(100vw - 16px))`, // the placement keeps 8px off each edge
            }}
            class="zen-z-50 zen-gap-x-3 zen-overflow-y-auto zen-rounded-zen-md zen-border zen-border-solid zen-border-zen-border zen-bg-zen-background zen-text-sm zen-shadow-md"
          >
            <div
              data-lookup-head=""
              aria-hidden="true"
              class="zen-sticky zen-top-0 zen-z-10 zen-col-span-full zen-grid zen-border-0 zen-border-b zen-border-solid zen-border-zen-border zen-bg-zen-muted zen-px-3 zen-py-1.5 zen-text-xs zen-font-medium zen-text-zen-muted-fg"
              style={{ "grid-template-columns": "subgrid" }}
            >
              <For each={local.columns}>
                {(c) => <div class={cn("zen-truncate", c.align === "end" && "zen-text-end")}>{c.header}</div>}
              </For>
            </div>
            <Show
              when={rows().length > 0 && !tooShort()}
              fallback={<div class="zen-col-span-full zen-px-3 zen-py-2 zen-text-zen-muted-fg">{status()}</div>}
            >
              <div class={cn("zen-col-span-full zen-grid zen-py-1", loading() && "zen-opacity-60")} style={{ "grid-template-columns": "subgrid" }}>
                <For each={rows()}>
                  {(row, i) => {
                    const chosen = () => {
                      const v = value();
                      return !!v && local.rowKey(v) === local.rowKey(row);
                    };
                    return (
                      <div
                        id={rowId(i())}
                        role="option"
                        data-index={i()}
                        aria-selected={chosen()}
                        aria-label={local.columns.map((c) => cellText(c, row)).filter(Boolean).join(", ")}
                        onPointerMove={() => {
                          if (active() !== i()) {
                            fromPointer = true;
                            setActive(i());
                          }
                        }}
                        onClick={() => pick(row)}
                        class={cn(
                          "zen-col-span-full zen-mx-1 zen-grid zen-cursor-pointer zen-items-center zen-rounded-zen-sm zen-px-2 zen-py-1.5",
                          active() === i() && "zen-bg-zen-muted",
                          chosen() && "zen-font-medium zen-text-zen-primary",
                        )}
                        style={{ "grid-template-columns": "subgrid" }}
                      >
                        <For each={local.columns}>
                          {(c) => (
                            <div class={cn("zen-min-w-0 zen-truncate", c.align === "end" && "zen-text-end zen-tabular-nums")}>
                              {highlight(cellText(c, row))}
                            </div>
                          )}
                        </For>
                      </div>
                    );
                  }}
                </For>
              </div>
            </Show>
          </div>
        </Portal>
      </Show>
    </div>
  );
}
