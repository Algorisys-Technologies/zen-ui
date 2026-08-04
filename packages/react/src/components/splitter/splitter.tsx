import * as React from "react";
import {
  normalizeSizes,
  dragHandle,
  handleBounds,
  splitterKeyDelta,
  mirrorDelta,
  directionOf,
  type SplitterOrientation,
  type SplitterPanelConstraint,
} from "@algorisys/zen-ui-core";
import { cn } from "../../lib/cn";

/**
 * Splitter — panes a user can resize by dragging the divider between them.
 *
 *   <Splitter defaultSizes={[30, 70]}>
 *     <SplitterPanel min={20} collapsible><Manuscript /></SplitterPanel>
 *     <SplitterHandle />
 *     <SplitterPanel min={30}><Preview /></SplitterPanel>
 *   </Splitter>
 *
 * The handle is EXPLICIT rather than injected between panels. An implicit one
 * leaves the caller nowhere to put a collapse button or a grab affordance.
 *
 * The geometry is `@algorisys/zen-ui-core/splitter`, shared by every binding —
 * see scripts/check-splitter.ts. `react-resizable-panels` was refused because it
 * has no Solid equivalent: the two bindings would then differ in BEHAVIOUR
 * rather than only in composition, which is what check-parity cannot see.
 *
 * It does NOT persist anything. `onSizesCommit` plus a controlled `sizes` gives
 * a caller everything they need to persist wherever they keep state.
 */

export type { SplitterOrientation };

interface SplitterContextValue {
  orientation: SplitterOrientation;
  sizes: number[];
  disabled: boolean;
  registerPanel: (constraint: () => SplitterPanelConstraint, id: string) => number;
  registerHandle: () => number;
  panelId: (index: number) => string;
  boundsOf: (index: number) => { min: number; max: number };
  dragFrom: (handleIndex: number, base: number[], delta: number, direction: "ltr" | "rtl") => void;
  commit: () => void;
  beginDrag: () => void;
}

const SplitterContext = React.createContext<SplitterContextValue | null>(null);

const useSplitter = () => {
  const ctx = React.useContext(SplitterContext);
  if (!ctx) throw new Error("SplitterPanel and SplitterHandle must be inside a Splitter.");
  return ctx;
};

