import { For, Show, createMemo, type JSX } from "solid-js";
import {
  computeDiff,
  parseSnapshot,
  isKeyed,
  type DiffKind,
} from "@algorisys/zen-ui-core/diff";
import { cn } from "../../lib/cn";

/**
 * DiffView — what changed between two snapshots of the same record.
 *
 *   <DiffView before={previous} after={current} />
 *
 * An audit payload, a revision, a form's dirty state. It renders a TABLE
 * because that is what it is: the fields are rows and the two snapshots are
 * columns, and a table is the only markup that lets a screen-reader user ask
 * "which field is this?" halfway down.
 *
 * The diffing itself is `computeDiff` in core, shared by every binding — see
 * scripts/check-diff.ts for what counts as a change. This file only decides how
 * a row looks.
 *
 * Kind is never signalled by colour alone. A replaced value is struck through
 * and an absent one is a dash with a screen-reader label, so the diff survives
 * greyscale, low vision and a colour-blind reader — which is most of the point
 * of showing a before column at all.
 */

const AFTER_CLASS: Record<DiffKind, string> = {
  added: "zen-text-zen-success",
  removed: "zen-text-zen-muted-fg",
  changed: "zen-text-zen-foreground",
  unchanged: "zen-text-zen-muted-fg",
};

export interface DiffViewProps {
  /**
   * Either snapshot, in whatever shape your audit column actually holds:
   * an object, a JSON string, a bare array, plain prose, or empty for "there
   * was no before". Strings are parsed with `parse`; a string that is not JSON
   * is kept as the text it is rather than lost to a failed parse.
   *
   * Two objects are compared field by field. Anything else is shown whole,
   * side by side, because an array has no field names to put in the left
   * column and forcing one into a table would misrepresent it.
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
  format?: (value: unknown, key: string) => JSX.Element;
  /** Column headings. Defaults to "Field" / "Before" / "After". */
  headings?: { key?: string; before?: string; after?: string };
  /** `"compact"` tightens the rows for a Timeline slot or a popover. */
  density?: "default" | "compact";
  /** Shown when nothing changed — the common case in an audit log, not an error. */
  emptyMessage?: JSX.Element;
  class?: string;
}

const defaultFormat = (value: unknown): JSX.Element => {
  if (value === null) return <span class="zen-italic">null</span>;
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") {
    return String(value);
  }
  if (value instanceof Date) return value.toISOString();
  return JSON.stringify(value);
};

