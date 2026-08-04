import { computeDiff, parseSnapshot, isKeyed, type DiffKind } from "@algorisys/zen-ui-core";
import { cn } from "../../lib/cn";
import { applyProps, Disposer, toNodes, type BaseProps, type Child, type ZenComponent } from "../../lib/component";

/**
 * DiffView — what changed between two snapshots of the same record.
 *
 *   DiffView({ before: previous, after: current }).el
 *
 * Vanilla port; see the React binding for the reasoning. Same API, same output.
 *
 * It renders a TABLE because that is what it is: the fields are rows and the two
 * snapshots are columns, and a table is the only markup that lets a screen-reader
 * user ask "which field is this?" halfway down.
 *
 * The diffing is `computeDiff` in core, shared by every binding and pinned by
 * scripts/check-diff.ts. This file only decides how a row looks.
 *
 * Kind is never signalled by colour alone: a replaced value is struck through and
 * an absent one is a dash with a screen-reader label, so the diff survives
 * greyscale — which is most of the point of showing a before column at all.
 */

const AFTER_CLASS: Record<DiffKind, string> = {
  added: "zen-text-zen-success",
  removed: "zen-text-zen-muted-fg",
  changed: "zen-text-zen-foreground",
  unchanged: "zen-text-zen-muted-fg",
};

export interface DiffViewProps extends BaseProps {
  /**
   * Either snapshot, in whatever shape your audit column actually holds: an
   * object, a JSON string, a bare array, plain prose, or empty for "there was no
   * before". Strings are parsed with `parse`; a string that is not JSON is kept
   * as the text it is rather than lost to a failed parse.
   */
  before?: unknown;
  /** As `before`. Omit for a record that was deleted. */
  after?: unknown;
  /** Override how a raw string becomes a value. Defaults to a parse that never throws. */
  parse?: (raw: string) => unknown;
  /** Which keys to compare, in this order. Omitted compares every key on either side. */
  keys?: string[];
  /** Display names for keys. Unlisted keys render verbatim. */
  labels?: Record<string, string>;
  /** Default `true` — an audit entry is about what changed. */
  changedOnly?: boolean;
  /** How a value becomes something to look at. */
  format?: (value: unknown, key: string) => Child;
  /** Column headings. Defaults to "Field" / "Before" / "After". */
  headings?: { key?: string; before?: string; after?: string };
  /** `"compact"` tightens the rows for a Timeline slot or a popover. */
  density?: "default" | "compact";
  /** Shown when nothing changed — the common case in an audit log, not an error. */
  emptyMessage?: Child;
}

function defaultFormat(value: unknown): Child {
  if (value === null) {
    const i = document.createElement("span");
    i.className = "zen-italic";
    i.textContent = "null";
    return i;
  }
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") return String(value);
  if (value instanceof Date) return value.toISOString();
  return JSON.stringify(value) ?? "";
}

/**
 * A dash alone tells a screen reader nothing — it is punctuation, and some
 * readers skip it entirely. The word is what carries the meaning.
 *
 * Returns FRESH nodes on every call. A module-level constant would be one node
 * moved from cell to cell by append, leaving every earlier cell empty — the exact
 * bug the Solid port shipped, where the placeholder appeared in one of three
 * cells because a JSX const is one DOM node.
 */
function absent(): Node[] {
  const dash = document.createElement("span");
  dash.setAttribute("aria-hidden", "true");
  dash.className = "zen-text-zen-muted-fg";
  dash.textContent = "—";
  const word = document.createElement("span");
  word.className = "zen-sr-only";
  word.textContent = "not set";
  return [dash, word];
}

