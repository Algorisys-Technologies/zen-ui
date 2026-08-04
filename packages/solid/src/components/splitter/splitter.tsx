import {
  createContext,
  createMemo,
  createSignal,
  createUniqueId,
  useContext,
  onCleanup,
  type JSX,
} from "solid-js";
import {
  normalizeSizes,
  dragHandle,
  handleBounds,
  splitterKeyDelta,
  mirrorDelta,
  type SplitterOrientation,
  type SplitterPanelConstraint,
} from "@algorisys/zen-ui-core/splitter";
import { directionOf } from "@algorisys/zen-ui-core";
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
 * leaves the caller nowhere to put a collapse button or a grab affordance, and
 * the handle is exactly where those belong.
 *
 * The geometry is `@algorisys/zen-ui-core/splitter`, shared by every binding —
 * see scripts/check-splitter.ts. This file owns the DOM and the pointer.
 *
 * It does NOT persist anything. `react-resizable-panels` writes to localStorage
 * behind an `autoSaveId`; a component library that writes to storage without
 * being asked is one that surprises people. `onSizesCommit` plus a controlled
 * `sizes` gives a caller everything they need to persist wherever they actually
 * keep state.
 */

export type { SplitterOrientation };

interface SplitterContextValue {
  orientation: () => SplitterOrientation;
  sizes: () => number[];
  disabled: () => boolean;
  registerPanel: (constraint: () => SplitterPanelConstraint, id: string) => number;
  /** Handles register too, so each learns which boundary it owns rather than guessing. */
  registerHandle: () => number;
  /** The real travel range of a boundary, for the ARIA value range. */
  boundsOf: (handleIndex: number) => { min: number; max: number };
  panelId: (index: number) => string;
  /**
   * `base` is the layout at the START of the gesture and `delta` the TOTAL
   * movement since, not the step since the last event. Accumulating steps
   * against the clamped result loses the overshoot: a pointer dragged well past
   * a panel's min leaves the size pinned at min, so the position never travels
   * far enough for a collapse to snap and `collapsible` is unreachable by drag.
   */
  dragFrom: (handleIndex: number, base: number[], delta: number, direction: "ltr" | "rtl") => void;
  commit: () => void;
  beginDrag: () => void;
}

const SplitterContext = createContext<SplitterContextValue>();

const useSplitter = () => {
  const ctx = useContext(SplitterContext);
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
  /** Handles stop responding; panels keep their sizes. */
  disabled?: boolean;
  class?: string;
  children?: JSX.Element;
}

export const Splitter = (props: SplitterProps) => {
  const constraints: (() => SplitterPanelConstraint)[] = [];
  const panelIds: string[] = [];
  const [count, setCount] = createSignal(0);

  const [internal, setInternal] = createSignal<number[]>(props.defaultSizes ?? []);
  const [dragging, setDragging] = createSignal(false);

  const orientation = () => props.orientation ?? "horizontal";
  const disabled = () => props.disabled ?? false;

  const sizes = createMemo(() =>
    normalizeSizes(props.sizes ?? (internal().length ? internal() : undefined), count()),
  );

  const registerPanel = (constraint: () => SplitterPanelConstraint, id: string) => {
    const index = constraints.length;
    constraints.push(constraint);
    panelIds.push(id);
    setCount(constraints.length);
    return index;
  };

  /* Batched to one frame. Writing layout per pointermove is what makes a
     splitter feel heavy, and dropped frames under continuous input are a bug
     rather than a polish item. */
  let frame = 0;
  let queued: number[] | null = null;
  const flush = () => {
    frame = 0;
    if (!queued) return;
    const next = queued;
    queued = null;
    if (props.sizes === undefined) setInternal(next);
    props.onSizesChange?.(next);
  };
  onCleanup(() => {
    if (frame) cancelAnimationFrame(frame);
  });

  const dragFrom = (handleIndex: number, base: number[], delta: number, direction: "ltr" | "rtl") => {
    if (disabled()) return;
    queued = dragHandle(
      base,
      handleIndex,
      mirrorDelta(delta, orientation(), direction),
      constraints.map((c) => c()),
    );
    if (!frame) frame = requestAnimationFrame(flush);
  };

  const commit = () => {
    if (frame) {
      cancelAnimationFrame(frame);
      flush();
    }
    setDragging(false);
    props.onSizesCommit?.(sizes());
  };

  return (
    <SplitterContext.Provider
      value={{
        orientation,
        sizes,
        disabled,
        registerPanel,
        registerHandle: () => Math.max(0, constraints.length - 1),
        boundsOf: (i) => handleBounds(sizes(), i, constraints.map((c) => c())),
        panelId: (i) => panelIds[i] ?? "",
        dragFrom,
        commit,
        beginDrag: () => setDragging(true),
      }}
    >
      <div
        data-orientation={orientation()}
        data-dragging={dragging() ? "" : undefined}
        class={cn(
          "zen-flex zen-h-full zen-w-full zen-overflow-hidden",
          orientation() === "horizontal" ? "zen-flex-row" : "zen-flex-col",
          /* The resize cursor is held across the WHOLE splitter while a drag is
             live. The handle is a 1px line with a padded hit area, so the
             pointer spends most of a fast drag over a panel — without this it
             flickers back to the default arrow mid-gesture, which reads as the
             drag having been dropped. Pointer capture keeps the events coming;
             only the cursor needed saying. */
          dragging() &&
            (orientation() === "horizontal" ? "zen-cursor-col-resize" : "zen-cursor-row-resize"),
          /* And nothing selects while dragging, or a fast drag paints the panes
             blue with selected text. */
          dragging() && "zen-select-none",
          props.class,
        )}
      >
        {props.children}
      </div>
    </SplitterContext.Provider>
  );
};

