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
import { type AnyZenComponent } from "../../lib/component";

/**
 * ScheduleGrid — the chrome every schedule chart needs, and none of what any
 * particular one MEANS.
 *
 * The no-framework port of the shared renderer behind `Gantt` and
 * `ProductionSchedule`, mirroring the React and Solid bindings and verified
 * against them: `node scripts/check-schedule-dom.mjs vanilla` runs the same
 * assertions, and `check-schedule-parity.mjs vanilla` compares the rendered
 * charts against React's. Internal — not exported from the package index.
 *
 * WHAT IS GENUINELY DIFFERENT HERE, because there is no framework to hide it:
 *
 *  - **There is no re-render.** React and Solid answer "the scroll position
 *    changed" by recomputing and letting the renderer work out the difference.
 *    Here the difference IS the code, so the chrome is built once and only the
 *    ROW BAND is rebuilt when the window moves. Rebuilding everything on scroll
 *    would throw away the scroll position it was reacting to, and the focused
 *    cell with it.
 *  - **The scroller node outlives an update.** `update()` swaps the grid's
 *    contents, not the scroller, and saves and restores `scrollTop` around the
 *    swap — a browser clamps it the moment the content is briefly shorter.
 *  - **Nothing is deferred.** Solid needed a microtask before focusing a row it
 *    had just scrolled into view, because its effects run before the rows are
 *    written. Here the write has already happened by the time the next line
 *    runs, which makes this the simplest of the three.
 *  - **Handles and listeners are owned explicitly.** A Button or an Icon holds
 *    real listeners on nodes this file created and there is no unmount to take
 *    them away, so each render destroys the previous render's handles first.
 */

/** Pixel height of a row. Fixed, and the connector routes depend on it. */
export const ROW_PX = 36;
export const HEADER_PX = 44;
/** Indent per level of hierarchy, applied by the caller inside its first column. */
export const INDENT_PX = 14;

/** NOMINAL column width per anchored view. One number cannot serve all five. */
const COLUMN_PX: Record<GanttAnchoredView, number> = {
  day: 56,
  week: 128,
  month: 44,
  quarter: 72,
  year: 80,
};

/** The narrowest each FIT unit's label survives at — "08:00", "31", "13", "Sep". */
const FIT_MIN_COLUMN_PX: Record<GanttColumnUnit, number> = {
  hour: 40,
  day: 20,
  week: 26,
  month: 30,
};

/**
 * The narrowest each ANCHORED view survives at, so it can SHRINK toward its
 * floor rather than scroll. It never grows past COLUMN_PX: stretching a week
 * view to the window would make "how long is that bar" a question about the
 * browser, while shrinking it is simply the alternative to dragging sideways.
 */
const MIN_COLUMN_PX: Record<GanttAnchoredView, number> = {
  day: 34,
  week: 44,
  month: 20,
  quarter: 38,
  year: 30,
};

/** A floor under what the pane will shed for. Below this it is a legend. */
const MIN_AXIS_PX = 280;
/** Half-height of the connector arrowhead, in the axis's pixel space. */
const ARROW_PX = 5;
/** Matches `zen-max-h-[32rem]` on the scroller. Seeds the window before measuring. */
const SCROLLER_MAX_PX = 512;

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
  /** Nodes for this cell. Components are kept and destroyed with the render. */
  render: (row: R) => Array<Node | AnyZenComponent>;
  ariaLabel?: (row: R) => string | undefined;
  class?: string;
  /** Inline style pairs, e.g. `[["padding-inline-start", "22px"]]`. */
  style?: (row: R) => Array<[string, string]> | undefined;
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
  range: PlanningRange;
  columns: PlanningColumn[];
  columnWidths: number[];
  axisWidth: number;
  paneWidth: number;
  paneKeys: string[];
  isFit: boolean;
  anchoredView: GanttAnchoredView;
  /** Milliseconds worth roughly one pixel — what a split-bar gap is judged against. */
  minGapMs: number;
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
 * A plain function here rather than the other bindings' accessor bundle: with
 * no reactivity there is nothing to be fine-grained about, and the whole thing
 * is recomputed on the render that needed it.
 */
