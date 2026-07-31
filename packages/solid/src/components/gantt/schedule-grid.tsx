import { type JSX, createMemo, createSignal, createEffect, on, onCleanup, For, Index, Show } from "solid-js";
import {
  ganttColumns,
  ganttColumnWidths,
  ganttFitHourStep,
  ganttFitUnit,
  ganttPaneColumns,
  ganttRange,
  ganttRangeColumns,
  ganttRangeLabel,
  ganttRowWindow,
  ganttSpanLabel,
  nowPct,
  shiftGanttAnchor,
  type GanttAnchoredView,
  type GanttCalendar,
  type GanttColumnUnit,
  type GanttConnector,
  type GanttView,
  type PlanningColumn,
  type PlanningRange,
} from "@algorisys/zen-ui-core";
import { cn } from "../../lib/cn";
import { Button } from "../button/button";
import { Icon } from "../icon/icon";

/**
 * ScheduleGrid — the chrome every schedule chart needs, and none of what any
 * particular one MEANS.
 *
 * The Solid port of the React binding's shared renderer, and a one-for-one
 * mirror of it: same props, same behaviour, same assertions
 * (`node scripts/check-schedule-dom.mjs solid`). It is internal — nothing here
 * is exported from the package index, so its shape can change without a major
 * version.
 *
 * The split is by whether a thing depends on what a row IS. It does not: the
 * axis and its six views, the frozen pane that sheds columns, row windowing,
 * the connector overlay, the treegrid keyboard model, the toolbar. What a
 * caller brings is a list of rows, a `render` per pane column, and a
 * `renderTrack` for whatever goes on the axis — one bar for a project task, a
 * sequence of operations for a work centre.
 *
 * WHAT CHANGED IN THE PORT, and it is worth knowing before touching it:
 *
 *  - React's `useLayoutEffect` had two jobs here, and only one of them exists
 *    in Solid. Attaching the scroll listener is `onMount` territory. The other
 *    was a re-measure on EVERY commit, because a vertical scrollbar appearing
 *    changes `clientWidth` without changing the border box a ResizeObserver
 *    watches — Solid has no commits, so that becomes an explicit effect on the
 *    row count, which is the thing that actually makes a scrollbar appear.
 *  - Everything React memoized to survive re-rendering is a plain function
 *    here. Solid does not re-render, so `createMemo` is for expensive
 *    recomputation only — the axis, the columns, the connector routes — and
 *    not for referential stability, which is not a problem it has.
 *  - Props are never destructured. A destructured prop is read once, outside
 *    any tracked scope, and then silently never updates again — the failure
 *    mode this binding's lint rule exists for.
 */

/** Pixel height of a row. Fixed, and the connector routes depend on it. */
export const ROW_PX = 36;
export const HEADER_PX = 44;
/** Indent per level of hierarchy, applied by the caller inside its first column. */
export const INDENT_PX = 14;

/**
 * NOMINAL column width per anchored view. One number cannot serve all five: a
 * week is 7 columns and can afford to be wide; a month is 31 and cannot, or
 * every plan opens scrolled halfway off its own axis.
 */
const COLUMN_PX: Record<GanttAnchoredView, number> = {
  day: 56,
  week: 128,
  month: 44,
  quarter: 72,
  year: 80,
};

/**
 * The narrowest each FIT unit's label survives at — "08:00", "31", "13", "Sep".
 * Below these the labels stop being labels and scrolling is the better failure.
 */
const FIT_MIN_COLUMN_PX: Record<GanttColumnUnit, number> = {
  hour: 40,
  day: 20,
  week: 26,
  month: 30,
};

/**
 * The narrowest each ANCHORED view survives at, so it can SHRINK toward its
 * floor rather than scroll. It never grows past COLUMN_PX, and that asymmetry
 * is the point: stretching a week view to the window would make "how long is
 * that bar" a question about the browser, while shrinking it is simply the
 * alternative to dragging the chart sideways to see Thursday.
 */
const MIN_COLUMN_PX: Record<GanttAnchoredView, number> = {
  day: 34,
  week: 44,
  month: 20,
  quarter: 38,
  year: 30,
};

/** A floor under what the pane will shed for. Below this it is a legend, not a chart. */
const MIN_AXIS_PX = 280;

/** Half-height of the connector arrowhead, in the axis's pixel space. */
const ARROW_PX = 5;

/** Matches `zen-max-h-[32rem]` on the scroller. Seeds the window before measuring. */
const SCROLLER_MAX_PX = 512;

/** Grid cells are focus targets, so they need a ring of their own — inset,
 *  because a cell is flush against its neighbours. */
const CELL_FOCUS_CLASS =
  "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-inset focus-visible:zen-ring-zen-ring";

const VIEW_LABEL: Record<GanttView, string> = {
  fit: "Fit",
  day: "Day",
  week: "Week",
  month: "Month",
  quarter: "Quarter",
  year: "Year",
};

