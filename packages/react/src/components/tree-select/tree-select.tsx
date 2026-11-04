import * as React from "react";
import { createPortal } from "react-dom";
import {
  filterTree,
  findNode,
  isSelectable,
  pathTo,
  treeKeyTarget,
  visibleRows,
  type TreeRow,
  type TreeSelectNode,
} from "@algorisys/zen-ui-core/tree-select";
import { cn } from "../../lib/cn";
import { useAnchoredPlacement } from "../../lib/anchored";
import { Icon } from "../icon/icon";
import { useLocale } from "../locale/locale";

export type { TreeSelectNode };

/**
 * TreeSelect — pick one node from a hierarchy: an account from the chart of
 * accounts, an item group, a cost centre, a warehouse.
 *
 *   <TreeSelect items={accounts} value={account} onValueChange={setAccount}
 *     placeholder="Account" leavesOnly showPath />
 *
 * A field you can type into: the list under it is the tree, cut down to what
 * matches, every match under its ancestors (opened), so "Cash" under two
 * parents reads as two different things. With `showPath` the closed field says
 * "Assets › Current Assets › Cash" for the same reason. `leavesOnly` lets only
 * the end nodes be picked; groups just open and close.
 *
 * Keys: ↓ opens it; ↑ ↓ move; → opens a group or steps into it, ← closes it or
 * steps out (when nothing is typed: with text, they are the text's); Enter
 * picks (or opens a group that cannot be picked); Esc closes. Focus stays in
 * the field; the active row is announced through aria-activedescendant. The
 * tree logic is @algorisys/zen-ui-core/tree-select (check:tree-select).
 */
export type TreeSelectProps = {
  items: TreeSelectNode[];
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (id: string, node: TreeSelectNode) => void;
  placeholder?: string;
  /** Only nodes without children can be picked; groups open and close. */
  leavesOnly?: boolean;
  /** The closed field shows the node's path from the root, not just its name. */
  showPath?: boolean;
  /** Between the path's names. Default " › ". */
  pathSeparator?: string;
  /** Groups open when the list first opens, besides the picked node's ancestors. */
  defaultExpanded?: string[];
  /** Shown when nothing matches what was typed. Default "No matches". */
  emptyMessage?: string;
  /** Marked aria-invalid, with the error border. */
  invalid?: boolean;
  disabled?: boolean;
  /** Width of the field. Default 100%. */
  width?: number | string;
  /** Lands on the input, so `<label htmlFor>` names it. */
  id?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  className?: string;
};

/** The rows on screen for a query and a set of opened groups. */
function rowsFor(items: TreeSelectNode[], query: string, expanded: Set<string>) {
  const f = filterTree(items, query);
  return { filtered: f, rows: visibleRows(f.items, new Set([...expanded, ...f.expand])) };
}

