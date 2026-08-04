import * as React from "react";
import {
  computeDiff,
  parseSnapshot,
  isKeyed,
  type DiffKind,
} from "@algorisys/zen-ui-core";
import { cn } from "../../lib/cn";

/**
 * DiffView — what changed between two snapshots of the same record.
 *
 *   <DiffView before={previous} after={current} />
 *
 * An audit payload, a revision, a form's dirty state. It renders a TABLE because
 * that is what it is: the fields are rows and the two snapshots are columns, and
 * a table is the only markup that lets a screen-reader user ask "which field is
 * this?" halfway down.
 *
 * The diffing is `computeDiff` in core, shared by every binding — see
 * scripts/check-diff.ts for what counts as a change. This file only decides how
 * a row looks.
 *
 * Kind is never signalled by colour alone. A replaced value is struck through
 * and an absent one is a dash with a screen-reader label, so the diff survives
 * greyscale and a colour-blind reader — which is most of the point of showing a
 * before column at all.
 */

const AFTER_CLASS: Record<DiffKind, string> = {
  added: "zen-text-zen-success",
  removed: "zen-text-zen-muted-fg",
  changed: "zen-text-zen-foreground",
  unchanged: "zen-text-zen-muted-fg",
};

export interface DiffViewProps {
  /**
   * Either snapshot, in whatever shape your audit column actually holds: an
   * object, a JSON string, a bare array, plain prose, or empty for "there was no
   * before". Strings are parsed with `parse`; a string that is not JSON is kept
   * as the text it is rather than lost to a failed parse.
   *
   * Two objects are compared field by field. Anything else is shown whole, side
   * by side, because an array has no field names to put in the left column.
   */
  before?: unknown;
  /** As `before`. Omit for a record that was deleted. */
  after?: unknown;
  /** Override how a raw string becomes a value. Defaults to a JSON parse that never throws. */
  parse?: (raw: string) => unknown;
  /** Which keys to compare, in this order. Omitted compares every key on either side. */
  keys?: string[];
  /** Display names for keys. Unlisted keys render verbatim. */
  labels?: Record<string, string>;
  /** Default `true` — an audit entry is about what changed. */
  changedOnly?: boolean;
  /**
   * How a value becomes something to look at. The default prints strings
   * verbatim, `null` as the literal word (a cleared field and an absent one are
   * different events), and anything else through `JSON.stringify`.
   */
  format?: (value: unknown, key: string) => React.ReactNode;
  /** Column headings. Defaults to "Field" / "Before" / "After". */
  headings?: { key?: string; before?: string; after?: string };
  /** `"compact"` tightens the rows for a Timeline slot or a popover. */
  density?: "default" | "compact";
  /** Shown when nothing changed — the common case in an audit log, not an error. */
  emptyMessage?: React.ReactNode;
  className?: string;
}

const defaultFormat = (value: unknown): React.ReactNode => {
  if (value === null) return <span className="zen-italic">null</span>;
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") {
    return String(value);
  }
  if (value instanceof Date) return value.toISOString();
  return JSON.stringify(value);
};

/**
 * A dash alone tells a screen reader nothing — it is punctuation, and some
 * readers skip it entirely. The word is what carries the meaning.
 */
const Absent = () => (
  <>
    <span aria-hidden className="zen-text-zen-muted-fg">
      —
    </span>
    <span className="zen-sr-only">not set</span>
  </>
);