export interface SplitterPanelProps extends SplitterPanelConstraint {
  class?: string;
  children?: JSX.Element;
}

export const SplitterPanel = (props: SplitterPanelProps) => {
  const ctx = useSplitter();
  const id = createUniqueId();
  /* The arrow IS the tracked scope: it is stored and called later, on every
     drag, so each read sees the current props. Passing an evaluated object here
     is what would freeze the constraints at mount. */
  const index = ctx.registerPanel(
    // eslint-disable-next-line solid/reactivity
    () => ({
      min: props.min,
      max: props.max,
      collapsible: props.collapsible,
      collapsedSize: props.collapsedSize,
    }),
    id,
  );

  const size = () => ctx.sizes()[index] ?? 0;
  const collapsed = () => size() <= (props.collapsedSize ?? 0) + 1e-6;

  return (
    <div
      id={id}
      data-state={collapsed() ? "collapsed" : "expanded"}
      /* flex-basis rather than width/height, so one rule covers both
         orientations and the flex container owns the axis. */
      style={{ "flex-basis": `${size()}%`, "flex-grow": "0", "flex-shrink": "0" }}
      class={cn("zen-min-h-0 zen-min-w-0 zen-overflow-auto", props.class)}
    >
      {props.children}
    </div>
  );
};

export interface SplitterHandleProps {
  /** Required by the pattern: a separator with no name cannot be told from three others. */
  label?: string;
  disabled?: boolean;
  class?: string;
  children?: JSX.Element;
}

/**
 * The divider. A WAI-ARIA window splitter, which is a real pattern with a real
 * contract: `role="separator"`, focusable, and `aria-valuenow` describing the
 * PRECEDING panel so a screen-reader user knows which pane the arrows move.
 */