export function resolveScheduleAxis(input: ScheduleAxisInput): ScheduleAxis {
  const isFit = input.view === "fit";
  /* The one place the two view worlds meet. Every anchored function refuses
     `fit` at the TYPE level, so there is no path by which a fit view reaches
     `ganttRange` and silently gets a month — the trap `planningRange` still has,
     and the one this binding actually fell into for quarter and year. */
  const anchoredView: GanttAnchoredView = isFit ? "month" : (input.view as GanttAnchoredView);

  const fitUnit = input.fitRange
    ? ganttFitUnit(input.fitRange.end.getTime() - input.fitRange.start.getTime())
    : null;

  /* A fit hour axis picks its own step so 48 one-hour columns never happen. A
     stated `hourStep` still wins: it is the caller saying what resolution they
     schedule at. */
  const hourStep =
    fitUnit === "hour" && input.hourStep === undefined && input.fitRange
      ? ganttFitHourStep(input.fitRange.end.getTime() - input.fitRange.start.getTime())
      : input.hourStep;

  const range = input.fitRange ?? ganttRange(anchoredView, input.anchor);
  const options = { now: input.now, calendar: input.calendar, hourStep };
  const columns =
    input.fitRange && fitUnit
      ? ganttRangeColumns(input.fitRange, fitUnit, options)
      : ganttColumns(anchoredView, input.anchor, options);

  /* Two numbers, not one, and the pane negotiates against the SMALLER. */
  const floorAxis =
    input.columnWidth !== undefined
      ? columns.length * input.columnWidth
      : fitUnit
        ? columns.length * FIT_MIN_COLUMN_PX[fitUnit]
        : columns.length * MIN_COLUMN_PX[anchoredView];
  const ceilingAxis =
    input.columnWidth !== undefined
      ? columns.length * input.columnWidth
      : fitUnit
        ? Number.POSITIVE_INFINITY
        : columns.length * COLUMN_PX[anchoredView];

  const widths: Record<string, number> = {};
  for (const column of input.paneColumns) widths[column.key] = column.width;
  const paneKeys = ganttPaneColumns(
    input.paneColumns.map((c) => c.key),
    widths,
    input.available,
    Math.max(MIN_AXIS_PX, floorAxis),
  );
  const paneWidth = paneKeys.reduce((sum, key) => sum + (widths[key] ?? 0), 0);

  /* UNMEASURED is not zero-width: with no measurement an anchored view takes
     its comfortable width and a fit view takes its floor. */
  const axisWidth =
    input.available > 0
      ? Math.min(ceilingAxis, Math.max(floorAxis, input.available - paneWidth))
      : Number.isFinite(ceilingAxis)
        ? ceilingAxis
        : floorAxis;

  /* Per column, from its own duration — NOT axisWidth / columns.length. A year
     of 28-to-31-day months at one uniform width walks every bar off its
     gridline by up to three days, and looks entirely reasonable doing it. */
  const columnWidths = ganttColumnWidths(columns, range, axisWidth);
  const minGapMs = axisWidth > 0 ? (range.end.getTime() - range.start.getTime()) / axisWidth : 0;

  return { range, columns, columnWidths, axisWidth, paneWidth, paneKeys, isFit, anchoredView, minGapMs };
}

export interface ScheduleGridOptions<R extends ScheduleRowShape> {
  rows: R[];
  rowId: (row: R) => string;
  columns: ScheduleColumn<R>[];
  /** How many columns the table has in total, including the timeline. */
  colCount: number;
  timelineColIndex: number;
  renderTrack: (row: R, axisWidth: number) => Array<Node | AnyZenComponent>;
  /** Uniform height for every row. See ROW_PX for why it cannot vary between them. */
  rowHeight?: number;
  /**
   * A strip under the rows, aligned to the axis and stuck to the bottom.
   * Rendered OUTSIDE the `treegrid` element: a div that is not a `row` inside a
   * grid is invalid ARIA, and a fake row would be counted by `aria-rowcount`.
   */
  renderFooter?: (context: ScheduleAxis) => Array<Node | AnyZenComponent>;

  axis: ScheduleAxis;
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