export const DiffView = ({
  before,
  after,
  parse,
  keys,
  labels,
  changedOnly,
  format,
  headings,
  density,
  emptyMessage,
  className,
}: DiffViewProps) => {
  /* Inlined rather than a helper defined per render: a helper would have to be
     a dependency of both memos, and a new identity every render makes the memo
     a lie that recomputes anyway. */
  const left = React.useMemo(
    () => (typeof before === "string" && parse ? parse(before) : parseSnapshot(before)),
    [before, parse],
  );
  const right = React.useMemo(
    () => (typeof after === "string" && parse ? parse(after) : parseSnapshot(after)),
    [after, parse],
  );

  /* Field-by-field only when there are fields on both sides worth naming. A
     creation has no before, so the after alone decides. */
  const keyed = React.useMemo(() => {
    const sides = [left, right].filter((v) => v !== undefined);
    return sides.length > 0 && sides.every(isKeyed);
  }, [left, right]);

  const rows = React.useMemo(
    () =>
      keyed
        ? computeDiff(
            left as Record<string, unknown> | undefined,
            right as Record<string, unknown> | undefined,
            { keys, labels, changedOnly },
          )
        : [],
    [keyed, left, right, keys, labels, changedOnly],
  );

  const compact = density === "compact";
  const cell = cn("zen-align-top", compact ? "zen-px-2 zen-py-1" : "zen-px-3 zen-py-2");
  const draw = (value: unknown, key: string) => (format ? format(value, key) : defaultFormat(value));

  /** Both sides absent is genuinely nothing to show, whatever the shape. */
  const empty = keyed ? rows.length === 0 : left === undefined && right === undefined;

  if (empty) {
    return (
      <p className="zen-m-0 zen-py-3 zen-text-sm zen-text-zen-muted-fg">
        {emptyMessage ?? "No changes"}
      </p>
    );
  }

  if (!keyed) {
    /*
     * The whole-value view, for payloads with no fields to line up: a bare
     * array, a line of prose, a number. Each side says "not set" on its own when
     * it is the side that is missing — a creation and a deletion are different
     * events and must not both read as "no changes".
     */
    const pane = (heading: string, value: unknown, tone: string) => (
      <div className="zen-flex zen-min-w-0 zen-flex-1 zen-flex-col zen-gap-1">
        <span className="zen-text-xs zen-font-semibold zen-uppercase zen-tracking-wide zen-text-zen-muted-fg">
          {heading}
        </span>
        {value === undefined ? (
          <p className="zen-m-0 zen-text-sm">
            <Absent />
          </p>
        ) : (
          <pre
            className={cn(
              "zen-m-0 zen-max-h-64 zen-overflow-auto zen-whitespace-pre-wrap zen-break-words zen-rounded-zen-sm zen-bg-zen-muted zen-p-2 zen-text-xs",
              tone,
            )}
          >
            {typeof value === "string" ? value : JSON.stringify(value, null, 2)}
          </pre>
        )}
      </div>
    );

    return (
      <div className={cn("zen-flex zen-w-full zen-flex-wrap zen-gap-4", className)}>
        {pane(headings?.before ?? "Before", left, "zen-text-zen-muted-fg")}
        {pane(headings?.after ?? "After", right, "zen-text-zen-foreground")}
      </div>
    );
  }

  return (
    /* Its own scroller: a long value must not widen the page, and a diff dropped
       into a Timeline slot has no width of its own to give. */
    <div
      className={cn(
        "zen-w-full zen-overflow-x-auto zen-rounded-zen-md zen-border zen-border-zen-border",
        className,
      )}
    >
      <table className="zen-w-full zen-border-collapse zen-text-start zen-text-sm">
        <thead>
          <tr className="zen-border-b zen-border-zen-border zen-bg-zen-muted">
            {[headings?.key ?? "Field", headings?.before ?? "Before", headings?.after ?? "After"].map(
              (h) => (
                <th
                  key={h}
                  scope="col"
                  className={cn(cell, "zen-text-start zen-font-medium zen-text-zen-muted-fg")}
                >
                  {h}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key} className="zen-border-b zen-border-zen-border last:zen-border-b-0">
              <th
                scope="row"
                className={cn(cell, "zen-text-start zen-font-medium zen-text-zen-foreground")}
              >
                {row.label}
              </th>
              <td className={cn(cell, "zen-text-zen-muted-fg")}>
                {row.kind === "added" ? (
                  <Absent />
                ) : (
                  /* Struck through rather than merely dimmed: the signal has to
                     survive greyscale. */
                  <span className={row.kind === "unchanged" ? undefined : "zen-line-through"}>
                    {draw(row.before, row.key)}
                  </span>
                )}
              </td>
              <td className={cn(cell, AFTER_CLASS[row.kind])}>
                {row.kind === "removed" ? <Absent /> : draw(row.after, row.key)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
