import { cn } from "../../lib/cn";
import {
  applyProps,
  Disposer,
  toNodes,
  type BaseProps,
  type Child,
  type ZenComponent,
} from "../../lib/component";

/**
 * FlexibleColumnLayout — 1–3 columns for the master-detail pattern
 * (list → detail → detail), with responsive collapse rules.
 *
 * The vanilla port of the React reference. Same public API: the layout NAMES are
 * SAP's verbatim (the layout state machine is what apps drive), the component is
 * CONTROLLED (it never changes `layout` itself), and collapse is measured on the
 * CONTAINER via a ResizeObserver rather than on the viewport — the same layout
 * inside a split pane, a preview frame or a builder canvas collapses on ITS width,
 * not the window's.
 *
 *   const fcl = FlexibleColumnLayout({
 *     layout: "TwoColumnsMidExpanded",
 *     onLayoutChange: (d) => console.log(d.visibleColumns),
 *     startColumn: OrderList().el,
 *     midColumn: OrderDetail().el,
 *     endColumn: LineItemDetail().el,
 *   });
 *   document.body.append(fcl.el);
 *   fcl.update({ layout: "ThreeColumnsEndExpanded" });
 *
 * Responsive collapse changes which columns are *rendered*, not which layout is
 * requested — so widening the container restores the full layout without the app
 * having to remember what it asked for. `onLayoutChange` reports what actually got
 * rendered; it is a notification, not a value to echo back into `layout`.
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
  /**
   * The `layout` prop in effect. Deliberately NOT rewritten by responsive
   * collapse — same as Fiori, whose `layoutChange` reports the requested layout
   * alongside the visibility it actually resolved to.
   */
  layout: FlexibleColumnLayoutType;
  /** How many columns the CONTAINER is wide enough for: 1, 2 or 3. */
  maxColumnsCount: 1 | 2 | 3;
  /** The columns actually rendered, in order. */
  visibleColumns: FlexibleColumnName[];
}

/**
 * `children` is omitted deliberately: the root is a flex row of columns, so a stray
 * child would render as a fourth, unsized column. The columns ARE the content —
 * pass them as `startColumn` / `midColumn` / `endColumn`.
 */
export interface FlexibleColumnLayoutProps extends Omit<BaseProps, "children"> {
  layout?: FlexibleColumnLayoutType;
  /** Fires when the rendered result changes — layout prop, or container tier. */
  onLayoutChange?: (detail: FlexibleColumnLayoutChangeDetail) => void;
  startColumn?: Child;
  midColumn?: Child;
  endColumn?: Child;
}

/**
 * A column stops being usable below roughly this width, so the container is given
 * as many columns as it can pay for, capped at three. Deriving the tiers from a
 * column's minimum width keeps the rule container-relative (3 × 300 = 900 for three
 * columns, 2 × 300 = 600 for two — 600 being Fiori's own single-column boundary).
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
 * mid/end over the freed room — 25/50/25 squeezed into 700px would give three
 * unusable 230px columns, so it sheds the least-recently-navigated one instead of
 * scaling everything down.
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
 * names a column the caller never filled must not reserve room for it, and — at the
 * one-column tier — must not resolve to an empty screen.
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

  // One column: shows the most-recently-navigated one, which is the last of the
  // layout's own columns — start for OneColumn, mid for any two-column layout, end
  // for any three-column layout.
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
 * taller instead, and the page grows a second scrollbar. The layout must be pinned
 * to the parent for the columns to be the things that scroll.
 */
const ROOT_CLASS = "zen-flex zen-h-full zen-min-h-0 zen-w-full zen-overflow-hidden";

const COLUMN_CLASS =
  "zen-flex zen-h-full zen-min-h-0 zen-min-w-0 zen-shrink zen-grow-0 zen-flex-col " +
  "zen-overflow-y-auto zen-overflow-x-hidden zen-transition-all zen-duration-200 zen-ease-out";