/* Fit first: it is the default, and the one that answers "what does this plan
   look like" before you have decided which zoom to argue about. */
export const ALL_VIEWS: GanttView[] = ["fit", "day", "week", "month", "quarter", "year"];

/** The minimum the chrome needs to know about a row. */
export interface ScheduleRowShape {
  index: number;
  depth: number;
  hasChildren: boolean;
  expanded: boolean;
}

/** One column of the frozen pane. */
export interface ScheduleColumn<R> {
  key: string;
  label: string;
  width: number;
  /** Its place in the FULL column set, 1-based — not among the survivors. */
  colIndex: number;
  render: (row: R) => JSX.Element;
  ariaLabel?: (row: R) => string | undefined;
  class?: string;
  style?: (row: R) => JSX.CSSProperties | undefined;
}

export interface ScheduleMetrics {
  top: number;
  height: number;
  width: number;
}

export interface ScheduleAxisInput {
  view: GanttView;
  anchor: Date;
  /** The range when `view` is "fit", or null to fall back to the anchored month. */
  fitRange: PlanningRange | null;
  now: Date;
  calendar?: GanttCalendar;
  hourStep?: number;
  columnWidth?: number;
  paneColumns: readonly { key: string; width: number }[];
  /** The scroller's measured `clientWidth`, or 0 before it has been measured. */
  available: number;
}

export interface ScheduleAxis {
  range: () => PlanningRange;
  columns: () => PlanningColumn[];
  columnWidths: () => number[];
  axisWidth: () => number;
  paneWidth: () => number;
  paneKeys: () => string[];
  isFit: () => boolean;
  anchoredView: () => GanttAnchoredView;
  /** Milliseconds worth roughly one pixel — what a split-bar gap is judged against. */
  minGapMs: () => number;
}

/**
 * Resolve the axis and the pane together, in the one order that works.
 *
 * The chain has a real dependency in it and it is easy to get backwards: the
 * pane sheds against what the axis WANTS at its narrowest, and a fit axis then
 * spends whatever the pane left over. Doing it the other way round — pane first
 * at a fixed minimum — is the version that left a year axis at 1292px keeping
 * all four columns and scrolling anyway.
 *
 * Returns ACCESSORS rather than a snapshot object, so a change to the measured
 * width does not invalidate the columns.
 */
export function createScheduleAxis(input: () => ScheduleAxisInput): ScheduleAxis {
  const isFit = () => input().view === "fit";
  /* The one place the two view worlds meet. Every anchored function refuses
     `fit` at the TYPE level, so there is no path by which a fit view reaches
     `ganttRange` and silently gets a month. */
  const anchoredView = (): GanttAnchoredView =>
    isFit() ? "month" : (input().view as GanttAnchoredView);

  const fitUnit = createMemo(() => {
    const fit = input().fitRange;
    return fit ? ganttFitUnit(fit.end.getTime() - fit.start.getTime()) : null;
  });

  /* A fit hour axis picks its own step so 48 one-hour columns never happen. A
     stated `hourStep` still wins: it is the caller saying what resolution they
     schedule at. */
  const effectiveHourStep = createMemo(() => {
    const fit = input().fitRange;
    if (fitUnit() === "hour" && input().hourStep === undefined && fit) {
      return ganttFitHourStep(fit.end.getTime() - fit.start.getTime());
    }
    return input().hourStep;
  });

  const anchoredRange = createMemo(() => ganttRange(anchoredView(), input().anchor));
  const range = createMemo(() => input().fitRange ?? anchoredRange());

  const columns = createMemo(() => {
    const fit = input().fitRange;
    const unit = fitUnit();
    const options = { now: input().now, calendar: input().calendar, hourStep: effectiveHourStep() };
    return fit && unit
      ? ganttRangeColumns(fit, unit, options)
      : ganttColumns(anchoredView(), input().anchor, options);
  });

  /* Two numbers, not one, and the pane negotiates against the SMALLER. `floor`
     is the narrowest the axis survives at; `ceiling` is the widest it will
     take. Fit has no ceiling — it spends whatever is left. */
  const floorAxis = createMemo(() => {
    const width = input().columnWidth;
    if (width !== undefined) return columns().length * width;
    const unit = fitUnit();
    return unit
      ? columns().length * FIT_MIN_COLUMN_PX[unit]
      : columns().length * MIN_COLUMN_PX[anchoredView()];
  });
  const ceilingAxis = createMemo(() => {
    const width = input().columnWidth;
    if (width !== undefined) return columns().length * width;
    return fitUnit() ? Number.POSITIVE_INFINITY : columns().length * COLUMN_PX[anchoredView()];
  });

  const paneKeys = createMemo(() =>
    ganttPaneColumns(
      input().paneColumns.map((c) => c.key),
      Object.fromEntries(input().paneColumns.map((c) => [c.key, c.width])) as Record<string, number>,
      input().available,
      Math.max(MIN_AXIS_PX, floorAxis()),
    ),
  );
  const paneWidth = createMemo(() => {
    const widths = new Map(input().paneColumns.map((c) => [c.key, c.width]));
    return paneKeys().reduce((sum, key) => sum + (widths.get(key) ?? 0), 0);
  });

  /* UNMEASURED is not zero-width: with no measurement an anchored view takes
     its comfortable width and a fit view takes its floor. */
  const axisWidth = createMemo(() => {
    const available = input().available;
    const ceiling = ceilingAxis();
    if (available > 0) return Math.min(ceiling, Math.max(floorAxis(), available - paneWidth()));
    return Number.isFinite(ceiling) ? ceiling : floorAxis();
  });

  /* Per column, from its own duration — NOT axisWidth / columns.length. A year
     of 28-to-31-day months at one uniform width walks every bar off its
     gridline by up to three days, and looks entirely reasonable doing it. */
  const columnWidths = createMemo(() => ganttColumnWidths(columns(), range(), axisWidth()));

  const minGapMs = createMemo(() => {
    const width = axisWidth();
    return width > 0 ? (range().end.getTime() - range().start.getTime()) / width : 0;
  });

  return { range, columns, columnWidths, axisWidth, paneWidth, paneKeys, isFit, anchoredView, minGapMs };
}

