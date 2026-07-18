import {
  type JSX,
  For,
  children,
  createEffect,
  createMemo,
  createSignal,
  on,
  onCleanup,
  onMount,
  splitProps,
} from "solid-js";
import { cn } from "../../lib/cn";

/**
 * FlexibleColumnLayout — Solid binding. Mirrors
 * packages/react/src/components/flexible-column-layout/: same props, same
 * layout names, same class strings, same breakpoints. See that file for why
 * Fiori's vocabulary is preserved and why sizing is container-relative.
 */

export type FlexibleColumnLayoutType =
  | "OneColumn"
  | "TwoColumnsBeginExpanded"
  | "TwoColumnsMidExpanded"
  | "ThreeColumnsMidExpanded"
  | "ThreeColumnsEndExpanded"
  | "MidColumnFullScreen"
  | "EndColumnFullScreen";

export type FlexibleColumnName = "start" | "mid" | "end";

export interface FlexibleColumnLayoutChangeDetail {
  /** The `layout` prop in effect — not rewritten by responsive collapse. */
  layout: FlexibleColumnLayoutType;
  /** How many columns the CONTAINER is wide enough for: 1, 2 or 3. */
  maxColumnsCount: 1 | 2 | 3;
  /** The columns actually rendered, in order. */
  visibleColumns: FlexibleColumnName[];
}

/**
 * `children` is omitted deliberately: the root is a flex row of columns, so a
 * stray child would render as a fourth, unsized column. The columns ARE the
 * content — pass them as `startColumn` / `midColumn` / `endColumn`.
 */
export type FlexibleColumnLayoutProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> & {
  layout?: FlexibleColumnLayoutType;
  /** Fires when the rendered result changes — layout prop, or container tier. */
  onLayoutChange?: (detail: FlexibleColumnLayoutChangeDetail) => void;
  startColumn?: JSX.Element;
  midColumn?: JSX.Element;
  endColumn?: JSX.Element;
};

/**
 * A column stops being usable below roughly this width, so the container is
 * given as many columns as it can pay for, capped at three.
 *
 * This is the one place the component deliberately departs from Fiori's
 * numbers. Fiori drops to two columns under 1024px and one under 600px — but
 * those are VIEWPORT breakpoints, a proxy for "phone / tablet / desktop".
 * Measured against a container they are a category error: a 1000px-wide pane on
 * a 1600px desktop is not a tablet, and three 333px columns in it are perfectly
 * usable. Worse, 1024 is unreachable in practice — a layout embedded in any
 * real page chrome (this repo's own demo gives it 1008px, and ~960px once the
 * sidebar is up) would never show three columns at all, at any window size.
 *
 * Deriving the tiers from a column's minimum width instead keeps the rule
 * container-relative, which is the whole point of measuring the container.
 * It also reproduces Fiori's phone boundary exactly: 3 × 300 = 900 for three
 * columns, 2 × 300 = 600 for two — and 600 is Fiori's own single-column
 * breakpoint.
 */
const MIN_COLUMN_WIDTH = 300;

const COLUMN_ORDER: FlexibleColumnName[] = ["start", "mid", "end"];

type Sizes = Partial<Record<FlexibleColumnName, string>>;

/** The column ratios when all three columns are affordable. */
const WIDE_SIZES: Record<FlexibleColumnLayoutType, Sizes> = {
  OneColumn: { start: "zen-basis-full" },
  TwoColumnsBeginExpanded: { start: "zen-basis-2/3", mid: "zen-basis-1/3" },
  TwoColumnsMidExpanded: { start: "zen-basis-1/3", mid: "zen-basis-2/3" },
  ThreeColumnsMidExpanded: { start: "zen-basis-1/4", mid: "zen-basis-1/2", end: "zen-basis-1/4" },
  ThreeColumnsEndExpanded: { start: "zen-basis-1/4", mid: "zen-basis-1/4", end: "zen-basis-1/2" },
  MidColumnFullScreen: { mid: "zen-basis-full" },
  EndColumnFullScreen: { end: "zen-basis-full" },
};

/**
 * Two-column tier. A three-column layout drops the START column and re-spreads
 * mid/end over the freed room, rather than scaling all three down to nothing.
 */
const MEDIUM_SIZES: Record<FlexibleColumnLayoutType, Sizes> = {
  OneColumn: { start: "zen-basis-full" },
  TwoColumnsBeginExpanded: { start: "zen-basis-2/3", mid: "zen-basis-1/3" },
  TwoColumnsMidExpanded: { start: "zen-basis-1/3", mid: "zen-basis-2/3" },
  ThreeColumnsMidExpanded: { mid: "zen-basis-2/3", end: "zen-basis-1/3" },
  ThreeColumnsEndExpanded: { mid: "zen-basis-1/3", end: "zen-basis-2/3" },
  MidColumnFullScreen: { mid: "zen-basis-full" },
  EndColumnFullScreen: { end: "zen-basis-full" },
};

function columnsForWidth(width: number): 1 | 2 | 3 {
  return Math.min(3, Math.max(1, Math.floor(width / MIN_COLUMN_WIDTH))) as 1 | 2 | 3;
}

/**
 * Which columns render, and how wide. `present` gates on content: a layout that
 * names a column the caller never filled must not reserve room for it, and — at
 * the one-column tier — must not resolve to an empty screen.
 */