export function DiffView(props: DiffViewProps): ZenComponent<DiffViewProps> {
  let current: DiffViewProps = { ...props };
  const disposer = new Disposer();
  let removeProps: (() => void) | undefined;

  /* One stable root across updates, for the same reason Timeline has one: `el`
     is handed out once, so a factory cannot swap a <table> for a <p> the way
     React returns a different element. The markup INSIDE matches React element
     for element, including rendering no table at all when empty. */
  const el = document.createElement("div");

  const render = () => {
    const {
      before, after, parse, keys, labels, changedOnly, format, headings, density, emptyMessage,
      class: className, children: _children,
      ...rest
    } = current;

    const left = typeof before === "string" && parse ? parse(before) : parseSnapshot(before);
    const right = typeof after === "string" && parse ? parse(after) : parseSnapshot(after);

    /* Field-by-field only when there are fields on both sides worth naming. A
       creation has no before, so the after alone decides. */
    const sides = [left, right].filter((v) => v !== undefined);
    const keyed = sides.length > 0 && sides.every(isKeyed);

    const rows = keyed
      ? computeDiff(
          left as Record<string, unknown> | undefined,
          right as Record<string, unknown> | undefined,
          { keys, labels, changedOnly },
        )
      : [];

    const compact = density === "compact";
    const cell = cn("zen-align-top", compact ? "zen-px-2 zen-py-1" : "zen-px-3 zen-py-2");
    const draw = (value: unknown, key: string): Node[] =>
      toNodes(format ? format(value, key) : defaultFormat(value));

    /** Both sides absent is genuinely nothing to show, whatever the shape. */
    const empty = keyed ? rows.length === 0 : left === undefined && right === undefined;

    el.replaceChildren();

    if (empty) {
      el.className = cn(className);
      const p = document.createElement("p");
      p.className = "zen-m-0 zen-py-3 zen-text-sm zen-text-zen-muted-fg";
      p.append(...toNodes(emptyMessage ?? "No changes"));
      el.append(p);
    } else if (!keyed) {
      /* The whole-value view, for payloads with no fields to line up: a bare
         array, a line of prose, a number. Each side says "not set" on its own
         when it is the side that is missing — a creation and a deletion are
         different events and must not both read as "no changes". */
      el.className = cn("zen-flex zen-w-full zen-flex-wrap zen-gap-4", className);

      const pane = (heading: string, value: unknown, tone: string) => {
        const wrap = document.createElement("div");
        wrap.className = "zen-flex zen-min-w-0 zen-flex-1 zen-flex-col zen-gap-1";
        const h = document.createElement("span");
        h.className = "zen-text-xs zen-font-semibold zen-uppercase zen-tracking-wide zen-text-zen-muted-fg";
        h.textContent = heading;
        wrap.append(h);

        if (value === undefined) {
          const p = document.createElement("p");
          p.className = "zen-m-0 zen-text-sm";
          p.append(...absent());
          wrap.append(p);
        } else {
          const pre = document.createElement("pre");
          pre.className = cn(
            "zen-m-0 zen-max-h-64 zen-overflow-auto zen-whitespace-pre-wrap zen-break-words zen-rounded-zen-sm zen-bg-zen-muted zen-p-2 zen-text-xs",
            tone,
          );
          pre.textContent = typeof value === "string" ? value : JSON.stringify(value, null, 2);
          wrap.append(pre);
        }
        return wrap;
      };

      el.append(
        pane(headings?.before ?? "Before", left, "zen-text-zen-muted-fg"),
        pane(headings?.after ?? "After", right, "zen-text-zen-foreground"),
      );
    } else {
      /* Its own scroller: a long value must not widen the page, and a diff
         dropped into a Timeline slot has no width of its own to give. */
      el.className = cn(
        "zen-w-full zen-overflow-x-auto zen-rounded-zen-md zen-border zen-border-zen-border",
        className,
      );

      const table = document.createElement("table");
      table.className = "zen-w-full zen-border-collapse zen-text-start zen-text-sm";

      const thead = document.createElement("thead");
      const hr = document.createElement("tr");
      hr.className = "zen-border-b zen-border-zen-border zen-bg-zen-muted";
      for (const h of [headings?.key ?? "Field", headings?.before ?? "Before", headings?.after ?? "After"]) {
        const th = document.createElement("th");
        th.setAttribute("scope", "col");
        th.className = cn(cell, "zen-text-start zen-font-medium zen-text-zen-muted-fg");
        th.textContent = h;
        hr.append(th);
      }
      thead.append(hr);
      table.append(thead);

      const tbody = document.createElement("tbody");
      for (const row of rows) {
        const tr = document.createElement("tr");
        tr.className = "zen-border-b zen-border-zen-border last:zen-border-b-0";

        const key = document.createElement("th");
        key.setAttribute("scope", "row");
        key.className = cn(cell, "zen-text-start zen-font-medium zen-text-zen-foreground");
        key.textContent = row.label;
        tr.append(key);

        const beforeCell = document.createElement("td");
        beforeCell.className = cn(cell, "zen-text-zen-muted-fg");
        if (row.kind === "added") {
          beforeCell.append(...absent());
        } else {
          /* Struck through rather than merely dimmed: the signal has to survive
             greyscale. */
          const span = document.createElement("span");
          if (row.kind !== "unchanged") span.className = "zen-line-through";
          span.append(...draw(row.before, row.key));
          beforeCell.append(span);
        }
        tr.append(beforeCell);

        const afterCell = document.createElement("td");
        afterCell.className = cn(cell, AFTER_CLASS[row.kind]);
        if (row.kind === "removed") afterCell.append(...absent());
        else afterCell.append(...draw(row.after, row.key));
        tr.append(afterCell);

        tbody.append(tr);
      }
      table.append(tbody);
      el.append(table);
    }

    removeProps?.();
    removeProps = applyProps(el, rest as Record<string, unknown>);
  };

  render();
  disposer.add(() => removeProps?.());

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