/**
 * The scroller's measurements, and the ref that starts them.
 *
 * `height` is seeded with the scroller's own max height rather than 0: at 0 the
 * first paint mounts only the overscan and visibly fills in a frame later.
 * `width` is seeded at 0, meaning UNMEASURED — which the pane reads as "keep
 * every column" rather than as a zero-width container.
 */
export function createScrollerMetrics() {
  const [metrics, setMetrics] = createSignal<ScheduleMetrics>({
    top: 0,
    height: SCROLLER_MAX_PX,
    width: 0,
  });
  let element: HTMLDivElement | undefined;

  const measure = () => {
    const el = element;
    if (!el) return;
    setMetrics((prev) =>
      prev.top === el.scrollTop && prev.height === el.clientHeight && prev.width === el.clientWidth
        ? prev
        : { top: el.scrollTop, height: el.clientHeight, width: el.clientWidth },
    );
  };

  const ref = (node: HTMLDivElement) => {
    element = node;
    /* Coalesced into one frame. A wheel gesture fires scroll far faster than
       anything can respond to, and a read per event turns a smooth scroll into
       a queue of work that lands after the user has stopped. */
    let frame = 0;
    const onScroll = () => {
      if (frame === 0)
        frame = requestAnimationFrame(() => {
          frame = 0;
          measure();
        });
    };
    measure();
    node.addEventListener("scroll", onScroll, { passive: true });
    const observer = new ResizeObserver(onScroll);
    observer.observe(node);
    onCleanup(() => {
      if (frame !== 0) cancelAnimationFrame(frame);
      node.removeEventListener("scroll", onScroll);
      observer.disconnect();
    });
  };

  return { metrics, setMetrics, measure, ref, element: () => element };
}

export interface ScheduleGridProps<R extends ScheduleRowShape> {
  rows: R[];
  rowId: (row: R) => string;
  /**
   * The pane's columns, in PREFERENCE order: what is listed last is the first
   * to go when the container cannot hold both the pane and a usable axis.
   */
  columns: ScheduleColumn<R>[];
  /** How many columns the table has in total, including the timeline. */
  colCount: number;
  timelineColIndex: number;
  renderTrack: (row: R, axisWidth: number) => JSX.Element;
  /** Uniform height for every row. See ROW_PX for why it cannot vary between them. */
  rowHeight?: number;
  /**
   * A strip under the rows, aligned to the axis and stuck to the bottom.
   * Rendered OUTSIDE the `treegrid` element: a div that is not a `row` inside a
   * grid is invalid ARIA, and a fake row would be counted by `aria-rowcount`.
   */
  renderFooter?: (context: {
    columns: PlanningColumn[];
    columnWidths: number[];
    axisWidth: number;
    paneWidth: number;
  }) => JSX.Element;

  view: GanttView;
  anchor: Date;
  now: Date;
  connectors?: GanttConnector[];
  connectorAccent?: (connector: GanttConnector) => boolean;

  views?: GanttView[];
  hideToolbar?: boolean;
  onViewChange: (view: GanttView) => void;
  onDateChange: (date: Date) => void;

  onToggle: (row: R) => void;
  onActivate?: (row: R) => void;

  ariaLabel: string;
  class?: string;