function resolveColumns(
  layout: FlexibleColumnLayoutType,
  maxColumnsCount: 1 | 2 | 3,
  present: Record<FlexibleColumnName, boolean>,
): Array<{ name: FlexibleColumnName; basis: string }> {
  const sizes = maxColumnsCount === 2 ? MEDIUM_SIZES[layout] : WIDE_SIZES[layout];
  const columns = COLUMN_ORDER.filter((name) => sizes[name] && present[name]).map((name) => ({
    name,
    basis: sizes[name] as string,
  }));

  // One column: shows the most-recently-navigated one, which is the
  // last of the layout's own columns — start for OneColumn, mid for any
  // two-column layout, end for any three-column layout.
  if (maxColumnsCount === 1) {
    const last = columns[columns.length - 1];
    return last ? [{ name: last.name, basis: "zen-basis-full" }] : [];
  }
  return columns;
}

/**
 * `h-full` + `min-h-0` + `overflow-hidden`, and NOT `min-h-*`: min-height is a
 * floor, not a ceiling. A root that can grow past its parent means the columns'
 * `overflow-y: auto` never has anything to scroll — the content pushes the root
 * taller instead, and the page grows a second scrollbar.
 */
const ROOT_CLASS = "zen-flex zen-h-full zen-min-h-0 zen-w-full zen-overflow-hidden";

const COLUMN_CLASS =
  "zen-flex zen-h-full zen-min-h-0 zen-min-w-0 zen-shrink zen-grow-0 zen-flex-col " +
  "zen-overflow-y-auto zen-overflow-x-hidden zen-transition-all zen-duration-200 zen-ease-out";

export const FlexibleColumnLayout = (props: FlexibleColumnLayoutProps) => {
  const [local, rest] = splitProps(props, [
    "layout",
    "onLayoutChange",
    "startColumn",
    "midColumn",
    "endColumn",
    "class",
  ]);

  let containerRef: HTMLDivElement | undefined;

  // Starts at 3 so the first paint is the widest case rather than a single
  // column that snaps open — same reasoning as Toolbar's visibleCount.
  const [maxColumnsCount, setMaxColumnsCount] = createSignal<1 | 2 | 3>(3);

  const recompute = () => {
    if (!containerRef) return;
    const width = containerRef.offsetWidth;
    // A zero width means "not laid out" (a hidden tab, a display:none
    // ancestor), not "very narrow". Collapsing on it would leave the wrong
    // column showing when the container is revealed at full size.
    if (!width) return;
    setMaxColumnsCount(columnsForWidth(width));
  };

  onMount(() => {
    if (!containerRef || typeof ResizeObserver === "undefined") return;
    recompute();
    const ro = new ResizeObserver(() => recompute());
    ro.observe(containerRef);
    onCleanup(() => ro.disconnect());
  });

  // `children()` rather than reading the slot props directly: Solid compiles a
  // JSX prop into a GETTER, so every read builds a fresh DOM node. Reading a
  // slot once for the presence test and again to render it would mount a
  // different element than the one that was measured. The helper memoises the
  // resolved node, so both reads are the same node.
  const startContent = children(() => local.startColumn);
  const midContent = children(() => local.midColumn);
  const endContent = children(() => local.endColumn);

  const layout = () => local.layout ?? "OneColumn";

  const present = createMemo(() => ({
    start: startContent.toArray().length > 0,
    mid: midContent.toArray().length > 0,
    end: endContent.toArray().length > 0,
  }));

  const columns = createMemo(() => resolveColumns(layout(), maxColumnsCount(), present()));

  const detail = createMemo<FlexibleColumnLayoutChangeDetail>(() => ({
    layout: layout(),
    maxColumnsCount: maxColumnsCount(),
    visibleColumns: columns().map((c) => c.name),
  }));

  // `on(detail, ...)` so the event follows the rendered result, not the
  // caller's callback identity — an inline arrow that drives state would
  // otherwise re-fire itself forever.
  createEffect(on(detail, (d) => local.onLayoutChange?.(d)));

  const content: Record<FlexibleColumnName, () => JSX.Element> = {
    start: () => startContent(),
    mid: () => midContent(),
    end: () => endContent(),
  };

  return (
    <div
      ref={containerRef}
      data-layout={layout()}
      data-max-columns={maxColumnsCount()}
      class={cn(ROOT_CLASS, local.class)}
      {...rest}
    >
      <For each={COLUMN_ORDER.filter((name) => present()[name])}>
        {(name) => {
          const index = createMemo(() => columns().findIndex((c) => c.name === name));
          const visible = createMemo(() => index() > -1);
          return (
            <div
              data-column={name}
              data-visible={visible() ? "true" : "false"}
              class={cn(
                COLUMN_CLASS,
                // `zen-hidden` rather than unmounting: a hidden column keeps
                // its scroll position and its state for when navigation comes
                // back to it, and display:none takes it out of the
                // accessibility tree.
                visible() ? columns()[index()].basis : "zen-hidden",
                // Separator on every visible column but the first, so the
                // layout never opens or closes with a stray edge.
                visible() && index() > 0 ? "zen-border-l zen-border-zen-border" : null,
              )}
            >
              {content[name]()}
            </div>
          );
        }}
      </For>
    </div>
  );
};