export interface SplitterProps {
  orientation?: SplitterOrientation;
  /** Controlled. Percentages summing to 100. */
  sizes?: number[];
  /** Uncontrolled starting layout. Defaults to an even split. */
  defaultSizes?: number[];
  /** Fires during the drag, batched to one animation frame. */
  onSizesChange?: (sizes: number[]) => void;
  /** Fires once on release. This is what to persist. */
  onSizesCommit?: (sizes: number[]) => void;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const Splitter = ({
  orientation = "horizontal",
  sizes: sizesProp,
  defaultSizes,
  onSizesChange,
  onSizesCommit,
  disabled = false,
  className,
  children,
}: SplitterProps) => {
  const constraints = React.useRef<(() => SplitterPanelConstraint)[]>([]);
  const panelIds = React.useRef<string[]>([]);
  const [count, setCount] = React.useState(0);
  const [internal, setInternal] = React.useState<number[]>(defaultSizes ?? []);
  const [dragging, setDragging] = React.useState(false);

  const sizes = React.useMemo(
    () => normalizeSizes(sizesProp ?? (internal.length ? internal : undefined), count),
    [sizesProp, internal, count],
  );

  const sizesRef = React.useRef(sizes);
  sizesRef.current = sizes;
  const handlers = React.useRef({ onSizesChange, onSizesCommit });
  handlers.current = { onSizesChange, onSizesCommit };

  /* Batched to one frame. Writing layout per pointermove is what makes a
     splitter feel heavy, and dropped frames under continuous input are a bug
     rather than a polish item. */
  const frame = React.useRef(0);
  const queued = React.useRef<number[] | null>(null);

  const flush = React.useCallback(() => {
    frame.current = 0;
    if (!queued.current) return;
    const next = queued.current;
    queued.current = null;
    if (sizesProp === undefined) setInternal(next);
    handlers.current.onSizesChange?.(next);
  }, [sizesProp]);

  React.useEffect(() => () => { if (frame.current) cancelAnimationFrame(frame.current); }, []);

  const value = React.useMemo<SplitterContextValue>(
    () => ({
      orientation,
      sizes,
      disabled,
      registerPanel: (constraint, id) => {
        const index = constraints.current.length;
        constraints.current.push(constraint);
        panelIds.current.push(id);
        setCount(constraints.current.length);
        return index;
      },
      registerHandle: () => Math.max(0, constraints.current.length - 1),
      panelId: (i) => panelIds.current[i] ?? "",
      boundsOf: (i) => handleBounds(sizesRef.current, i, constraints.current.map((c) => c())),
      dragFrom: (handleIndex, base, delta, direction) => {
        if (disabled) return;
        queued.current = dragHandle(
          base,
          handleIndex,
          mirrorDelta(delta, orientation, direction),
          constraints.current.map((c) => c()),
        );
        if (!frame.current) frame.current = requestAnimationFrame(flush);
      },
      commit: () => {
        if (frame.current) {
          cancelAnimationFrame(frame.current);
          flush();
        }
        setDragging(false);
        handlers.current.onSizesCommit?.(sizesRef.current);
      },
      beginDrag: () => setDragging(true),
    }),
    [orientation, sizes, disabled, flush],
  );

  return (
    <SplitterContext.Provider value={value}>
      <div
        data-orientation={orientation}
        data-dragging={dragging ? "" : undefined}
        className={cn(
          "zen-flex zen-h-full zen-w-full zen-overflow-hidden",
          orientation === "horizontal" ? "zen-flex-row" : "zen-flex-col",
          /* The resize cursor is held across the WHOLE splitter while a drag is
             live. The handle is a 1px line with a padded hit area, so the pointer
             spends most of a fast drag over a panel — without this it flickers
             back to the default arrow mid-gesture. */
          dragging && (orientation === "horizontal" ? "zen-cursor-col-resize" : "zen-cursor-row-resize"),
          dragging && "zen-select-none",
          className,
        )}
      >
        {children}
      </div>
    </SplitterContext.Provider>
  );
};

export interface SplitterPanelProps extends SplitterPanelConstraint {
  className?: string;
  children?: React.ReactNode;
}

export const SplitterPanel = ({ min, max, collapsible, collapsedSize, className, children }: SplitterPanelProps) => {
  const ctx = useSplitter();
  const id = React.useId();
  const constraint = React.useRef({ min, max, collapsible, collapsedSize });
  constraint.current = { min, max, collapsible, collapsedSize };

  const [index] = React.useState(() => ctx.registerPanel(() => constraint.current, id));

  const size = ctx.sizes[index] ?? 0;
  const collapsed = size <= (collapsedSize ?? 0) + 1e-6;

  return (
    <div
      id={id}
      data-state={collapsed ? "collapsed" : "expanded"}
      /* flex-basis rather than width/height, so one rule covers both
         orientations and the flex container owns the axis. */
      style={{ flexBasis: `${size}%`, flexGrow: 0, flexShrink: 0 }}
      className={cn("zen-min-h-0 zen-min-w-0 zen-overflow-auto", className)}
    >
      {children}
    </div>
  );
};

export interface SplitterHandleProps {
  /** Required by the pattern: a separator with no name cannot be told from three others. */
  label?: string;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

/**
 * The divider. A WAI-ARIA window splitter: `role="separator"`, focusable, and
 * `aria-valuenow` describing the PRECEDING panel so a screen-reader user knows
 * which pane the arrows move.
 */
export const SplitterHandle = ({ label, disabled, className, children }: SplitterHandleProps) => {
  const ctx = useSplitter();
  const id = React.useId();
  /* A handle sits between panel n and n+1. It asks the root which boundary it
     owns at creation — deriving it from the rendered size array instead breaks
     the moment a panel is conditional. */
  const [handleIndex] = React.useState(() => ctx.registerHandle());

  const el = React.useRef<HTMLDivElement>(null);
  const startPos = React.useRef(0);
  const containerPx = React.useRef(1);
  const baseSizes = React.useRef<number[]>([]);
  /*
   * Our own flag rather than `hasPointerCapture` as the gate. Capture is an
   * ENHANCEMENT — it keeps a fast drag tracking after the pointer leaves the
   * 1px line — but `setPointerCapture` throws for a pointer id that is not
   * active, and gating the move on it means one failed call silently turns the
   * whole handle into a dead control.
   */
  const active = React.useRef(false);

  const inert = ctx.disabled || (disabled ?? false);
  const horizontal = ctx.orientation === "horizontal";
  const bounds = ctx.boundsOf(handleIndex);
  const precedingSize = ctx.sizes[handleIndex] ?? 0;

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (inert) return;
    /*
     * preventDefault stops the drag selecting text — and it also suppresses the
     * browser's focus-on-mousedown, so focus stays wherever it was. The effect
     * is that clicking the divider and then pressing an arrow scrolls the PAGE:
     * the keys are never ours because the handle was never focused. Tabbing to
     * it works, which is exactly why a Tab-based test does not catch this.
     */
    e.preventDefault();
    el.current?.focus();
    try {
      el.current?.setPointerCapture(e.pointerId);
    } catch {
      /* No capture available; the drag still works, it just stops tracking if
         the pointer leaves the element. */
    }
    active.current = true;
    ctx.beginDrag();
    startPos.current = horizontal ? e.clientX : e.clientY;
    baseSizes.current = [...ctx.sizes];
    /* Measured ONCE per gesture. Measuring per move is what makes a splitter
       feel heavy. */
    const box = el.current?.parentElement?.getBoundingClientRect();
    containerPx.current = Math.max(1, horizontal ? (box?.width ?? 1) : (box?.height ?? 1));
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (inert || !active.current) return;
    const pos = horizontal ? e.clientX : e.clientY;
    /*
     * Total movement since pointerdown, NOT since the last event. Accumulating
     * steps against the clamped result loses the overshoot: a pointer dragged
     * well past a panel's min leaves the size pinned at min, so the position
     * never travels far enough for a collapse to snap.
     */
    const deltaPct = ((pos - startPos.current) / containerPx.current) * 100;
    ctx.dragFrom(handleIndex, baseSizes.current, deltaPct, directionOf(el.current));
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!active.current) return;
    active.current = false;
    try {
      el.current?.releasePointerCapture(e.pointerId);
    } catch {
      /* Never captured, or already released. */
    }
    ctx.commit();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (inert) return;
    const delta = splitterKeyDelta(e.key, ctx.orientation, e.shiftKey);
    if (delta === null) return;
    e.preventDefault();
    ctx.dragFrom(handleIndex, ctx.sizes, delta, directionOf(el.current));
    ctx.commit();
  };

