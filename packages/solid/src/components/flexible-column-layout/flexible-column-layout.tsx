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
import {
  FLEXIBLE_COLUMN_ORDER,
  flexibleColumnsForWidth,
  resolveFlexibleColumns,
  type FlexibleColumnShare,
} from "@algorisys/zen-ui-core/flexible-column-layout";

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

// The column arithmetic (tiers, ratios, re-spreading an absent column's room)
// is core's, shared by every binding and pinned by
// check:flexible-column-layout. The classes stay here: UnoCSS generates only
// the classes it finds in this package's source.
const BASIS_CLASS: Record<FlexibleColumnShare, string> = {
  full: "zen-basis-full",
  "2/3": "zen-basis-2/3",
  "1/2": "zen-basis-1/2",
  "1/3": "zen-basis-1/3",
  "1/4": "zen-basis-1/4",
};

const COLUMN_ORDER = FLEXIBLE_COLUMN_ORDER;
const columnsForWidth = flexibleColumnsForWidth;

function resolveColumns(
  layout: FlexibleColumnLayoutType,
  maxColumnsCount: 1 | 2 | 3,
  present: Record<FlexibleColumnName, boolean>,
): Array<{ name: FlexibleColumnName; basis: string }> {
  return resolveFlexibleColumns(layout, maxColumnsCount, present).map((c) => ({ name: c.name, basis: BASIS_CLASS[c.share] }));
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