  /* Owned by the caller, because the caller measures the scroller to resolve
     the axis and needs `range` and `axisWidth` in the same pass. */
  scrollerRef: (el: HTMLDivElement) => void;
  scroller: () => HTMLDivElement | undefined;
  axis: ScheduleAxis;
  metrics: () => ScheduleMetrics;
  setMetrics: (next: ScheduleMetrics | ((prev: ScheduleMetrics) => ScheduleMetrics)) => void;
}

export function ScheduleGrid<R extends ScheduleRowShape>(props: ScheduleGridProps<R>) {
  const rowHeight = () => props.rowHeight ?? ROW_PX;
  const marker = createMemo(() => nowPct(props.axis.range(), props.now));
  const bodyHeight = () => props.rows.length * rowHeight();

  const visibleColumns = createMemo(() =>
    props.axis
      .paneKeys()
      .map((key) => props.columns.find((c) => c.key === key))
      .filter((c): c is ScheduleColumn<R> => c !== undefined),
  );
  const cellCount = () => visibleColumns().length + 1;

  /* Which rows actually go in the DOM. Always on: a threshold would mean the
     windowed path is the one no demo and no check ever runs, and production is
     the first thing to try it. */
  const rowWindow = createMemo(() =>
    ganttRowWindow(props.rows.length, rowHeight(), props.metrics().top, props.metrics().height),
  );
  const visibleRows = createMemo(() => props.rows.slice(rowWindow().startIndex, rowWindow().endIndex));

  /* A vertical scrollbar appearing changes `clientWidth` without moving the
     border box a ResizeObserver watches, and the fit axis is sized from
     `clientWidth`. React re-measured on every commit; Solid has no commits, so
     this watches the thing that actually makes a scrollbar appear. */
  createEffect(
    on(
      () => props.rows.length,
      () => {
        const el = props.scroller();
        if (!el) return;
        props.setMetrics((prev) =>
          prev.width === el.clientWidth && prev.height === el.clientHeight
            ? prev
            : { ...prev, width: el.clientWidth, height: el.clientHeight },
        );
      },
      { defer: true },
    ),
  );

  /* ------------------------------------------------------------------ *
   * Keyboard: one tab stop, APG grid navigation inside.
   * ------------------------------------------------------------------ */
  const [active, setActive] = createSignal({ row: 0, col: 0 });
  const activeRow = () => Math.min(Math.max(active().row, 0), Math.max(props.rows.length - 1, 0));
  const activeCol = () => Math.min(Math.max(active().col, 0), cellCount() - 1);

  /* The tab stop follows the VIEWPORT when the active row has scrolled out of
     the window. Anchoring it to the active row would leave no cell with
     tabindex 0 at all — the row is not in the DOM — and Tab would skip the
     entire chart. */
  const tabRow = () =>
    Math.min(Math.max(activeRow(), rowWindow().startIndex), Math.max(rowWindow().endIndex - 1, 0));

  const [pendingFocus, setPendingFocus] = createSignal<{ row: number; col: number } | null>(null);
  /* Whether focus has ever been inside the chart, recorded from the event:
     focusing a cell changes no signal, so nothing else would notice. */
  let hadFocus = false;

  const focusCell = (row: number, col: number) => {
    setActive((prev) => (prev.row === row && prev.col === col ? prev : { row, col }));
  };

  const scrollRowIntoView = (rowIndex: number) => {
    const el = props.scroller();
    if (!el) return;
    /* The header is sticky and covers the top HEADER_PX of the viewport, so a
       row scrolled flush to the top is a row hidden behind the column titles. */
    const rowTop = HEADER_PX + rowIndex * rowHeight();
    const upper = rowTop - HEADER_PX;
    const lower = rowTop + rowHeight() - el.clientHeight;
    const next = Math.max(0, Math.min(Math.max(el.scrollTop, lower), upper));
    if (next === el.scrollTop) return;
    el.scrollTop = next;
    /* Pushed into the signal as well as onto the element: the row has to be in
       the window before the focus effect looks for it, and the scroll event's
       own rAF is a frame too late. */
    props.setMetrics((prev) => (prev.top === next ? prev : { ...prev, top: next }));
  };

  const moveTo = (row: number, col: number) => {
    setActive({ row, col });
    setPendingFocus({ row, col });
    scrollRowIntoView(row);
  };

  createEffect(() => {
    const pending = pendingFocus();
    const el = props.scroller();
    // Tracked so the effect re-runs when the window moves and the row mounts.
    rowWindow();
    if (!pending || !el) return;
    /* DEFERRED a microtask, and it does not work without it. Solid runs effects
       in creation order, and this one is declared before the JSX that renders
       the rows — so on the commit that scrolls a new band into view it fires
       BEFORE `<Index>` has written those rows to the DOM, finds nothing, and
       (unlike React, which gets another pass) never retries, because the window
       it depends on has already changed. A microtask lands after the render
       work of the same batch. */
    queueMicrotask(() => focusPending(el, pending));
  });

  const focusPending = (el: HTMLDivElement, pending: { row: number; col: number }) => {
    const cell = el.querySelector<HTMLElement>(`[data-gantt-cell="${pending.row}:${pending.col}"]`);
    // Still not mounted — stay pending, and the next window change will find it.
    if (!cell) return;
    setPendingFocus(null);
    hadFocus = true;
    /* preventScroll, then adjusted by hand. The browser's own scrolling would
       drag the timeline cell — the whole axis wide — fully into view, jumping
       the axis to a place nobody asked for. */
    cell.focus({ preventScroll: true });

    /* Sideways, from rects rather than offsets, so RTL needs no special case:
       a relative `scrollLeft` nudge in physical pixels means the same under
       either of the browsers' two RTL conventions. The BAR, not the cell — the
       cell spans the entire axis, so "bring it into view" is satisfied by any
       scroll position at all. */
    const bar = cell.querySelector<HTMLElement>("[data-gantt-bar]");
    if (!bar) return;
    const box = bar.getBoundingClientRect();
    const viewport = el.getBoundingClientRect();
    const rtl = getComputedStyle(el).direction === "rtl";
    const pane = props.axis.paneWidth();
    const minX = rtl ? viewport.left : viewport.left + pane;
    const maxX = rtl ? viewport.right - pane : viewport.right;
    if (box.left < minX) el.scrollLeft -= minX - box.left;
    else if (box.right > maxX) el.scrollLeft += Math.min(box.right - maxX, box.left - minX);
  };

  const onGridKeyDown = (event: KeyboardEvent) => {
    if (event.altKey || event.metaKey) return;
    const el = props.scroller();
    /* Arrow keys follow the VISUAL direction, which is what APG specifies and
       what a reader expects from the key with an arrow drawn on it. */
    const rtl = el ? getComputedStyle(el).direction === "rtl" : false;
    const forward = rtl ? "ArrowLeft" : "ArrowRight";
    const backward = rtl ? "ArrowRight" : "ArrowLeft";
    const page = Math.max(1, Math.floor((props.metrics().height - HEADER_PX) / rowHeight()));
    const last = props.rows.length - 1;
    const row = props.rows[activeRow()];

    let nextRow = activeRow();
    let nextCol = activeCol();

    switch (event.key) {
      case "ArrowDown":
        nextRow = Math.min(last, activeRow() + 1);
        break;
      case "ArrowUp":
        nextRow = Math.max(0, activeRow() - 1);
        break;
      case forward:
        /* On the first column, forward EXPANDS a closed parent rather than
           moving — the treegrid pattern, and the only way to open a subtree
           without a pointer. */
        if (activeCol() === 0 && row?.hasChildren && !row.expanded) {
          event.preventDefault();
          props.onToggle(row);
          return;
        }
        nextCol = Math.min(cellCount() - 1, activeCol() + 1);
        break;
      case backward:
        if (activeCol() === 0 && row?.hasChildren && row.expanded) {
          event.preventDefault();
          props.onToggle(row);
          return;
        }
        nextCol = Math.max(0, activeCol() - 1);
        break;
      case "Home":
        nextCol = 0;
        if (event.ctrlKey) nextRow = 0;
        break;
      case "End":
        nextCol = cellCount() - 1;
        if (event.ctrlKey) nextRow = last;
        break;
      case "PageDown":
        nextRow = Math.min(last, activeRow() + page);
        break;
      case "PageUp":
        nextRow = Math.max(0, activeRow() - page);
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        if (row) props.onActivate?.(row);
        return;
      default:
        return;
    }

    // Swallowed even at an edge, or ArrowDown on the last row scrolls the PAGE
    // while the chart appears to ignore it.
    event.preventDefault();
    if (nextRow === activeRow() && nextCol === activeCol()) return;
    moveTo(nextRow, nextCol);
  };

  /* Focus rescue. Scrolling a focused cell out of the window unmounts it and
     the browser drops focus to <body> — so the next Tab restarts from the top
     of the PAGE, stranding a keyboard user who was reading row 4,000. This
     puts focus on the scroller instead: still inside the chart, still scrolled
     where they left it, and Tab continues into whichever cell the roving
     tabindex has meanwhile moved to the visible band. */
  createEffect(
    on(
      () => [rowWindow().startIndex, rowWindow().endIndex],
      () => {
        const el = props.scroller();
        if (!el) return;
        if (pendingFocus()) return;
        if (el.contains(document.activeElement)) return;
        if (hadFocus && document.activeElement === document.body) {
          el.focus({ preventScroll: true });
          return;
        }
        hadFocus = false;
      },
      { defer: true },
    ),
  );

  return (
    <div class={cn("zen-flex zen-w-full zen-flex-col zen-gap-3", props.class)}>
      <Show when={!props.hideToolbar}>
        <div class="zen-flex zen-flex-wrap zen-items-center zen-gap-2">
          {/* GONE under fit, not disabled and not left live. A fit axis has no
              anchor to move, so Previous, Today and Next have nothing to
              change — and three buttons that visibly do nothing are read as a
              broken chart. The range label stays: it is the one thing that
              still says something, and it says it about the plan instead. */}
          <Show when={!props.axis.isFit()}>
            <Button
              variant="outline"
              size="sm"
              aria-label="Previous"
              onClick={() => props.onDateChange(shiftGanttAnchor(props.axis.anchoredView(), props.anchor, -1))}
            >
              {/* Logical, not physical: under RTL the axis runs the other way. */}
              <Icon name="chevron-left" size={14} class="rtl:zen-rotate-180" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => props.onDateChange(props.now)}>
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              aria-label="Next"
              onClick={() => props.onDateChange(shiftGanttAnchor(props.axis.anchoredView(), props.anchor, 1))}
            >
              <Icon name="chevron-right" size={14} class="rtl:zen-rotate-180" />
            </Button>
          </Show>

          <span
            /* "29 Jun – 31 Jul 2026" opens with a number, and bidi reorders a
               leading number to the far side of an RTL run — it renders as
               "Jun – 31 Jul 2026 29". `auto` rather than `ltr` because the
               month names come from `toLocaleString`: under an Arabic locale
               the label really is RTL. */
            dir="auto"
            class="zen-mx-1 zen-text-sm zen-font-medium zen-text-zen-foreground"
          >
            {props.axis.isFit()
              ? ganttSpanLabel(props.axis.range())
              : ganttRangeLabel(props.axis.anchoredView(), props.anchor)}
          </span>

          <div class="zen-ms-auto zen-flex zen-gap-1" role="group" aria-label="View">
            <For each={props.views ?? ALL_VIEWS}>
              {(v) => (
                <Button
                  variant={props.view === v ? "solid" : "outline"}
                  size="sm"
                  aria-pressed={props.view === v}
                  onClick={() => props.onViewChange(v)}
                >
                  {VIEW_LABEL[v]}
                </Button>
              )}
            </For>
          </div>
        </div>
      </Show>

      {/* ONE scroller. The frozen pane is sticky at the inline start and the
          header sticky at the top, so vertical scroll moves both panes and
          horizontal scroll moves only the axis — with no scroll listener to
          fall out of sync. */}
      <div
        ref={props.scrollerRef}
        /* Focusable so the focus rescue has somewhere to land, and so a
           keyboard user can scroll the chart without first tabbing to a cell. */
        tabindex={-1}
        onFocusIn={() => {
          hadFocus = true;
        }}
        class="zen-relative zen-max-h-[32rem] zen-overflow-auto zen-rounded-zen-md zen-border zen-border-zen-border focus-visible:zen-outline-none"
      >
        <div
          style={{ width: `${props.axis.paneWidth() + props.axis.axisWidth()}px` }}
          /* treegrid, not grid: the rows form a tree, and that is what makes
             left and right on the first column mean collapse and expand. */
          role="treegrid"
          /* The TRUE totals, not the windowed ones — without them a screen
             reader counts the DOM and announces "row 3 of 26" in a 10,000-row
             plan. +1 for the header row. `aria-colcount` does not shrink when
             the pane sheds a column. */
          aria-rowcount={props.rows.length + 1}
          aria-colcount={props.colCount}
          aria-label={props.ariaLabel}
          onKeyDown={onGridKeyDown}
        >
          <div
            role="row"
            aria-rowindex={1}
            class="zen-sticky zen-top-0 zen-z-30 zen-flex zen-border-b zen-border-zen-border zen-bg-zen-muted"
            style={{ height: `${HEADER_PX}px`, "box-sizing": "border-box" }}
          >
            <div
              class="zen-sticky zen-z-40 zen-flex zen-shrink-0 zen-items-center zen-border-e zen-border-zen-border zen-bg-zen-muted zen-text-xs zen-font-semibold zen-text-zen-muted-fg"
              style={{ width: `${props.axis.paneWidth()}px`, "inset-inline-start": "0" }}
            >
              <For each={visibleColumns()}>
                {(column) => (
                  <div
                    role="columnheader"
                    aria-colindex={column.colIndex}
                    class={cn("zen-truncate", column.class ?? "zen-px-2")}
                    style={{ width: `${column.width}px` }}
                  >
                    {column.label}
                  </div>
                )}
              </For>
            </div>

            <div
              role="columnheader"
              aria-colindex={props.timelineColIndex}
              aria-label="Timeline"
              class="zen-flex"
              style={{ width: `${props.axis.axisWidth()}px` }}
            >
              <For each={props.axis.columns()}>
                {(column, i) => (
                  <div
                    class={cn(
                      "zen-flex zen-shrink-0 zen-flex-col zen-items-center zen-justify-center zen-overflow-hidden zen-border-e zen-border-zen-border last:zen-border-e-0",
                      column.nonWorking && "zen-bg-zen-muted",
                      column.today && "zen-bg-zen-primary-soft",
                    )}
                    style={{ width: `${props.axis.columnWidths()[i()]}px` }}
                  >
                    <span class="zen-text-xs zen-font-medium zen-text-zen-foreground">{column.label}</span>
                    <Show when={column.sublabel}>
                      <span class="zen-text-[10px] zen-text-zen-muted-fg">{column.sublabel}</span>
                    </Show>
                  </div>
                )}
              </For>
            </div>
          </div>

          <div class="zen-relative" style={{ height: `${bodyHeight()}px` }}>
            {/* Spacers stand in for the rows that are not mounted, so the
                scrollbar measures the whole plan rather than the window.
                Spacers rather than a transform on purpose: a transformed
                ancestor makes `position: sticky` resolve against IT instead of
                the scroll container, and the frozen pane would come unstuck
                the moment the window moved. */}
            <Show when={rowWindow().paddingTop > 0}>
              <div aria-hidden="true" style={{ height: `${rowWindow().paddingTop}px` }} />
            </Show>
            {/* INDEX, not For, and this is the one real difference the port
                turned up. Solid's `<For>` keys by VALUE identity, and these row
                objects are derived — every collapse rebuilds all of them, so
                For tore down every row's DOM and rebuilt it. That destroys the
                focused cell, focus falls to <body>, and the next arrow key goes
                to the document instead of the grid: collapsing a phase worked
                and then expanding it again did nothing, because the keystroke
                never reached the chart.

                React did not have this problem because `key={rowId(row)}` gave
                it identity for free. `<Index>` keys by POSITION, which is also
                the honest model for a windowed list — slot i shows whichever
                row is at i — and it keeps the DOM node, so focus survives. */}
            <Index each={visibleRows()}>
              {(row) => (
                <ScheduleRow
                  row={row()}
                  columns={visibleColumns()}
                  axisColumns={props.axis.columns()}
                  columnWidths={props.axis.columnWidths()}
                  axisWidth={props.axis.axisWidth()}
                  paneWidth={props.axis.paneWidth()}
                  timelineColIndex={props.timelineColIndex}
                  renderTrack={props.renderTrack}
                  rowHeight={rowHeight()}
                  /* -1 on every row but one. The grid is a single tab stop, and
                     which cell holds it is the roving tabindex's whole job. */
                  tabCol={row().index === tabRow() ? activeCol() : -1}
                  onFocusCell={focusCell}
                />
              )}
            </Index>
            <Show when={rowWindow().paddingBottom > 0}>
              <div aria-hidden="true" style={{ height: `${rowWindow().paddingBottom}px` }} />
            </Show>

            <Show when={marker() !== null}>
              <div
                aria-hidden="true"
                class="zen-pointer-events-none zen-absolute zen-top-0 zen-z-10 zen-w-px zen-bg-zen-error"
                style={{
                  height: `${bodyHeight()}px`,
                  "inset-inline-start": `${props.axis.paneWidth() + (marker()! / 100) * props.axis.axisWidth()}px`,
                }}
              />
            </Show>

            {/* The connector overlay is deliberately NOT windowed: a link
                between two off-screen tasks still routes through the visible
                band, and culling it would blink connectors in and out as their
                endpoints scrolled away. It is pure maths and cheap next to DOM. */}
            <Show when={(props.connectors?.length ?? 0) > 0}>
              <svg
                aria-hidden="true"
                /* Mirrored under RTL rather than recomputed: the bars are placed
                   with logical inset properties, so the axis is already flipped
                   and the routes have to flip with it — arrowheads included. */
                class="zen-pointer-events-none zen-absolute zen-top-0 zen-z-10 rtl:-zen-scale-x-100"
                width={props.axis.axisWidth()}
                height={bodyHeight()}
                viewBox={`0 0 ${props.axis.axisWidth()} ${bodyHeight()}`}
                style={{ "inset-inline-start": `${props.axis.paneWidth()}px` }}
              >
                <For each={props.connectors}>
                  {(connector) => {
                    /* zen-stroke-* / zen-fill-* generate nothing under this
                       preset — the token has to be named directly. */
                    const accented = () => props.connectorAccent?.(connector) ?? false;
                    const tone = () =>
                      accented() ? "var(--zen-color-error)" : "var(--zen-color-muted-fg)";
                    return (
                      <g>
                        <path
                          d={connector.d}
                          fill="none"
                          stroke={tone()}
                          /* Thicker as well as red: colour alone is not a
                             signal on a chart that already uses red for delay. */
                          stroke-width={accented() ? 2.25 : 1.5}
                        />
                        <polygon
                          points={[
                            `${connector.arrow.x},${connector.arrow.y}`,
                            `${connector.arrow.x - connector.arrow.dir * ARROW_PX * 1.6},${connector.arrow.y - ARROW_PX}`,
                            `${connector.arrow.x - connector.arrow.dir * ARROW_PX * 1.6},${connector.arrow.y + ARROW_PX}`,
                          ].join(" ")}
                          fill={tone()}
                        />
                      </g>
                    );
                  }}
                </For>
              </svg>
            </Show>
          </div>
        </div>

        <Show when={props.renderFooter}>
          <div
            class="zen-sticky zen-bottom-0 zen-z-30 zen-flex zen-border-t zen-border-zen-border zen-bg-zen-muted"
            style={{ width: `${props.axis.paneWidth() + props.axis.axisWidth()}px` }}
          >
            {props.renderFooter!({
              columns: props.axis.columns(),
              columnWidths: props.axis.columnWidths(),
              axisWidth: props.axis.axisWidth(),
              paneWidth: props.axis.paneWidth(),
            })}
          </div>
        </Show>
      </div>
    </div>
  );
}

