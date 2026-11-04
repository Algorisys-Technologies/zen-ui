import * as React from "react";
import { createPortal } from "react-dom";
import { filterLookup, highlightRanges, queryWords } from "@algorisys/zen-ui-core/lookup";
import { cn } from "../../lib/cn";
import { useAnchoredPlacement } from "../../lib/anchored";
import { Icon } from "../icon/icon";
import { useLocale } from "../locale/locale";

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
 *     value={item} onValueChange={setItem} onValueHelp={openValueHelp}
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
 * Mirrors solid/src/components/lookup-field/lookup-field.tsx.
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
  /** Lands on the input, so `<label htmlFor>` names it. */
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
  className?: string;
};

const cellText = <T,>(col: LookupColumn<T>, row: T): string => {
  if (col.value) return col.value(row);
  const v = (row as Record<string, unknown>)[col.key];
  return v == null ? "" : String(v);
};

const PAGE = 10;

export function LookupField<T>({
  columns,
  rows: rowsProp,
  onSearch,
  minQueryLength,
  debounce,
  rowKey,
  rowLabel,
  value: valueProp,
  defaultValue,
  onValueChange,
  onValueHelp,
  maxRows,
  placeholder,
  emptyMessage,
  invalid,
  disabled,
  id,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
  width,
  listWidth,
  className,
}: LookupFieldProps<T>) {
  const loc = useLocale();
  const listId = React.useId();
  const statusId = `${listId}-status`;
  const rowId = (i: number) => `${listId}-r${i}`;
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);

  // The initial value seeds it; the user owns it after.
  const [internal, setInternal] = React.useState<T | null>(defaultValue ?? null);
  const value = valueProp !== undefined ? valueProp : internal;
  const label = (row: T | null) => (row ? (rowLabel ? rowLabel(row) : cellText(columns[0], row)) : "");

  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  /** Whether the text is the user's typing (a search), not the chosen row's label. */
  const [typed, setTyped] = React.useState(false);
  const [active, setActive] = React.useState(0);
  const text = typed ? query : label(value);

  // Rows: searched here, or asked for.
  const [remote, setRemote] = React.useState<{ rows: T[]; for: string } | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const minChars = minQueryLength ?? 1;
  const asking = !!onSearch;
  const tooShort = asking && query.trim().length < minChars;

  // The search runs again when the query changes, not when the caller hands a
  // new function each render (an inline `onSearch` is the usual case).
  const searchRef = React.useRef(onSearch);
  searchRef.current = onSearch;
  React.useEffect(() => {
    if (!open || !asking) return;
    if (query.trim().length < minChars) {
      setRemote(null);
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setFailed(false);
    const timer = setTimeout(() => {
      searchRef.current!(query, controller.signal).then(
        (rows) => {
          if (controller.signal.aborted) return;
          setRemote({ rows, for: query });
          setLoading(false);
        },
        () => {
          if (controller.signal.aborted) return;
          setFailed(true);
          setLoading(false);
        },
      );
    }, debounce ?? 200);
    // The newest query wins: the older one's timer is dropped and its request aborted.
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [open, query, asking, minChars, debounce]);

  const max = maxRows ?? 50;
  const rows = React.useMemo<T[]>(() => {
    if (asking) return (remote?.rows ?? []).slice(0, max);
    const searchable = (row: T) => columns.filter((c) => c.searchable !== false).map((c) => cellText(c, row));
    return filterLookup(rowsProp ?? [], searchable, typed ? query : "", max);
  }, [asking, remote, max, columns, rowsProp, typed, query]);
  const words = React.useMemo(() => (typed ? queryWords(query) : []), [typed, query]);

  // The list lives in a portal, placed against the field (lib/anchored): a
  // list inside the field's wrapper is cut off by any ancestor that clips.
  const placement = useAnchoredPlacement({ anchor: wrapRef, popup: listRef, open, maxHeight: 320 });

  const openList = () => {
    if (disabled || open) return;
    setOpen(true);
    // Open on the chosen row when it is listed.
    const at = value && !typed ? rows.findIndex((r) => rowKey(r) === rowKey(value)) : -1;
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
    const changed = row === null ? value !== null : !value || rowKey(value) !== rowKey(row);
    if (valueProp === undefined) setInternal(row);
    revert();
    if (changed) onValueChange?.(row);
  };

  // The active row stays in range as the list changes under it.
  React.useEffect(() => {
    if (active > rows.length - 1) setActive(Math.max(0, rows.length - 1));
  }, [rows.length, active]);

  // Only a key moves the list to its active row (in the list's own scroller,
  // never the page's): hovering a row makes it active, and scrolling then would
  // slide the list under the pointer onto the next row. It runs after
  // placement, and again when that changes: the list is only a scroller once
  // its height is capped, so a list opening on a row far down has to start
  // there (the TreeSelect port found this). The sticky header covers the top
  // of the scroller, so a row is in sight only below it.
  const fromPointer = React.useRef(false);
  React.useLayoutEffect(() => {
    const list = listRef.current;
    if (!open || !list) return;
    if (fromPointer.current) {
      fromPointer.current = false;
      return;
    }
    const el = list.querySelector<HTMLElement>(`[data-index="${active}"]`);
    const head = list.querySelector<HTMLElement>("[data-lookup-head]");
    if (!el) return;
    const top = el.offsetTop - (head?.offsetHeight ?? 0);
    const bottom = el.offsetTop + el.offsetHeight;
    if (top < list.scrollTop) list.scrollTop = top;
    else if (bottom > list.scrollTop + list.clientHeight) list.scrollTop = bottom - list.clientHeight;
  }, [open, active, rows, placement.style]);

  // A press outside closes it, putting the label back.
  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!wrapRef.current?.contains(t) && !listRef.current?.contains(t)) {
        setOpen(false);
        setTyped(false);
        setQuery("");
      }
    };
    document.addEventListener("pointerdown", onDown, true);
    return () => document.removeEventListener("pointerdown", onDown, true);
  }, [open]);

  const move = (to: number) => {
    const n = rows.length;
    if (n === 0) return;
    setActive(Math.max(0, Math.min(n - 1, to)));
  };

  const valueHelp = () => {
    const q = typed ? query : "";
    revert();
    onValueHelp?.(q);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    if (e.key === "F4" && onValueHelp) {
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
        if (!open || e.nativeEvent.isComposing) return;
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

  const highlight = (s: string): React.ReactNode => {
    if (!words.length) return s;
    const ranges = highlightRanges(s, words);
    if (!ranges.length) return s;
    const out: React.ReactNode[] = [];
    let at = 0;
    for (const [a, b] of ranges) {
      if (a > at) out.push(s.slice(at, a));
      out.push(
        <mark key={a} className="zen-bg-transparent zen-font-semibold zen-text-inherit">
          {s.slice(a, b)}
        </mark>,
      );
      at = b;
    }
    if (at < s.length) out.push(s.slice(at));
    return out;
  };

  const template = columns.map((c) => c.width ?? "minmax(0,1fr)").join(" ");
  const status = !open
    ? ""
    : tooShort
      ? loc.t("lookupField.typeMore", { count: minChars })
      : loading
        ? loc.t("lookupField.searching")
        : failed
          ? loc.t("lookupField.failed")
          : rows.length === 0
            ? (emptyMessage ?? loc.t("lookupField.noMatches"))
            : loc.t("lookupField.results", { count: rows.length });

  return (
    <div ref={wrapRef} className={cn("zen-relative", className)} style={{ width: width ?? "100%" }}>
      <div
        className={cn(
          "zen-flex zen-h-zen-control zen-items-center zen-gap-1 zen-rounded-zen-md zen-border zen-border-solid zen-bg-zen-background zen-px-zen-control-x",
          "focus-within:zen-ring-2 focus-within:zen-ring-zen-ring focus-within:zen-ring-offset-2",
          invalid ? "zen-border-zen-error" : "zen-border-zen-border",
          disabled && "zen-cursor-not-allowed zen-opacity-50",
        )}
      >
        <input
          ref={inputRef}
          id={id}
          type="text"
          role="combobox"
          autoComplete="off"
          spellCheck={false}
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          aria-activedescendant={open && rows[active] ? rowId(active) : undefined}
          aria-describedby={statusId}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledby}
          aria-invalid={invalid ? "true" : undefined}
          aria-keyshortcuts={onValueHelp ? "F4" : undefined}
          disabled={disabled}
          placeholder={placeholder}
          value={text}
          onChange={(e) => {
            setQuery(e.currentTarget.value);
            setTyped(true);
            setActive(0);
            if (!open) setOpen(true);
          }}
          onClick={() => openList()}
          onBlur={() => {
            // Emptied: cleared. Anything else typed and not picked: the label comes back.
            if (typed && query.trim() === "") pick(null);
            else revert();
          }}
          onKeyDown={onKeyDown}
          className="zen-min-w-0 zen-flex-1 zen-border-0 zen-bg-transparent zen-text-sm zen-text-zen-foreground zen-outline-none placeholder:zen-text-zen-muted-fg"
        />
        {onValueHelp ? (
          <button
            type="button"
            tabIndex={-1}
            aria-label={loc.t("lookupField.searchAll")}
            title={loc.t("lookupField.searchAll")}
            disabled={disabled}
            onMouseDown={(e) => e.preventDefault()}
            onClick={valueHelp}
            className="zen-flex zen-shrink-0 zen-cursor-pointer zen-items-center zen-border-0 zen-bg-transparent zen-p-0.5 zen-text-zen-muted-fg hover:zen-text-zen-foreground"
          >
            <Icon name="search" size={16} />
          </button>
        ) : null}
        <button
          type="button"
          tabIndex={-1}
          aria-label={open ? loc.t("common.close") : loc.t("common.open")}
          disabled={disabled}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            if (open) close();
            else {
              openList();
              inputRef.current?.focus();
            }
          }}
          className="zen-flex zen-shrink-0 zen-cursor-pointer zen-items-center zen-border-0 zen-bg-transparent zen-p-0.5 zen-text-zen-muted-fg hover:zen-text-zen-foreground"
        >
          <Icon name={open ? "chevron-up" : "chevron-down"} size={16} />
        </button>
      </div>
      <span id={statusId} className="zen-sr-only" aria-live="polite">
        {status}
      </span>

      {open &&
        createPortal(
          <div
            ref={listRef}
            id={listId}
            role="listbox"
            aria-label={ariaLabel ?? placeholder}
            dir={placement.dir}
            // Presses in the list must not take focus from the field.
            onMouseDown={(e) => e.preventDefault()}
            // One grid for the whole table: the header and every row are subgrids
            // of it, so a column is as wide as its widest cell and lines up on
            // every row. Rows as separate grids could only align fixed widths.
            style={{
              ...placement.style,
              display: "grid",
              gridTemplateColumns: template,
              alignContent: "start",
              width: listWidth ?? "max-content",
              minWidth: `max(${placement.style.minWidth ?? "0px"}, var(--zen-lookup-list-width))`,
              maxWidth: "min(var(--zen-lookup-list-max-width), calc(100vw - 16px))", // the placement keeps 8px off each edge
            }}
            className="zen-z-50 zen-gap-x-3 zen-overflow-y-auto zen-rounded-zen-md zen-border zen-border-solid zen-border-zen-border zen-bg-zen-background zen-text-sm zen-shadow-md"
          >
            <div
              data-lookup-head=""
              aria-hidden="true"
              className="zen-sticky zen-top-0 zen-z-10 zen-col-span-full zen-grid zen-border-0 zen-border-b zen-border-solid zen-border-zen-border zen-bg-zen-muted zen-px-3 zen-py-1.5 zen-text-xs zen-font-medium zen-text-zen-muted-fg"
              style={{ gridTemplateColumns: "subgrid" }}
            >
              {columns.map((c) => (
                <div key={c.key} className={cn("zen-truncate", c.align === "end" && "zen-text-end")}>
                  {c.header}
                </div>
              ))}
            </div>
            {rows.length > 0 && !tooShort ? (
              <div
                className={cn("zen-col-span-full zen-grid zen-py-1", loading && "zen-opacity-60")}
                style={{ gridTemplateColumns: "subgrid" }}
              >
                {rows.map((row, i) => {
                  const chosen = !!value && rowKey(value) === rowKey(row);
                  return (
                    <div
                      key={rowKey(row)}
                      id={rowId(i)}
                      role="option"
                      data-index={i}
                      aria-selected={chosen}
                      aria-label={columns.map((c) => cellText(c, row)).filter(Boolean).join(", ")}
                      onPointerMove={() => {
                        if (active !== i) {
                          fromPointer.current = true;
                          setActive(i);
                        }
                      }}
                      onClick={() => pick(row)}
                      className={cn(
                        "zen-col-span-full zen-mx-1 zen-grid zen-cursor-pointer zen-items-center zen-rounded-zen-sm zen-px-2 zen-py-1.5",
                        active === i && "zen-bg-zen-muted",
                        chosen && "zen-font-medium zen-text-zen-primary",
                      )}
                      style={{ gridTemplateColumns: "subgrid" }}
                    >
                      {columns.map((c) => (
                        <div
                          key={c.key}
                          className={cn("zen-min-w-0 zen-truncate", c.align === "end" && "zen-text-end zen-tabular-nums")}
                        >
                          {highlight(cellText(c, row))}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="zen-col-span-full zen-px-3 zen-py-2 zen-text-zen-muted-fg">{status}</div>
            )}
          </div>,
          document.body,
        )}
    </div>
  );
}