export const DiffView = (props: DiffViewProps) => {
  const parse = (raw: unknown) =>
    typeof raw === "string" && props.parse ? props.parse(raw) : parseSnapshot(raw);

  const before = createMemo(() => parse(props.before));
  const after = createMemo(() => parse(props.after));

  /* Field-by-field only when there are fields on both sides worth naming. A
     creation has no before, so the after alone decides. */
  const keyed = createMemo(() => {
    const b = before();
    const a = after();
    const sides = [b, a].filter((v) => v !== undefined);
    return sides.length > 0 && sides.every(isKeyed);
  });

  const rows = createMemo(() =>
    keyed()
      ? computeDiff(before() as Record<string, unknown> | undefined, after() as Record<string, unknown> | undefined, {
          keys: props.keys,
          labels: props.labels,
          changedOnly: props.changedOnly,
        })
      : [],
  );

  /** Both sides absent is genuinely nothing to show, whatever the shape. */
  const empty = () =>
    keyed() ? rows().length === 0 : before() === undefined && after() === undefined;

  const compact = () => props.density === "compact";
  const format = (value: unknown, key: string) =>
    props.format ? props.format(value, key) : defaultFormat(value);

  const cell = () => cn("zen-align-top", compact() ? "zen-px-2 zen-py-1" : "zen-px-3 zen-py-2");

  /*
   * A dash alone tells a screen reader nothing — it is punctuation, and some
   * readers skip it entirely. The word is what carries the meaning.
   *
   * A component rather than a const holding JSX: in Solid, JSX evaluates to a
   * real DOM node, so one shared const is one node that every cell would try to
   * adopt — and a node lives in exactly one parent, so all but the last cell
   * silently render empty. Measured: two of three placeholders vanished.
   */
  const Absent = () => (
    <>
      <span aria-hidden="true" class="zen-text-zen-muted-fg">
        —
      </span>
      <span class="zen-sr-only">not set</span>
    </>
  );

  /*
   * The whole-value view, for payloads that have no fields to line up: a bare
   * array, a line of prose, a number. Two panes rather than a table, and each
   * side says "not set" on its own when it is the side that is missing — a
   * creation and a deletion are different events and must not both read as
   * "no changes".
   */
  const Pane = (p: { heading: string; value: unknown; tone: string }) => (
    <div class="zen-flex zen-min-w-0 zen-flex-1 zen-flex-col zen-gap-1">
      <span class="zen-text-xs zen-font-semibold zen-uppercase zen-tracking-wide zen-text-zen-muted-fg">
        {p.heading}
      </span>
      <Show
        when={p.value !== undefined}
        fallback={
          <p class="zen-m-0 zen-text-sm">
            <span aria-hidden="true" class="zen-text-zen-muted-fg">
              —
            </span>
            <span class="zen-sr-only">not set</span>
          </p>
        }
      >
        <pre
          class={cn(
            "zen-m-0 zen-max-h-64 zen-overflow-auto zen-whitespace-pre-wrap zen-break-words zen-rounded-zen-sm zen-bg-zen-muted zen-p-2 zen-text-xs",
            p.tone,
          )}
        >
          {typeof p.value === "string" ? p.value : JSON.stringify(p.value, null, 2)}
        </pre>
      </Show>
    </div>
  );

  return (
    <Show
      when={!empty()}
      fallback={
        <p class="zen-m-0 zen-py-3 zen-text-sm zen-text-zen-muted-fg">
          {props.emptyMessage ?? "No changes"}
        </p>
      }
    >
      <Show when={keyed()} fallback={
        <div class={cn("zen-flex zen-w-full zen-flex-wrap zen-gap-4", props.class)}>
          <Pane heading={props.headings?.before ?? "Before"} value={before()} tone="zen-text-zen-muted-fg" />
          <Pane heading={props.headings?.after ?? "After"} value={after()} tone="zen-text-zen-foreground" />
        </div>
      }>
      {/* Its own scroller: a long value must not widen the page, and a diff
          dropped into a Timeline slot has no width of its own to give. */}
      <div
        class={cn(
          "zen-w-full zen-overflow-x-auto zen-rounded-zen-md zen-border zen-border-zen-border",
          props.class,
        )}
      >
        <table class="zen-w-full zen-border-collapse zen-text-start zen-text-sm">
          <thead>
            <tr class="zen-border-b zen-border-zen-border zen-bg-zen-muted">
              <th scope="col" class={cn(cell(), "zen-text-start zen-font-medium zen-text-zen-muted-fg")}>
                {props.headings?.key ?? "Field"}
              </th>
              <th scope="col" class={cn(cell(), "zen-text-start zen-font-medium zen-text-zen-muted-fg")}>
                {props.headings?.before ?? "Before"}
              </th>
              <th scope="col" class={cn(cell(), "zen-text-start zen-font-medium zen-text-zen-muted-fg")}>
                {props.headings?.after ?? "After"}
              </th>
            </tr>
          </thead>
          <tbody>
            <For each={rows()}>
              {(row) => (
                <tr class="zen-border-b zen-border-zen-border last:zen-border-b-0">
                  <th
                    scope="row"
                    class={cn(cell(), "zen-text-start zen-font-medium zen-text-zen-foreground")}
                  >
                    {row.label}
                  </th>
                  <td class={cn(cell(), "zen-text-zen-muted-fg")}>
                    <Show when={row.kind !== "added"} fallback={<Absent />}>
                      {/* Struck through rather than merely dimmed: the signal
                          has to survive greyscale. */}
                      <span class={row.kind === "unchanged" ? "" : "zen-line-through"}>
                        {format(row.before, row.key)}
                      </span>
                    </Show>
                  </td>
                  <td class={cn(cell(), AFTER_CLASS[row.kind])}>
                    <Show when={row.kind !== "removed"} fallback={<Absent />}>
                      {format(row.after, row.key)}
                    </Show>
                  </td>
                </tr>
              )}
            </For>
          </tbody>
        </table>
      </div>
      </Show>
    </Show>
  );
};