export const TreeSelect = React.forwardRef<HTMLInputElement, TreeSelectProps>(
  (
    {
      items,
      value: valueProp,
      defaultValue,
      onValueChange,
      placeholder,
      leavesOnly = false,
      showPath,
      pathSeparator,
      defaultExpanded,
      emptyMessage,
      invalid,
      disabled,
      width,
      id,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledby,
      className,
    },
    ref,
  ) => {
    const loc = useLocale();
    const listId = React.useId();
    const inputId = id ?? `${listId}-input`;
    const rowId = (nodeId: string) => `${listId}-${nodeId}`;

    // The initial value seeds it; the user owns it after.
    const [internal, setInternal] = React.useState<string | null>(defaultValue ?? null);
    const value = valueProp !== undefined ? valueProp : internal;
    const [open, setOpen] = React.useState(false);
    const [query, setQuery] = React.useState("");
    // The initial set seeds it; the user owns it after.
    const [expanded, setExpanded] = React.useState(() => new Set(defaultExpanded ?? []));
    const [active, setActive] = React.useState(0);
    const wrapRef = React.useRef<HTMLDivElement>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const listRef = React.useRef<HTMLDivElement>(null);
    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    const selectedPath = React.useMemo(() => (value ? (pathTo(items, value) ?? []) : []), [items, value]);
    const display = !selectedPath.length
      ? ""
      : showPath
        ? selectedPath.map((n) => n.label).join(pathSeparator ?? " › ")
        : selectedPath[selectedPath.length - 1].label;

    const { rows } = React.useMemo(() => rowsFor(items, query, expanded), [items, query, expanded]);

    const openList = () => {
      if (disabled || open) return;
      // Open on the picked node: its ancestors opened, it active.
      let next = expanded;
      if (selectedPath.length > 1) {
        next = new Set([...expanded, ...selectedPath.slice(0, -1).map((n) => n.id)]);
        setExpanded(next);
      }
      setQuery("");
      setOpen(true);
      const at = rowsFor(items, "", next).rows.findIndex((r) => r.node.id === value);
      setActive(at >= 0 ? at : 0);
    };
    const close = () => {
      setOpen(false);
      setQuery("");
    };
    const pick = (node: TreeSelectNode) => {
      if (!isSelectable(node, leavesOnly)) return;
      if (valueProp === undefined) setInternal(node.id);
      onValueChange?.(node.id, node);
      close();
    };
    const toggle = (nodeId: string) =>
      setExpanded((e) => {
        const next = new Set(e);
        if (next.has(nodeId)) next.delete(nodeId);
        else next.add(nodeId);
        return next;
      });

    // The active row stays in range as the list changes under it.
    React.useEffect(() => {
      if (active > rows.length - 1) setActive(Math.max(0, rows.length - 1));
    }, [rows.length, active]);

    // The list lives in a portal, placed against the field (lib/anchored): a
    // list inside the field's wrapper was cut off by any ancestor that clips.
    const placement = useAnchoredPlacement({ anchor: wrapRef, popup: listRef, open, maxHeight: 288, matchWidth: true });

    // Only a key moves the list to its active row (in the list's own scroller,
    // never the page's). The pointer makes a row active by hovering it, and
    // scrolling then would slide the list under the pointer, onto the next
    // row, and scroll again. It runs after placement, and again when that
    // changes: the list is only a scroller once its height is capped, so a
    // list opening on a row far down has to start there.
    const fromPointer = React.useRef(false);
    React.useLayoutEffect(() => {
      const list = listRef.current;
      if (!open || !list) return;
      if (fromPointer.current) {
        fromPointer.current = false;
        return;
      }
      const el = list.querySelector<HTMLElement>(`[data-index="${active}"]`);
      if (!el) return;
      const top = el.offsetTop;
      const bottom = top + el.offsetHeight;
      if (top < list.scrollTop) list.scrollTop = top;
      else if (bottom > list.scrollTop + list.clientHeight) list.scrollTop = bottom - list.clientHeight;
    }, [open, active, placement.style]);

    // Closing on a press outside, while open.
    React.useEffect(() => {
      if (!open) return;
      const onDown = (e: PointerEvent) => {
        const t = e.target as Node;
        if (!wrapRef.current?.contains(t) && !listRef.current?.contains(t)) {
          setOpen(false);
          setQuery("");
        }
      };
      document.addEventListener("pointerdown", onDown, true);
      return () => document.removeEventListener("pointerdown", onDown, true);
    }, [open]);

    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (disabled) return;
      if (!open) {
        if (e.key === "ArrowDown" || e.key === "ArrowUp" || (e.key === "Enter" && !e.nativeEvent.isComposing)) {
          e.preventDefault();
          openList();
        } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          // Typing into the closed field starts a search: it opens empty, and
          // the key lands in it, rather than appending to the picked value's text.
          openList();
        }
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key === "Tab") {
        close();
        return;
      }
      const row = rows[active];
      if (e.key === "Enter") {
        e.preventDefault();
        if (!row) return;
        if (isSelectable(row.node, leavesOnly)) pick(row.node);
        else if (row.hasChildren) toggle(row.node.id);
        return;
      }
      // ← → are the text's while there is text to move through.
      if ((e.key === "ArrowLeft" || e.key === "ArrowRight") && query) return;
      const move = treeKeyTarget(e.key, rows, active);
      if (!move) return;
      e.preventDefault();
      if (move.kind === "move") setActive(move.index);
      else toggle(move.id);
    };

    const highlight = (label: string) => {
      const q = query.trim();
      if (!q) return label;
      const i = label.toLocaleLowerCase().indexOf(q.toLocaleLowerCase());
      if (i < 0) return label;
      return (
        <>
          {label.slice(0, i)}
          <mark className="zen-bg-transparent zen-font-semibold zen-text-inherit">{label.slice(i, i + q.length)}</mark>
          {label.slice(i + q.length)}
        </>
      );
    };

    const activeRow: TreeRow | undefined = rows[active];

    return (
      <div
        ref={wrapRef}
        className={cn("zen-relative", className)}
        style={{ width: typeof width === "number" ? `${width}px` : (width ?? "100%") }}
      >
        <div
          className={cn(
            "zen-flex zen-h-zen-control zen-items-center zen-gap-2 zen-rounded-zen-md zen-border zen-border-solid zen-border-zen-border zen-bg-zen-background zen-px-zen-control-x",
            "focus-within:zen-ring-2 focus-within:zen-ring-zen-ring focus-within:zen-ring-offset-2",
            invalid && "zen-border-zen-error",
            disabled && "zen-cursor-not-allowed zen-opacity-50",
          )}
        >
          <input
            ref={inputRef}
            id={inputId}
            type="text"
            role="combobox"
            aria-haspopup="tree"
            aria-expanded={open}
            aria-controls={open ? listId : undefined}
            aria-activedescendant={open && activeRow ? rowId(activeRow.node.id) : undefined}
            aria-autocomplete="list"
            aria-invalid={invalid ? "true" : undefined}
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledby}
            disabled={disabled}
            autoComplete="off"
            spellCheck={false}
            // Open: what is typed (the picked value is the placeholder, so it stays
            // in sight). Closed: the picked value.
            value={open ? query : display}
            placeholder={open ? display || placeholder : placeholder}
            onChange={(e) => {
              const q = e.currentTarget.value;
              setQuery(q);
              if (!open) setOpen(true);
              // The first match that can be picked is active, not its ancestor
              // group at the top, so Enter picks what was searched for.
              const next = rowsFor(items, q, expanded);
              const at = next.rows.findIndex((r) => next.filtered.matches.has(r.node.id) && isSelectable(r.node, leavesOnly));
              setActive(at >= 0 ? at : 0);
            }}
            onClick={() => openList()}
            onKeyDown={onKeyDown}
            className="zen-min-w-0 zen-flex-1 zen-border-0 zen-bg-transparent zen-text-sm zen-text-zen-foreground zen-outline-none placeholder:zen-text-zen-muted-fg"
          />
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
            className="zen-flex zen-shrink-0 zen-cursor-pointer zen-items-center zen-border-0 zen-bg-transparent zen-p-0 zen-text-zen-muted-fg"
          >
            <Icon name={open ? "chevron-up" : "chevron-down"} size={16} />
          </button>
        </div>

        {open &&
          createPortal(
            <div
              ref={listRef}
              dir={placement.dir}
              style={placement.style}
              id={listId}
              role="tree"
              aria-label={ariaLabel ?? placeholder}
              // Presses in the list must not take focus from the field.
              onMouseDown={(e) => e.preventDefault()}
              className="zen-z-50 zen-overflow-y-auto zen-rounded-zen-md zen-border zen-border-solid zen-border-zen-border zen-bg-zen-background zen-p-1 zen-shadow-md"
            >
              {rows.length === 0 ? (
                <div className="zen-px-2 zen-py-1.5 zen-text-sm zen-text-zen-muted-fg">{emptyMessage ?? loc.t("treeSelect.noMatches")}</div>
              ) : (
                rows.map((row, i) => {
                  const selectable = isSelectable(row.node, leavesOnly);
                  const picked = value === row.node.id;
                  return (
                    <div
                      key={row.node.id}
                      id={rowId(row.node.id)}
                      role="treeitem"
                      data-index={i}
                      aria-level={row.level}
                      aria-posinset={row.posInSet}
                      aria-setsize={row.setSize}
                      aria-expanded={row.hasChildren ? row.expanded : undefined}
                      aria-selected={picked}
                      // Disabled means not operable: a group that only opens (leavesOnly)
                      // is operable, so it is not marked, only a disabled node is.
                      aria-disabled={row.node.disabled || undefined}
                      onMouseMove={() => {
                        if (active === i) return;
                        fromPointer.current = true;
                        setActive(i);
                      }}
                      onClick={() => (selectable ? pick(row.node) : row.hasChildren && toggle(row.node.id))}
                      className={cn(
                        "zen-flex zen-cursor-default zen-select-none zen-items-center zen-gap-1 zen-rounded-zen-sm zen-py-zen-menu-y zen-pe-2 zen-text-sm",
                        i === active && "zen-bg-zen-muted",
                        picked && "zen-font-medium zen-text-zen-primary",
                        !selectable && !row.hasChildren && "zen-opacity-50",
                        !selectable && row.hasChildren && "zen-text-zen-muted-fg",
                      )}
                      style={{ paddingInlineStart: `calc(${row.level - 1} * var(--zen-space-4) + var(--zen-space-1))` }}
                    >
                      <span
                        aria-hidden="true"
                        className="zen-flex zen-h-5 zen-w-5 zen-shrink-0 zen-items-center zen-justify-center"
                        onClick={(e) => {
                          if (!row.hasChildren) return;
                          e.stopPropagation();
                          toggle(row.node.id);
                        }}
                      >
                        {row.hasChildren ? <Icon name={row.expanded ? "chevron-down" : "chevron-right"} size={14} /> : null}
                      </span>
                      <span className="zen-min-w-0 zen-flex-1 zen-truncate">{highlight(row.node.label)}</span>
                      {picked ? <Icon name="check" size={14} /> : null}
                    </div>
                  );
                })
              )}
            </div>,
            document.body,
          )}
      </div>
    );
  },
);
TreeSelect.displayName = "TreeSelect";

/** The node for an id, for showing a picked value elsewhere. */
export const findTreeSelectNode = findNode;
