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
import { applyProps, Disposer, setChildren, type BaseProps, type Child, type ZenComponent } from "../../lib/component";

/**
 * Splitter — panes a user can resize by dragging the divider between them.
 *
 *   Splitter({
 *     defaultSizes: [30, 70],
 *     panels: [
 *       { min: 20, collapsible: true, content: manuscript },
 *       { min: 30, content: preview },
 *     ],
 *   }).el
 *
 * Vanilla port; see the React binding for the reasoning. Same geometry, same
 * keyboard, same ARIA.
 *
 * ONE deviation, and it is this binding's standing one: React composes
 * `<SplitterPanel>` and `<SplitterHandle>` as children, which needs a context to
 * register them in order. With no framework there is no context, so the panels
 * are DATA and the dividers are implied — n panels give n-1 dividers, which is
 * the only arrangement a splitter can have anyway. `handleLabel` on a panel names
 * the divider that FOLLOWS it, so a caller can still label all of them.
 *
 * The geometry is `@algorisys/zen-ui-core/splitter`, shared by every binding and
 * pinned by scripts/check-splitter.ts. This file owns only DOM and pointers.
 */

export type { SplitterOrientation, SplitterPanelConstraint };

export interface SplitterPanelSpec extends SplitterPanelConstraint {
  /** What goes in the pane. */
  content?: Child;
  class?: string;
  /** Accessible name for the divider that FOLLOWS this panel. */
  handleLabel?: string;
}

export interface SplitterProps extends BaseProps {
  orientation?: SplitterOrientation;
  panels: SplitterPanelSpec[];
  /** Controlled. Percentages summing to 100. */
  sizes?: number[];
  /** Uncontrolled starting layout. Defaults to an even split. */
  defaultSizes?: number[];
  /** Fires during the drag, batched to one animation frame. */
  onSizesChange?: (sizes: number[]) => void;
  /** Fires once on release. This is what to persist — the component stores nothing. */
  onSizesCommit?: (sizes: number[]) => void;
  disabled?: boolean;
}

let uid = 0;