export const SplitterHandle = (props: SplitterHandleProps) => {
  const ctx = useSplitter();
  const id = createUniqueId();
  /* A handle sits between panel n and n+1. It asks the root which boundary it
     owns at creation time — panels register during their own setup, which runs
     before the handle after them, so the count is the answer. Deriving it from
     the rendered size array instead breaks the moment a panel is conditional. */
  const handleIndex = ctx.registerHandle();

  const inert = () => ctx.disabled() || (props.disabled ?? false);
  const horizontal = () => ctx.orientation() === "horizontal";

  let el: HTMLDivElement | undefined;
  let startPos = 0;
  let containerPx = 1;
  /* The layout when the gesture began. Every move is measured against this. */
  let baseSizes: number[] = [];
  /*
   * Our own flag rather than `hasPointerCapture` as the gate. Capture is an
   * ENHANCEMENT — it keeps a fast drag tracking after the pointer leaves the
   * 1px line — but `setPointerCapture` throws for a pointer id that is not
   * active, and gating the move on it means one failed call silently turns the
   * whole handle into a dead control. The flag is the truth; capture is the
   * nicety.
   */
  let active = false;

  const onPointerDown = (e: PointerEvent) => {
    if (inert()) return;
    e.preventDefault();
    try {
      el?.setPointerCapture(e.pointerId);
    } catch {
      /* No capture available; the drag still works, it just stops tracking if
         the pointer leaves the element. */
    }
    active = true;
    ctx.beginDrag();
    startPos = horizontal() ? e.clientX : e.clientY;
    baseSizes = [...ctx.sizes()];
    /* Measured ONCE per gesture. Measuring per move is what makes a splitter
       feel heavy, and it is the first thing to look at if it does. */
    const box = el?.parentElement?.getBoundingClientRect();
    containerPx = Math.max(1, horizontal() ? (box?.width ?? 1) : (box?.height ?? 1));
  };

  const onPointerMove = (e: PointerEvent) => {
    if (inert() || !active) return;
    const pos = horizontal() ? e.clientX : e.clientY;
    /* Total movement since pointerdown, NOT since the last event. */
    const deltaPct = ((pos - startPos) / containerPx) * 100;
    ctx.dragFrom(handleIndex, baseSizes, deltaPct, directionOf(el));
  };

  const endDrag = (e: PointerEvent) => {
    if (!active) return;
    active = false;
    try {
      el?.releasePointerCapture(e.pointerId);
    } catch {
      /* Never captured, or already released. */
    }
    ctx.commit();
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (inert()) return;
    const delta = splitterKeyDelta(e.key, ctx.orientation(), e.shiftKey);
    if (delta === null) return;
    e.preventDefault();
    /* One key press is one step from wherever it is now. */
    ctx.dragFrom(handleIndex, ctx.sizes(), delta, directionOf(el));
    ctx.commit();
  };

  const precedingSize = () => ctx.sizes()[handleIndex] ?? 0;

  return (
    <div
      ref={el}
      id={id}
      role="separator"
      tabIndex={inert() ? -1 : 0}
      aria-orientation={horizontal() ? "vertical" : "horizontal"}
      aria-label={props.label ?? "Resize panels"}
      aria-controls={ctx.panelId(handleIndex)}
      aria-valuenow={Math.round(precedingSize())}
      aria-valuemin={Math.round(ctx.boundsOf(handleIndex).min)}
      aria-valuemax={Math.round(ctx.boundsOf(handleIndex).max)}
      aria-disabled={inert() || undefined}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onKeyDown={onKeyDown}
      class={cn(
        "zen-group zen-relative zen-flex zen-shrink-0 zen-items-center zen-justify-center",
        /*
         * The hit area, and ONLY the hit area — it paints nothing itself.
         *
         * The line used to be this element, sized `w-px` with padding for
         * touch. Under `box-sizing: border-box` the padding eats the width, so
         * the content box came out 0px wide and `bg-clip-content` painted a
         * divider nobody could see. Measured: 12px total, 0px content. The line
         * is its own child now, which is the only arrangement where the visible
         * width and the grabbable width are independent.
         *
         * Negative margin pulls the 12px back out of the layout, so the panes
         * still meet at a hairline while the target stays finger-sized.
         */
        horizontal()
          ? "zen-w-3 -zen-mx-1.5 zen-cursor-col-resize"
          : "zen-h-3 -zen-my-1.5 zen-cursor-row-resize",
        "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
        /* Or the page scrolls instead of the splitter moving. */
        "zen-touch-none",
        inert() && "zen-cursor-default zen-opacity-60",
        props.class,
      )}
    >
      {/* The visible divider. Thickens on hover and focus rather than only
          changing colour, so the affordance survives greyscale. */}
      <span
        aria-hidden="true"
        class={cn(
          "zen-pointer-events-none zen-bg-zen-border zen-transition-colors",
          horizontal() ? "zen-h-full zen-w-px" : "zen-h-px zen-w-full",
          !inert() &&
            "group-hover:zen-bg-zen-primary group-focus-visible:zen-bg-zen-primary",
        )}
      />
      {props.children}
    </div>
  );
};