  return (
    <div
      ref={el}
      id={id}
      role="separator"
      tabIndex={inert ? -1 : 0}
      aria-orientation={horizontal ? "vertical" : "horizontal"}
      aria-label={label ?? "Resize panels"}
      aria-controls={ctx.panelId(handleIndex)}
      aria-valuenow={Math.round(precedingSize)}
      aria-valuemin={Math.round(bounds.min)}
      aria-valuemax={Math.round(bounds.max)}
      aria-disabled={inert || undefined}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onKeyDown={onKeyDown}
      className={cn(
        "zen-group zen-relative zen-flex zen-shrink-0 zen-items-center zen-justify-center",
        /*
         * The hit area, and ONLY the hit area — it paints nothing itself.
         *
         * The line used to be this element, sized `w-px` with padding for touch.
         * Under `box-sizing: border-box` the padding eats the width, so the
         * content box came out 0px wide and the divider was invisible. The line
         * is its own child now, which is the only arrangement where the visible
         * width and the grabbable width are independent.
         */
        horizontal ? "zen-w-3 -zen-mx-1.5 zen-cursor-col-resize" : "zen-h-3 -zen-my-1.5 zen-cursor-row-resize",
        "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
        /* Or the page scrolls instead of the splitter moving. */
        "zen-touch-none",
        inert && "zen-cursor-default zen-opacity-60",
        className,
      )}
    >
      {/* The visible divider. */}
      <span
        aria-hidden
        className={cn(
          "zen-pointer-events-none zen-bg-zen-border zen-transition-colors",
          horizontal ? "zen-h-full zen-w-px" : "zen-h-px zen-w-full",
          !inert && "group-hover:zen-bg-zen-primary group-focus-visible:zen-bg-zen-primary",
        )}
      />
      {children}
    </div>
  );
};