export function Splitter(props: SplitterProps): ZenComponent<SplitterProps> {
  let current: SplitterProps = { ...props };
  const disposer = new Disposer();
  let removeProps: (() => void) | undefined;

  const el = document.createElement("div");

  /** Uncontrolled layout. Ignored entirely while `sizes` is passed. */
  let internal: number[] = current.defaultSizes ?? [];
  let dragging = false;

  let panelEls: HTMLDivElement[] = [];
  let handleEls: HTMLDivElement[] = [];
  /** What the structure was last built from — a rebuild is only needed when it moves. */
  let builtCount = -1;

  const constraints = (): SplitterPanelConstraint[] =>
    current.panels.map(({ min, max, collapsible, collapsedSize }) => ({ min, max, collapsible, collapsedSize }));

  const sizesNow = (): number[] =>
    normalizeSizes(current.sizes ?? (internal.length ? internal : undefined), current.panels.length);

  /* Batched to one frame. Writing layout per pointermove is what makes a splitter
     feel heavy, and dropped frames under continuous input are a bug rather than a
     polish item. */
  let frame = 0;
  let queued: number[] | null = null;

  const flush = () => {
    frame = 0;
    if (!queued) return;
    const next = queued;
    queued = null;
    if (current.sizes === undefined) internal = next;
    current.onSizesChange?.(next);
    paint();
  };

  const dragFrom = (handleIndex: number, base: number[], delta: number, direction: "ltr" | "rtl") => {
    if (current.disabled) return;
    queued = dragHandle(
      base,
      handleIndex,
      mirrorDelta(delta, current.orientation ?? "horizontal", direction),
      constraints(),
    );
    if (!frame) frame = requestAnimationFrame(flush);
  };

  const commit = () => {
    if (frame) {
      cancelAnimationFrame(frame);
      flush();
    }
    dragging = false;
    paintRoot();
    current.onSizesCommit?.(sizesNow());
  };

  const paintRoot = () => {
    const orientation = current.orientation ?? "horizontal";
    el.dataset.orientation = orientation;
    if (dragging) el.dataset.dragging = "";
    else delete el.dataset.dragging;

    el.className = cn(
      "zen-flex zen-h-full zen-w-full zen-overflow-hidden",
      orientation === "horizontal" ? "zen-flex-row" : "zen-flex-col",
      /* The resize cursor is held across the WHOLE splitter while a drag is live.
         The handle is a 1px line with a padded hit area, so the pointer spends
         most of a fast drag over a panel — without this it flickers back to the
         default arrow mid-gesture. */
      dragging && (orientation === "horizontal" ? "zen-cursor-col-resize" : "zen-cursor-row-resize"),
      dragging && "zen-select-none",
      current.class,
    );
  };

  /**
   * Sizes and ARIA only — NOT structure.
   *
   * A drag runs this every frame. Rebuilding the tree instead would destroy the
   * focused handle mid-gesture and take the pointer capture with it, which reads
   * as the divider dying halfway across the screen.
   */
  const paint = () => {
    const sizes = sizesNow();
    const orientation = current.orientation ?? "horizontal";
    const horizontal = orientation === "horizontal";
    const cons = constraints();

    panelEls.forEach((panel, i) => {
      const size = sizes[i] ?? 0;
      const collapsedSize = cons[i]?.collapsedSize ?? 0;
      panel.dataset.state = size <= collapsedSize + 1e-6 ? "collapsed" : "expanded";
      /* flex-basis rather than width/height, so one rule covers both orientations
         and the flex container owns the axis. */
      panel.style.flexBasis = `${size}%`;
      panel.style.flexGrow = "0";
      panel.style.flexShrink = "0";
    });

    handleEls.forEach((handle, i) => {
      const inert = (current.disabled ?? false);
      const bounds = handleBounds(sizes, i, cons);
      handle.setAttribute("aria-orientation", horizontal ? "vertical" : "horizontal");
      handle.setAttribute("aria-valuenow", String(Math.round(sizes[i] ?? 0)));
      /* The REAL clamps, not a flat 0–100. A separator that announces a range it
         cannot reach is worse than one that announces none. */
      handle.setAttribute("aria-valuemin", String(Math.round(bounds.min)));
      handle.setAttribute("aria-valuemax", String(Math.round(bounds.max)));
      handle.setAttribute("aria-label", current.panels[i]?.handleLabel ?? "Resize panels");
      handle.setAttribute("aria-controls", panelEls[i]?.id ?? "");
      handle.tabIndex = inert ? -1 : 0;
      if (inert) handle.setAttribute("aria-disabled", "true");
      else handle.removeAttribute("aria-disabled");
    });

    paintRoot();
  };

  const buildHandle = (handleIndex: number): HTMLDivElement => {
    const orientation = current.orientation ?? "horizontal";
    const horizontal = orientation === "horizontal";
    const handle = document.createElement("div");
    handle.id = `zen-splitter-handle-${++uid}`;
    handle.setAttribute("role", "separator");

    handle.className = cn(
      "zen-group zen-relative zen-flex zen-shrink-0 zen-items-center zen-justify-center",
      /* The hit area, and ONLY the hit area — it paints nothing itself. The line
         used to be this element, sized `w-px` with padding for touch; under
         border-box the padding eats the width, so the content box came out 0px
         and the divider was invisible. The line is its own child for that reason. */
      horizontal ? "zen-w-3 -zen-mx-1.5 zen-cursor-col-resize" : "zen-h-3 -zen-my-1.5 zen-cursor-row-resize",
      "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
      /* Or the page scrolls instead of the splitter moving. */
      "zen-touch-none",
      current.disabled && "zen-cursor-default zen-opacity-60",
    );

    /* The visible divider. */
    const line = document.createElement("span");
    line.setAttribute("aria-hidden", "true");
    line.className = cn(
      "zen-pointer-events-none zen-bg-zen-border zen-transition-colors",
      horizontal ? "zen-h-full zen-w-px" : "zen-h-px zen-w-full",
      !current.disabled && "group-hover:zen-bg-zen-primary group-focus-visible:zen-bg-zen-primary",
    );
    handle.append(line);

    let startPos = 0;
    let containerPx = 1;
    let baseSizes: number[] = [];
    /* Our own flag rather than `hasPointerCapture` as the gate: capture is an
       ENHANCEMENT, and setPointerCapture throws for a pointer id that is not
       active — gating the move on it turns one failed call into a dead control. */
    let active = false;

    const onPointerDown = (e: PointerEvent) => {
      if (current.disabled) return;
      /* preventDefault stops the drag selecting text — and it also suppresses the
         browser's focus-on-mousedown, so focus stays wherever it was. The effect
         is that clicking the divider then pressing an arrow scrolls the PAGE.
         Tabbing to it works, which is exactly why a Tab-based test misses this. */
      e.preventDefault();
      handle.focus();
      try {
        handle.setPointerCapture(e.pointerId);
      } catch {
        /* No capture; the drag still works, it just stops tracking if the pointer
           leaves the element. */
      }
      active = true;
      dragging = true;
      paintRoot();
      const horizontalNow = (current.orientation ?? "horizontal") === "horizontal";
      startPos = horizontalNow ? e.clientX : e.clientY;
      baseSizes = sizesNow();
      /* Measured ONCE per gesture. Measuring per move is what makes it feel heavy. */
      const box = handle.parentElement?.getBoundingClientRect();
      containerPx = Math.max(1, horizontalNow ? (box?.width ?? 1) : (box?.height ?? 1));
    };

    const onPointerMove = (e: PointerEvent) => {
      if (current.disabled || !active) return;
      const horizontalNow = (current.orientation ?? "horizontal") === "horizontal";
      const pos = horizontalNow ? e.clientX : e.clientY;
      /* Total movement since pointerdown, NOT since the last event. Accumulating
         steps against the clamped result loses the overshoot: a pointer dragged
         well past a panel's min leaves the size pinned there, so the position
         never travels far enough for a collapse to snap. */
      const deltaPct = ((pos - startPos) / containerPx) * 100;
      dragFrom(handleIndex, baseSizes, deltaPct, directionOf(handle));
    };

    const endDrag = (e: PointerEvent) => {
      if (!active) return;
      active = false;
      try {
        handle.releasePointerCapture(e.pointerId);
      } catch {
        /* Never captured, or already released. */
      }
      commit();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (current.disabled) return;
      const delta = splitterKeyDelta(e.key, current.orientation ?? "horizontal", e.shiftKey);
      if (delta === null) return;
      e.preventDefault();
      dragFrom(handleIndex, sizesNow(), delta, directionOf(handle));
      commit();
    };

    handle.addEventListener("pointerdown", onPointerDown);
    handle.addEventListener("pointermove", onPointerMove);
    handle.addEventListener("pointerup", endDrag);
    handle.addEventListener("pointercancel", endDrag);
    handle.addEventListener("keydown", onKeyDown);
    disposer.add(() => {
      handle.removeEventListener("pointerdown", onPointerDown);
      handle.removeEventListener("pointermove", onPointerMove);
      handle.removeEventListener("pointerup", endDrag);
      handle.removeEventListener("pointercancel", endDrag);
      handle.removeEventListener("keydown", onKeyDown);
    });

    return handle;
  };

  /** Structure. Runs on creation and whenever the panel COUNT changes. */
  const build = () => {
    el.replaceChildren();
    panelEls = [];
    handleEls = [];

    current.panels.forEach((spec, i) => {
      if (i > 0) {
        const handle = buildHandle(i - 1);
        handleEls.push(handle);
        el.append(handle);
      }
      const panel = document.createElement("div");
      panel.id = `zen-splitter-panel-${++uid}`;
      panel.className = cn("zen-min-h-0 zen-min-w-0 zen-overflow-auto", spec.class);
      setChildren(panel, spec.content);
      panelEls.push(panel);
      el.append(panel);
    });

    builtCount = current.panels.length;
  };

  const render = () => {
    if (current.panels.length !== builtCount) build();
    else {
      /* Same shape: refresh the contents in place so a drag-time update does not
         throw away the focused handle. */
      current.panels.forEach((spec, i) => {
        const panel = panelEls[i];
        if (!panel) return;
        panel.className = cn("zen-min-h-0 zen-min-w-0 zen-overflow-auto", spec.class);
        if (spec.content !== undefined) setChildren(panel, spec.content);
      });
    }
    paint();

    const {
      orientation: _o, panels: _pn, sizes: _s, defaultSizes: _d,
      onSizesChange: _c, onSizesCommit: _cm, disabled: _di,
      class: _cl, children: _ch,
      ...rest
    } = current;
    removeProps?.();
    removeProps = applyProps(el, rest as Record<string, unknown>);
  };

  render();
  disposer.add(() => removeProps?.());
  disposer.add(() => {
    if (frame) cancelAnimationFrame(frame);
  });

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