  /**
   * The scroller's measurements changed, so the caller must resolve the axis
   * again and `update()`.
   *
   * The other bindings do this with a signal; here it is a callback, and it is
   * the same loop: measure, recompute, redraw. It only fires when a number
   * actually moved, which is what stops the loop being one.
   */
  onMetrics?: (metrics: ScheduleMetrics) => void;

  ariaLabel: string;
  class?: string;
}

export interface ScheduleGridHandle<R extends ScheduleRowShape> {
  readonly el: HTMLElement;
  update(next: Partial<ScheduleGridOptions<R>>): void;
  /** The last measured scroller box, for the caller's axis input. */
  metrics(): ScheduleMetrics;
  destroy(): void;
}

const el = <K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[K] => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};

const isComponent = (v: Node | AnyZenComponent): v is AnyZenComponent =>
  typeof v === "object" && v !== null && "el" in v;

export function ScheduleGrid<R extends ScheduleRowShape>(
  options: ScheduleGridOptions<R>,
): ScheduleGridHandle<R> {
  let current: ScheduleGridOptions<R> = { ...options };

  const root = el("div");
  const toolbarSlot = el("div");
  /* Built ONCE and never replaced. Everything else is torn down and rebuilt on
     update, but this node holds the scroll position, and replacing it would
     throw away the thing most updates are a reaction to. */
  const scroller = el(
    "div",
    "zen-relative zen-max-h-[32rem] zen-overflow-auto zen-rounded-zen-md zen-border zen-border-zen-border focus-visible:zen-outline-none",
  );
  scroller.tabIndex = -1;
  root.append(toolbarSlot, scroller);

  let metrics: ScheduleMetrics = { top: 0, height: SCROLLER_MAX_PX, width: 0 };

  /* Handles built by the CURRENT render, destroyed before the next one: a
     Button or an Icon holds real listeners on nodes this file created, and
     there is no unmount here to take them away. */
  let owned: AnyZenComponent[] = [];
  let rowOwned: AnyZenComponent[] = [];
  let cleanups: Array<() => void> = [];
  const keep = <T extends AnyZenComponent>(comp: T): T => {
    owned.push(comp);
    return comp;
  };
  const on = (node: HTMLElement, type: string, handler: EventListener) => {
    node.addEventListener(type, handler);
    cleanups.push(() => node.removeEventListener(type, handler));
  };

  const rowHeight = () => current.rowHeight ?? ROW_PX;
  const cellCount = () => visibleColumns().length + 1;
  const visibleColumns = (): ScheduleColumn<R>[] =>
    current.axis.paneKeys
      .map((key) => current.columns.find((c) => c.key === key))
      .filter((c): c is ScheduleColumn<R> => c !== undefined);

  /* ---- keyboard state: one tab stop, roving tabindex ---- */
  let active = { row: 0, col: 0 };
  const activeRow = () => Math.min(Math.max(active.row, 0), Math.max(current.rows.length - 1, 0));
  const activeCol = () => Math.min(Math.max(active.col, 0), cellCount() - 1);
  let hadFocus = false;

  const windowOf = () =>
    ganttRowWindow(current.rows.length, rowHeight(), metrics.top, metrics.height);

  /* ---- the parts that persist across a row-band rebuild ---- */
  let gridEl: HTMLElement | null = null;
  let bodyEl: HTMLElement | null = null;
  let padTop: HTMLElement | null = null;
  let padBottom: HTMLElement | null = null;
  let rowsHost: HTMLElement | null = null;

  const attach = (parent: HTMLElement, parts: Array<Node | AnyZenComponent>, into: AnyZenComponent[]) => {
    for (const part of parts) {
      if (isComponent(part)) {
        into.push(part);
        parent.append(part.el);
      } else {
        parent.append(part);
      }
    }
  };

  function buildRow(row: R): HTMLElement {
    const win = windowOf();
    const tabRow = Math.min(Math.max(activeRow(), win.startIndex), Math.max(win.endIndex - 1, 0));
    const tabCol = row.index === tabRow ? activeCol() : -1;
    const columns = visibleColumns();

    const node = el("div", "zen-flex zen-border-b zen-border-zen-border last:zen-border-b-0");
    node.setAttribute("role", "row");
    /* The row's TRUE position in the plan, +1 for the header. A windowed grid
       that numbers rows from the DOM tells a screen-reader user they are on row
       3 of 26 when they are on row 4,812 of 10,000. */
    node.setAttribute("aria-rowindex", String(row.index + 2));
    /* treegrid semantics, and the only place the tree is stated to a screen
       reader: the indent is a padding nobody can hear. */
    node.setAttribute("aria-level", String(row.depth + 1));
    if (row.hasChildren) node.setAttribute("aria-expanded", String(row.expanded));
    node.style.height = `${rowHeight()}px`;
    node.style.boxSizing = "border-box";

    const pane = el(
      "div",
      "zen-sticky zen-z-20 zen-flex zen-shrink-0 zen-items-center zen-border-e zen-border-zen-border zen-bg-zen-background",
    );
    pane.style.width = `${current.axis.paneWidth}px`;
    pane.style.insetInlineStart = "0";

    columns.forEach((column, col) => {
      const cell = el("div", cn("zen-flex zen-items-center", column.class ?? "zen-px-2", CELL_FOCUS_CLASS));
      cell.setAttribute("role", "gridcell");
      cell.setAttribute("aria-colindex", String(column.colIndex));
      /* How the keyboard finds a cell that may not have been in the DOM when
         the move was decided — see `focusCell`. */
      cell.setAttribute("data-gantt-cell", `${row.index}:${col}`);
      cell.tabIndex = tabCol === col ? 0 : -1;
      const label = column.ariaLabel?.(row);
      if (label) cell.setAttribute("aria-label", label);
      cell.style.width = `${column.width}px`;
      for (const [prop, value] of column.style?.(row) ?? []) cell.style.setProperty(prop, value);
      on(cell, "focusin", () => {
        active = { row: row.index, col };
      });
      attach(cell, column.render(row), rowOwned);
      pane.append(cell);
    });

    const track = el("div", cn("zen-relative zen-shrink-0", CELL_FOCUS_CLASS));
    track.setAttribute("role", "gridcell");
    track.setAttribute("aria-colindex", String(current.timelineColIndex));
    track.setAttribute("data-gantt-cell", `${row.index}:${columns.length}`);
    track.tabIndex = tabCol === columns.length ? 0 : -1;
    track.style.width = `${current.axis.axisWidth}px`;
    on(track, "focusin", () => {
      active = { row: row.index, col: columns.length };
    });

    /* The column rules as a background layer rather than as parents of the bar:
       a bar spanning four days cannot live inside one day's box. */
    const rules = el("div", "zen-absolute zen-inset-0 zen-flex");
    rules.setAttribute("aria-hidden", "true");
    current.axis.columns.forEach((column, i) => {
      const rule = el(
        "div",
        cn(
          "zen-shrink-0 zen-border-e zen-border-zen-border last:zen-border-e-0",
          column.nonWorking && "zen-bg-zen-muted/40",
          column.today && "zen-bg-zen-primary-soft/40",
        ),
      );
      rule.style.width = `${current.axis.columnWidths[i]}px`;
      rules.append(rule);
    });
    track.append(rules);
    attach(track, current.renderTrack(row, current.axis.axisWidth), rowOwned);

    node.append(pane, track);
    return node;
  }

  /**
   * Rebuild ONLY the row band and its spacers.
   *
   * This is the whole reason the chrome and the rows are built separately. A
   * scroll changes which rows should exist and nothing else, and rebuilding the
   * toolbar, the header and the scroller to express that would discard the
   * scroll position that caused it.
   */
  function renderRows(): void {
    if (!rowsHost || !padTop || !padBottom) return;
    for (const handle of rowOwned) handle.destroy();
    rowOwned = [];
    rowsHost.replaceChildren();

    const win = windowOf();
    padTop.style.height = `${win.paddingTop}px`;
    padBottom.style.height = `${win.paddingBottom}px`;
    for (const row of current.rows.slice(win.startIndex, win.endIndex)) {
      rowsHost.append(buildRow(row));
    }
  }

  /** Move focus to a cell, scrolling it in first if it is not mounted. */
  function focusCell(rowIndex: number, col: number): void {
    active = { row: rowIndex, col };

    /* The header is sticky and covers the top HEADER_PX of the viewport, so a
       row scrolled flush to the top is a row hidden behind the column titles. */
    const rowTop = HEADER_PX + rowIndex * rowHeight();
    const upper = rowTop - HEADER_PX;
    const lower = rowTop + rowHeight() - scroller.clientHeight;
    const next = Math.max(0, Math.min(Math.max(scroller.scrollTop, lower), upper));
    if (next !== scroller.scrollTop) {
      scroller.scrollTop = next;
      metrics = { ...metrics, top: next };
    }
    /* Synchronously, and this is where having no framework pays: the rows exist
       the moment the call returns, so there is nothing to defer and no second
       pass to arrange. Solid needed a microtask here and React a layout effect. */
    renderRows();

    const cell = scroller.querySelector<HTMLElement>(`[data-gantt-cell="${rowIndex}:${col}"]`);
    if (!cell) return;
    hadFocus = true;
    /* preventScroll, then adjusted by hand. The browser's own scrolling would
       drag the timeline cell — the whole axis wide — fully into view, jumping
       the axis to a place nobody asked for. */
    cell.focus({ preventScroll: true });

    /* Sideways, from rects rather than offsets, so RTL needs no special case: a
       relative `scrollLeft` nudge in physical pixels means the same under either
       of the browsers' two RTL conventions. The BAR, not the cell — the cell
       spans the entire axis. */
    const bar = cell.querySelector<HTMLElement>("[data-gantt-bar]");
    if (!bar) return;
    const box = bar.getBoundingClientRect();
    const viewport = scroller.getBoundingClientRect();
    const rtl = getComputedStyle(scroller).direction === "rtl";
    const pane = current.axis.paneWidth;
    const minX = rtl ? viewport.left : viewport.left + pane;
    const maxX = rtl ? viewport.right - pane : viewport.right;
    if (box.left < minX) scroller.scrollLeft -= minX - box.left;
    else if (box.right > maxX) scroller.scrollLeft += Math.min(box.right - maxX, box.left - minX);
  }

  function onGridKeyDown(event: KeyboardEvent): void {
    if (event.altKey || event.metaKey) return;
    /* Arrow keys follow the VISUAL direction, which is what APG specifies and
       what a reader expects from the key with an arrow drawn on it. */
    const rtl = getComputedStyle(scroller).direction === "rtl";
    const forward = rtl ? "ArrowLeft" : "ArrowRight";
    const backward = rtl ? "ArrowRight" : "ArrowLeft";
    const page = Math.max(1, Math.floor((metrics.height - HEADER_PX) / rowHeight()));
    const last = current.rows.length - 1;
    const row = current.rows[activeRow()];

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
          current.onToggle(row);
          return;
        }
        nextCol = Math.min(cellCount() - 1, activeCol() + 1);
        break;
      case backward:
        if (activeCol() === 0 && row?.hasChildren && row.expanded) {
          event.preventDefault();
          current.onToggle(row);
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
        if (row) current.onActivate?.(row);
        return;
      default:
        return;
    }

    // Swallowed even at an edge, or ArrowDown on the last row scrolls the PAGE
    // while the chart appears to ignore it.
    event.preventDefault();
    if (nextRow === activeRow() && nextCol === activeCol()) return;
    focusCell(nextRow, nextCol);
  }

  function buildToolbar(): HTMLElement {
    const bar = el("div", "zen-flex zen-flex-wrap zen-items-center zen-gap-2");

    /* GONE under fit, not disabled and not left live. A fit axis has no anchor
       to move, so Previous, Today and Next have nothing to change — and three
       buttons that visibly do nothing are read as a broken chart. */
    if (!current.axis.isFit) {
      const prev = keep(
        Button({
          variant: "outline",
          size: "sm",
          "aria-label": "Previous",
          // Logical, not physical: under RTL the axis runs the other way.
          children: keep(Icon({ name: "chevron-left", size: 14, class: "rtl:zen-rotate-180" })),
          onClick: () =>
            current.onDateChange(shiftGanttAnchor(current.axis.anchoredView, current.anchor, -1)),
        }),
      );
      const today = keep(
        Button({
          variant: "outline",
          size: "sm",
          children: "Today",
          onClick: () => current.onDateChange(current.now),
        }),
      );
      const next = keep(
        Button({
          variant: "outline",
          size: "sm",
          "aria-label": "Next",
          children: keep(Icon({ name: "chevron-right", size: 14, class: "rtl:zen-rotate-180" })),
          onClick: () =>
            current.onDateChange(shiftGanttAnchor(current.axis.anchoredView, current.anchor, 1)),
        }),
      );
      bar.append(prev.el, today.el, next.el);
    }

    const label = el(
      "span",
      "zen-mx-1 zen-text-sm zen-font-medium zen-text-zen-foreground",
      current.axis.isFit
        ? ganttSpanLabel(current.axis.range)
        : ganttRangeLabel(current.axis.anchoredView, current.anchor),
    );
    /* "29 Jun – 31 Jul 2026" opens with a number, and bidi reorders a leading
       number to the far side of an RTL run — it renders as "Jun – 31 Jul 2026
       29". `auto` rather than `ltr` because the month names come from
       `toLocaleString`: under an Arabic locale the label really is RTL. */
    label.setAttribute("dir", "auto");
    bar.append(label);

    const switcher = el("div", "zen-ms-auto zen-flex zen-gap-1");
    switcher.setAttribute("role", "group");
    switcher.setAttribute("aria-label", "View");
    for (const v of current.views ?? ALL_VIEWS) {
      const button = keep(
        Button({
          variant: current.view === v ? "solid" : "outline",
          size: "sm",
          "aria-pressed": current.view === v,
          children: VIEW_LABEL[v],
          onClick: () => current.onViewChange(v),
        }),
      );
      switcher.append(button.el);
    }
    bar.append(switcher);
    return bar;
  }

  function buildHeader(): HTMLElement {
    const header = el(
      "div",
      "zen-sticky zen-top-0 zen-z-30 zen-flex zen-border-b zen-border-zen-border zen-bg-zen-muted",
    );
    header.setAttribute("role", "row");
    header.setAttribute("aria-rowindex", "1");
    header.style.height = `${HEADER_PX}px`;
    header.style.boxSizing = "border-box";

    const pane = el(
      "div",
      "zen-sticky zen-z-40 zen-flex zen-shrink-0 zen-items-center zen-border-e zen-border-zen-border zen-bg-zen-muted zen-text-xs zen-font-semibold zen-text-zen-muted-fg",
    );
    pane.style.width = `${current.axis.paneWidth}px`;
    pane.style.insetInlineStart = "0";
    for (const column of visibleColumns()) {
      const cell = el("div", cn("zen-truncate", column.class ?? "zen-px-2"), column.label);
      cell.setAttribute("role", "columnheader");
      cell.setAttribute("aria-colindex", String(column.colIndex));
      cell.style.width = `${column.width}px`;
      pane.append(cell);
    }

    const axis = el("div", "zen-flex");
    axis.setAttribute("role", "columnheader");
    axis.setAttribute("aria-colindex", String(current.timelineColIndex));
    axis.setAttribute("aria-label", "Timeline");
    axis.style.width = `${current.axis.axisWidth}px`;
    current.axis.columns.forEach((column, i) => {
      const cell = el(
        "div",
        cn(
          "zen-flex zen-shrink-0 zen-flex-col zen-items-center zen-justify-center zen-overflow-hidden zen-border-e zen-border-zen-border last:zen-border-e-0",
          column.nonWorking && "zen-bg-zen-muted",
          column.today && "zen-bg-zen-primary-soft",
        ),
      );
      cell.style.width = `${current.axis.columnWidths[i]}px`;
      cell.append(el("span", "zen-text-xs zen-font-medium zen-text-zen-foreground", column.label));
      if (column.sublabel) {
        cell.append(el("span", "zen-text-[10px] zen-text-zen-muted-fg", column.sublabel));
      }
      axis.append(cell);
    });

    header.append(pane, axis);
    return header;
  }

  function buildConnectors(): SVGSVGElement | null {
    const links = current.connectors;
    if (!links || links.length === 0) return null;
    const height = current.rows.length * rowHeight();
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("aria-hidden", "true");
    /* Mirrored under RTL rather than recomputed: the bars are placed with
       logical inset properties, so the axis is already flipped and the routes
       have to flip with it — arrowheads included. */
    svg.setAttribute(
      "class",
      "zen-pointer-events-none zen-absolute zen-top-0 zen-z-10 rtl:-zen-scale-x-100",
    );
    svg.setAttribute("width", String(current.axis.axisWidth));
    svg.setAttribute("height", String(height));
    svg.setAttribute("viewBox", `0 0 ${current.axis.axisWidth} ${height}`);
    svg.style.insetInlineStart = `${current.axis.paneWidth}px`;

    for (const connector of links) {
      const accented = current.connectorAccent?.(connector) ?? false;
      /* zen-stroke-* / zen-fill-* generate nothing under this preset — the
         token has to be named directly. */
      const tone = accented ? "var(--zen-color-error)" : "var(--zen-color-muted-fg)";
      const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", connector.d);
      path.setAttribute("fill", "none");
      path.setAttribute("stroke", tone);
      /* Thicker as well as red: colour alone is not a signal on a chart that
         already uses red for delay. */
      path.setAttribute("stroke-width", accented ? "2.25" : "1.5");
      const head = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
      head.setAttribute(
        "points",
        [
          `${connector.arrow.x},${connector.arrow.y}`,
          `${connector.arrow.x - connector.arrow.dir * ARROW_PX * 1.6},${connector.arrow.y - ARROW_PX}`,
          `${connector.arrow.x - connector.arrow.dir * ARROW_PX * 1.6},${connector.arrow.y + ARROW_PX}`,
        ].join(" "),
      );
      head.setAttribute("fill", tone);
      group.append(path, head);
      svg.append(group);
    }
    return svg;
  }

  /** Rebuild the chrome. Everything except the scroller node itself. */
  function render(): void {
    for (const handle of owned) handle.destroy();
    for (const handle of rowOwned) handle.destroy();
    for (const off of cleanups) off();
    owned = [];
    rowOwned = [];
    cleanups = [];

    root.className = cn("zen-flex zen-w-full zen-flex-col zen-gap-3", current.class);
    toolbarSlot.replaceChildren();
    if (!current.hideToolbar) toolbarSlot.append(buildToolbar());

    /* Saved and restored around the swap: the content is briefly shorter while
       the grid is empty, and a browser clamps scrollTop the moment it is. */
    const savedTop = scroller.scrollTop;
    const savedLeft = scroller.scrollLeft;
    /* And the FOCUS, which is the one the other two bindings get for free.
       React keeps a row's DOM through `key`, Solid through `<Index>`; here a
       render genuinely replaces every node, so the focused cell stops existing.
       Focus then falls to <body> and the next arrow key goes to the document
       instead of the grid: collapsing a phase worked and expanding it again did
       nothing, because the keystroke never arrived. */
    const refocus = scroller.contains(document.activeElement);
    scroller.replaceChildren();

    gridEl = el("div");
    gridEl.style.width = `${current.axis.paneWidth + current.axis.axisWidth}px`;
    /* treegrid, not grid: the rows form a tree, and that is what makes left and
       right on the first column mean collapse and expand. */
    gridEl.setAttribute("role", "treegrid");
    /* The TRUE totals, not the windowed ones — without them a screen reader
       counts the DOM and announces "row 3 of 26" in a 10,000-row plan. */
    gridEl.setAttribute("aria-rowcount", String(current.rows.length + 1));
    gridEl.setAttribute("aria-colcount", String(current.colCount));
    gridEl.setAttribute("aria-label", current.ariaLabel);
    on(gridEl, "keydown", onGridKeyDown as EventListener);

    gridEl.append(buildHeader());

    bodyEl = el("div", "zen-relative");
    bodyEl.style.height = `${current.rows.length * rowHeight()}px`;
    /* Spacers stand in for the rows that are not mounted, so the scrollbar
       measures the whole plan rather than the window. Spacers rather than a
       transform on purpose: a transformed ancestor makes `position: sticky`
       resolve against IT instead of the scroll container, and the frozen pane
       would come unstuck the moment the window moved. */
    padTop = el("div");
    padTop.setAttribute("aria-hidden", "true");
    rowsHost = el("div");
    padBottom = el("div");
    padBottom.setAttribute("aria-hidden", "true");
    bodyEl.append(padTop, rowsHost, padBottom);

    const marker = nowPct(current.axis.range, current.now);
    if (marker !== null) {
      const line = el("div", "zen-pointer-events-none zen-absolute zen-top-0 zen-z-10 zen-w-px zen-bg-zen-error");
      line.setAttribute("aria-hidden", "true");
      line.style.height = `${current.rows.length * rowHeight()}px`;
      line.style.insetInlineStart = `${current.axis.paneWidth + (marker / 100) * current.axis.axisWidth}px`;
      bodyEl.append(line);
    }

    /* The connector overlay is deliberately NOT windowed: a link between two
       off-screen tasks still routes through the visible band, and culling it
       would blink connectors in and out as their endpoints scrolled away. */
    const svg = buildConnectors();
    if (svg) bodyEl.append(svg);

    gridEl.append(bodyEl);
    scroller.append(gridEl);

    if (current.renderFooter) {
      const footer = el(
        "div",
        "zen-sticky zen-bottom-0 zen-z-30 zen-flex zen-border-t zen-border-zen-border zen-bg-zen-muted",
      );
      footer.style.width = `${current.axis.paneWidth + current.axis.axisWidth}px`;
      attach(footer, current.renderFooter(current.axis), owned);
      scroller.append(footer);
    }

    renderRows();
    scroller.scrollTop = savedTop;
    scroller.scrollLeft = savedLeft;

    if (refocus) {
      const cell = scroller.querySelector<HTMLElement>(
        `[data-gantt-cell="${activeRow()}:${activeCol()}"]`,
      );
      /* The scroller itself when the row is no longer mounted — still inside
         the chart, still where they left it, and Tab continues from there. */
      (cell ?? scroller).focus({ preventScroll: true });
    }
  }

  /* ---- measurement, and the loop it closes with the caller ---- */
  const measure = () => {
    const next = {
      top: scroller.scrollTop,
      height: scroller.clientHeight,
      width: scroller.clientWidth,
    };
    const movedWindow = next.top !== metrics.top || next.height !== metrics.height;
    const movedBox = next.width !== metrics.width || next.height !== metrics.height;
    if (!movedWindow && !movedBox) return;
    metrics = next;
    /* A scroll changes which rows exist and nothing else, so it never leaves
       this file. A width change does — the axis is sized from it — so the
       caller is told and comes back through update(). */
    if (movedBox) current.onMetrics?.(metrics);
    else renderRows();
  };

  let frame = 0;
  const onScroll = () => {
    if (frame === 0)
      frame = requestAnimationFrame(() => {
        frame = 0;
        measure();
        /* Focus rescue. Scrolling a focused cell out of the window unmounts it
           and the browser drops focus to <body> — so the next Tab restarts from
           the top of the PAGE, stranding a keyboard user who was reading row
           4,000. This puts focus on the scroller instead: still inside the
           chart, still scrolled where they left it. */
        if (hadFocus && document.activeElement === document.body) {
          scroller.focus({ preventScroll: true });
        }
      });
  };
  scroller.addEventListener("scroll", onScroll, { passive: true });
  const observer = new ResizeObserver(onScroll);
  observer.observe(scroller);
  scroller.addEventListener("focusin", () => {
    hadFocus = true;
  });

  render();
  // First real measurement: the seeded width is 0, which the pane reads as
  // "unmeasured" rather than as a zero-width container.
  queueMicrotask(measure);

  return {
    el: root,
    update(next) {
      current = { ...current, ...next };
      render();
    },
    metrics: () => metrics,
    destroy() {
      for (const handle of owned) handle.destroy();
      for (const handle of rowOwned) handle.destroy();
      for (const off of cleanups) off();
      owned = [];
      rowOwned = [];
      cleanups = [];
      if (frame !== 0) cancelAnimationFrame(frame);
      scroller.removeEventListener("scroll", onScroll);
      observer.disconnect();
      root.remove();
    },
  };
}