export function FlexibleColumnLayout(
  props: FlexibleColumnLayoutProps = {},
): ZenComponent<FlexibleColumnLayoutProps> {
  let current: FlexibleColumnLayoutProps = { ...props };
  const el = document.createElement("div");
  const disposer = new Disposer();
  let removeProps: (() => void) | undefined;

  // Starts at 3 so the first paint is the widest case rather than a single column
  // that snaps open — same reasoning as Toolbar's visibleCount. The ResizeObserver
  // corrects it to the measured width before the caller's onLayoutChange fires.
  let maxColumnsCount: 1 | 2 | 3 = 3;

  // Wrappers and their last-assigned content are kept across renders: a hidden
  // column keeps its scroll position and DOM state for when navigation returns to
  // it, so content is only re-written when the caller actually swaps the column.
  const wrappers: Partial<Record<FlexibleColumnName, HTMLElement>> = {};
  const contentSet = new Map<FlexibleColumnName, Child>();

  // The last detail dispatched, so an unchanged result never re-fires — this is
  // where React held the callback in a ref to break the onLayoutChange → setState →
  // render loop. Here there is no render loop; deduping is all that is needed.
  let lastDetailKey: string | null = null;

  const contentFor = (name: FlexibleColumnName): Child =>
    name === "start" ? current.startColumn : name === "mid" ? current.midColumn : current.endColumn;

  const presentMap = (): Record<FlexibleColumnName, boolean> => ({
    start: current.startColumn != null,
    mid: current.midColumn != null,
    end: current.endColumn != null,
  });

  const currentDetail = (): FlexibleColumnLayoutChangeDetail => {
    const layout = current.layout ?? "OneColumn";
    const columns = resolveColumns(layout, maxColumnsCount, presentMap());
    return { layout, maxColumnsCount, visibleColumns: columns.map((c) => c.name) };
  };

  const fireIfChanged = () => {
    const detail = currentDetail();
    const key = `${detail.layout}|${detail.maxColumnsCount}|${detail.visibleColumns.join(",")}`;
    if (key === lastDetailKey) return;
    lastDetailKey = key;
    current.onLayoutChange?.(detail);
  };

  const render = (fire = true) => {
    const layout = current.layout ?? "OneColumn";
    const present = presentMap();
    const columns = resolveColumns(layout, maxColumnsCount, present);

    el.setAttribute("data-layout", layout);
    el.setAttribute("data-max-columns", String(maxColumnsCount));
    el.className = cn(ROOT_CLASS, current.class);

    for (const name of COLUMN_ORDER) {
      if (!present[name]) {
        wrappers[name]?.remove();
        delete wrappers[name];
        contentSet.delete(name);
        continue;
      }

      let w = wrappers[name];
      if (!w) {
        w = document.createElement("div");
        w.setAttribute("data-column", name);
        wrappers[name] = w;
      }

      // Only rewrite children when the caller actually swapped the column, so a
      // visibility toggle preserves the column's scroll position and state.
      const content = contentFor(name);
      if (contentSet.get(name) !== content) {
        w.replaceChildren(...toNodes(content));
        contentSet.set(name, content);
      }

      const index = columns.findIndex((c) => c.name === name);
      const visible = index > -1;
      w.setAttribute("data-visible", visible ? "true" : "false");
      w.className = cn(
        COLUMN_CLASS,
        // `zen-hidden` rather than unmounting: a hidden column keeps its scroll
        // position and its state, and display:none takes it out of the a11y tree.
        visible ? columns[index].basis : "zen-hidden",
        // Separator on every visible column but the first, so the layout never
        // opens or closes with a stray edge.
        visible && index > 0 ? "zen-border-l zen-border-zen-border" : null,
      );
    }

    // Keep the DOM in start → mid → end order, moving a wrapper only when it is out
    // of place. insertBefore on a connected node reorders without detaching it, so
    // this never resets a column's scroll position.
    let prev: ChildNode | null = null;
    for (const name of COLUMN_ORDER) {
      const w = wrappers[name];
      if (!w) continue;
      const anchor: ChildNode | null = prev ? prev.nextSibling : el.firstChild;
      if (anchor !== w) el.insertBefore(w, anchor);
      prev = w;
    }

    // Forward everything the component does not interpret (id, style, data-*,
    // aria-*, on*). Re-applied each render, so the previous listener set is dropped
    // first — otherwise update() would double them.
    const {
      layout: _layout,
      onLayoutChange: _onLayoutChange,
      startColumn: _startColumn,
      midColumn: _midColumn,
      endColumn: _endColumn,
      class: _class,
      ...rest
    } = current;
    removeProps?.();
    removeProps = applyProps(el, rest as Record<string, unknown>);

    if (fire) fireIfChanged();
  };

  const recompute = () => {
    // A zero width means "not laid out" (a hidden tab, a display:none ancestor),
    // not "very narrow". Collapsing on it would leave the wrong column showing when
    // the container is revealed at full size.
    const width = el.offsetWidth;
    if (!width) return;
    const next = columnsForWidth(width);
    if (next !== maxColumnsCount) {
      maxColumnsCount = next;
      render();
    } else {
      // Tier unchanged, but the FIRST measurement still owes the caller its event.
      fireIfChanged();
    }
  };

  // Initial paint WITHOUT firing: the caller should see the measured tier, not the
  // provisional 3. The ResizeObserver's first callback delivers that event.
  render(false);
  disposer.add(() => removeProps?.());

  if (typeof ResizeObserver !== "undefined") {
    const ro = new ResizeObserver(recompute);
    ro.observe(el);
    disposer.add(() => ro.disconnect());
  } else {
    // No ResizeObserver: keep the widest tier and report it once.
    fireIfChanged();
  }

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