interface ScheduleRowProps<R extends ScheduleRowShape> {
  row: R;
  columns: ScheduleColumn<R>[];
  axisColumns: PlanningColumn[];
  columnWidths: number[];
  axisWidth: number;
  paneWidth: number;
  timelineColIndex: number;
  renderTrack: (row: R, axisWidth: number) => JSX.Element;
  rowHeight: number;
  /** Which cell of THIS row carries the grid's single tab stop, or -1. */
  tabCol: number;
  onFocusCell: (row: number, col: number) => void;
}

function ScheduleRow<R extends ScheduleRowShape>(props: ScheduleRowProps<R>) {
  const timelineCol = () => props.columns.length;
  return (
    <div
      role="row"
      /* The row's TRUE position in the plan, +1 for the header. A windowed grid
         that numbers rows from the DOM tells a screen-reader user they are on
         row 3 of 26 when they are on row 4,812 of 10,000. */
      aria-rowindex={props.row.index + 2}
      /* treegrid semantics, and the only place the tree is stated to a screen
         reader: the indent is a padding nobody can hear. */
      aria-level={props.row.depth + 1}
      aria-expanded={props.row.hasChildren ? props.row.expanded : undefined}
      class="zen-flex zen-border-b zen-border-zen-border last:zen-border-b-0"
      style={{ height: `${props.rowHeight}px`, "box-sizing": "border-box" }}
    >
      <div
        class="zen-sticky zen-z-20 zen-flex zen-shrink-0 zen-items-center zen-border-e zen-border-zen-border zen-bg-zen-background"
        style={{ width: `${props.paneWidth}px`, "inset-inline-start": "0" }}
      >
        <For each={props.columns}>
          {(column, col) => (
            <div
              role="gridcell"
              aria-colindex={column.colIndex}
              /* How the keyboard finds a cell that may not have been in the DOM
                 when the move was decided — see the focus effect. */
              data-gantt-cell={`${props.row.index}:${col()}`}
              tabindex={props.tabCol === col() ? 0 : -1}
              onFocusIn={() => props.onFocusCell(props.row.index, col())}
              aria-label={column.ariaLabel?.(props.row)}
              class={cn("zen-flex zen-items-center", column.class ?? "zen-px-2", CELL_FOCUS_CLASS)}
              style={{ width: `${column.width}px`, ...column.style?.(props.row) }}
            >
              {column.render(props.row)}
            </div>
          )}
        </For>
      </div>

      <div
        role="gridcell"
        aria-colindex={props.timelineColIndex}
        data-gantt-cell={`${props.row.index}:${timelineCol()}`}
        tabindex={props.tabCol === timelineCol() ? 0 : -1}
        onFocusIn={() => props.onFocusCell(props.row.index, timelineCol())}
        class={cn("zen-relative zen-shrink-0", CELL_FOCUS_CLASS)}
        style={{ width: `${props.axisWidth}px` }}
      >
        {/* The column rules as a background layer rather than as parents of the
            bar: a bar spanning four days cannot live inside one day's box. */}
        <div aria-hidden="true" class="zen-absolute zen-inset-0 zen-flex">
          <For each={props.axisColumns}>
            {(column, i) => (
              <div
                class={cn(
                  "zen-shrink-0 zen-border-e zen-border-zen-border last:zen-border-e-0",
                  column.nonWorking && "zen-bg-zen-muted/40",
                  column.today && "zen-bg-zen-primary-soft/40",
                )}
                style={{ width: `${props.columnWidths[i()]}px` }}
              />
            )}
          </For>
        </div>

        {props.renderTrack(props.row, props.axisWidth)}
      </div>
    </div>
  );
}
