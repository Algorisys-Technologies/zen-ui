import {
  MIN_MEDIA_RANGE,
  type MediaRange,
  type MediaRangeMode,
  clampBadgePct,
  dragRangeEdge,
  formatMediaTime,
  moveRange,
} from "@algorisys/zen-ui-core";
import { cn } from "../../lib/cn";
import {
  applyProps,
  Disposer,
  toNodes,
  type BaseProps,
  type Child,
  type ZenComponent,
} from "../../lib/component";
import { Icon } from "../icon/icon";

/**
 * MediaTimeline — a filmstrip trim track. The vanilla port of the React
 * reference.
 *
 *   const tl = MediaTimeline({
 *     duration: video.duration,
 *     ranges,
 *     onRangesInput: (r) => tl.update({ ranges: r }),
 *     onSeek: (t) => (video.currentTime = t),
 *   });
 *   root.append(tl.el);
 *
 * Controlled-only, like every binding of this component: the factory never
 * mutates its own `ranges` — a drag emits `onRangesInput` per move (plus a
 * live `onSeek` under the dragged edge) and `onRangesCommit` once on release,
 * and the caller feeds the result back through `update()`. The clamp math is
 * core's `dragRangeEdge`, contract-tested in scripts/check-media.ts, so this
 * renderer stops a handle exactly where React and Solid do.
 *
 * `update()` is split the way the carousel splits render/paint: range ROWS are
 * rebuilt only when the COUNT changes; everything a drag touches (positions,
 * tints, aria values) is a targeted paint. That is not just economy — the
 * dragged handle holds pointer capture, and rebuilding it mid-drag would end
 * the drag.
 */

export interface MediaTimelineProps extends BaseProps {
  /** Total media length, seconds. The track maps [0, duration] to its width. */
  duration: number;
  /**
   * The spans. In `"partition"` mode: sorted, non-overlapping. In
   * `"independent"` mode: free — overlap allowed, z-order is array order.
   * The app owns the array either way (controlled).
   */
  ranges: MediaRange[];
  /**
   * How the ranges relate: `"partition"` (a trim track — edge drags clamp
   * against neighbours) or `"independent"` (an overlay-element lane — spans
   * move and overlap freely, bars carry labels/colors). Default "partition".
   */
  rangeMode?: MediaRangeMode;
  /**
   * Which range is highlighted; the remove affordance renders on it. `-1` (the
   * DOM's own selectedIndex convention) or omitted = none. In independent
   * mode, clicking empty track emits `onActiveIndexChange(-1)` — deselect.
   */
  activeIndex?: number;
  onActiveIndexChange?: (index: number) => void;
  /** Committed edits — keyboard nudges land here. */
  onRangesChange?: (ranges: MediaRange[]) => void;
  /** Per-pointermove during a drag, no history. Falls back to onRangesChange. */
  onRangesInput?: (ranges: MediaRange[]) => void;
  /** Once, when a handle drag ends — commit to history here. */
  onRangesCommit?: (ranges: MediaRange[]) => void;
  /** When provided, the active range shows a remove button that calls this. */
  onRangeRemove?: (index: number) => void;
  /** Click-to-seek, and live-seek under a dragged edge. */
  onSeek?: (time: number) => void;
  /** Double-click on the track. Whether that means "add a range" is the app's call. */
  onTrackDblClick?: (time: number) => void;
  /** Evenly-spread filmstrip images under the ranges. */
  thumbnails?: string[];
  /** Playhead position, seconds. Omit to hide the playhead. */
  currentTime?: number;
  /** Track width multiplier, >= 1; the track scrolls horizontally when > 1. */
  zoom?: number;
  /** Smallest span a drag can shrink a range to. Default 0.1s. */
  minRangeDuration?: number;
  /** Timestamp formatter for tooltips. Default formatMediaTime (HH:MM:SS.cc). */
  formatTime?: (seconds: number) => string;
  /**
   * Colour treatment for a range. Replaces the default primary tint + ring —
   * the positioning stays. This is the "a range is just a range" hook.
   * Precedence: rangeClass > rangeColor > default.
   */
  rangeClass?: (index: number, active: boolean) => string;
  /**
   * A CSS color per range (any color — class tokens cannot express arbitrary
   * hex). The component derives the fill (color-mix, 40% active / 25% not)
   * and an inset ring (full color, 2px active / 1px not), and paints the edge
   * handles with it. `rangeClass` wins if both are provided.
   */
  rangeColor?: (index: number, active: boolean) => string;
  /**
   * Rendered inside the bar — element text, a clip name. Truncated, and
   * pointer-events: none so the body-drag surface stays whole.
   */
  rangeLabel?: (index: number) => Child;
  /** Names the timeline for a screen reader. */
  label?: string;
}

// The tints are inline color-mix, not utilities: token colours are opaque
// var(--zen-color-*), so there is no slash-opacity to reach for, and the
// filmstrip must stay readable through a range.
const tint = (pct: number) => `color-mix(in srgb, var(--zen-color-primary) ${pct}%, transparent)`;

const BADGE_CLASS = cn(
  "zen-absolute zen-top-0.5 -zen-translate-x-1/2 zen-whitespace-nowrap zen-rounded-zen-sm",
  "zen-bg-zen-foreground zen-px-1.5 zen-text-xs zen-font-mono zen-text-zen-background",
  "zen-pointer-events-none zen-z-20",
);

const HANDLE_CLASS = (edge: "start" | "end") =>
  cn(
    "zen-absolute zen-top-0 zen-h-full zen-w-3 zen-cursor-ew-resize",
    "zen-bg-zen-primary hover:zen-opacity-80",
    "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
    edge === "start" ? "zen-left-0" : "zen-right-0",
  );

interface Row {
  root: HTMLDivElement;
  handles: Record<"start" | "end", HTMLDivElement>;
  removeBtn: HTMLButtonElement | null;
  labelInner: HTMLSpanElement | null;
  /** Last label value rendered, so paint() can skip identical content. */
  lastLabel: Child | undefined;
}

export function MediaTimeline(props: MediaTimelineProps): ZenComponent<MediaTimelineProps> {
  let current: MediaTimelineProps = { ...props };
  const disposer = new Disposer();
  const rowCleanups = new Disposer();
  let removeProps: (() => void) | undefined;

  let dragging: { index: number; edge: "start" | "end" | "move" } | null = null;
  let draggedRanges: MediaRange[] | null = null;
  let suppressClick = false;
  // Lane-time distance from the grab point to the range's start, so a body
  // drag holds the bar where it was grabbed instead of snapping start there.
  let grabDelta = 0;

  const fmt = (s: number) => (current.formatTime ?? formatMediaTime)(s);
  const minDur = () => current.minRangeDuration ?? MIN_MEDIA_RANGE;
  const mode = () => current.rangeMode ?? "partition";
  const independent = () => mode() === "independent";
  const toPct = (time: number) => (time / current.duration) * 100;
  const toTime = (clientX: number) => {
    const rect = track.getBoundingClientRect();
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)) * current.duration;
  };

  const el = document.createElement("div");
  const scroll = document.createElement("div");
  scroll.className = "zen-w-full zen-overflow-x-auto zen-rounded-zen-md";
  const track = document.createElement("div");
  // Time axes read left-to-right even in RTL locales — every editor's.
  track.setAttribute("dir", "ltr");
  track.setAttribute("role", "group");
  // className is painted (not fixed here): the height is a per-mode default —
  // overlay lanes are shorter than filmstrip tracks.
  scroll.append(track);
  el.append(scroll);

  let thumbLayer: HTMLDivElement | null = null;
  let renderedThumbs: string[] | undefined;

  const playhead = document.createElement("div");
  playhead.className =
    "zen-absolute zen-top-0 zen-h-full zen-w-px zen-bg-zen-foreground zen-pointer-events-none zen-z-10";

  const hoverBadge = document.createElement("div");
  hoverBadge.className = BADGE_CLASS;
  hoverBadge.style.display = "none";
  const dragBadge = document.createElement("div");
  dragBadge.className = BADGE_CLASS;
  dragBadge.style.display = "none";
  track.append(playhead, hoverBadge, dragBadge);

  let rows: Row[] = [];

  const emitInput = (ranges: MediaRange[]) =>
    (current.onRangesInput ?? current.onRangesChange)?.(ranges);

  const onPointerMove = (e: PointerEvent) => {
    if (!dragging) {
      const t = toTime(e.clientX);
      hoverBadge.textContent = fmt(t);
      hoverBadge.style.left = `${clampBadgePct(toPct(t))}%`;
      hoverBadge.style.display = "";
      return;
    }
    e.preventDefault();
    if (dragging.edge === "move") {
      const { ranges, start } = moveRange(
        current.ranges,
        dragging.index,
        toTime(e.clientX) - grabDelta,
        current.duration,
      );
      draggedRanges = ranges;
      const r = ranges[dragging.index];
      dragBadge.textContent = `${fmt(start)} · ${(r.end - r.start).toFixed(1)}s`;
      dragBadge.style.left = `${clampBadgePct(toPct(start))}%`;
      dragBadge.style.display = "";
      emitInput(ranges);
      return;
    }
    const { ranges, edgeTime } = dragRangeEdge(
      current.ranges,
      dragging.index,
      dragging.edge,
      toTime(e.clientX),
      current.duration,
      minDur(),
      mode(),
    );
    draggedRanges = ranges;
    const r = ranges[dragging.index];
    dragBadge.textContent = `${fmt(edgeTime)} · ${(r.end - r.start).toFixed(1)}s`;
    dragBadge.style.left = `${clampBadgePct(toPct(edgeTime))}%`;
    dragBadge.style.display = "";
    emitInput(ranges);
    current.onSeek?.(edgeTime);
  };

  const onPointerUp = () => {
    // Bail when no drag is in flight — mirrors React/Solid, where touching
    // state here suppressed the click that follows a plain mousedown/up.
    if (!dragging) return;
    if (draggedRanges) {
      current.onRangesCommit?.(draggedRanges);
      suppressClick = true;
    }
    dragging = null;
    draggedRanges = null;
    dragBadge.style.display = "none";
    // The grabbing cursor follows the drag state, which paint() owns.
    paint();
  };

  const onClick = (e: MouseEvent) => {
    if (suppressClick) {
      suppressClick = false;
      return;
    }
    // An overlay lane's empty track is the deselect surface (bars stop their
    // clicks), and the click still seeks — StudioX's grammar.
    if (independent()) current.onActiveIndexChange?.(-1);
    current.onSeek?.(toTime(e.clientX));
  };

  const onDblClick = (e: MouseEvent) => current.onTrackDblClick?.(toTime(e.clientX));
  const onPointerLeave = () => {
    hoverBadge.style.display = "none";
  };
  // A drag's own ending click targets the captured handle and is stopped by
  // the row's click handler, so it never reaches the track — without this
  // reset the armed suppressClick would swallow the NEXT genuine track click.
  const onTrackPointerDown = () => {
    suppressClick = false;
  };

  track.addEventListener("pointerdown", onTrackPointerDown);
  track.addEventListener("pointermove", onPointerMove);
  track.addEventListener("pointerup", onPointerUp);
  track.addEventListener("click", onClick);
  track.addEventListener("dblclick", onDblClick);
  track.addEventListener("pointerleave", onPointerLeave);
  disposer.add(() => {
    track.removeEventListener("pointerdown", onTrackPointerDown);
    track.removeEventListener("pointermove", onPointerMove);
    track.removeEventListener("pointerup", onPointerUp);
    track.removeEventListener("click", onClick);
    track.removeEventListener("dblclick", onDblClick);
    track.removeEventListener("pointerleave", onPointerLeave);
  });

  const buildRow = (index: number): Row => {
    const root = document.createElement("div");
    const rowClick = (e: MouseEvent) => {
      e.stopPropagation();
      current.onActiveIndexChange?.(index);
    };
    root.addEventListener("click", rowClick);
    rowCleanups.add(() => root.removeEventListener("click", rowClick));

    // Body-drag is independent-mode-only: moving a partition range through
    // its neighbours has no defined meaning, so a partition body stays a
    // click target and nothing more.
    const bodyDown = (e: PointerEvent) => {
      if (!independent()) return;
      e.preventDefault();
      e.stopPropagation();
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      grabDelta = toTime(e.clientX) - current.ranges[index].start;
      dragging = { index, edge: "move" };
      draggedRanges = null;
      hoverBadge.style.display = "none";
      current.onActiveIndexChange?.(index);
      paint();
    };
    const bodyKey = (e: KeyboardEvent) => {
      if (!independent()) return;
      const dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (!dir) return;
      e.preventDefault();
      const { ranges } = moveRange(
        current.ranges,
        index,
        current.ranges[index].start + dir * (e.shiftKey ? 1 : minDur()),
        current.duration,
      );
      current.onRangesChange?.(ranges);
    };
    root.addEventListener("pointerdown", bodyDown);
    root.addEventListener("keydown", bodyKey);
    rowCleanups.add(() => {
      root.removeEventListener("pointerdown", bodyDown);
      root.removeEventListener("keydown", bodyKey);
    });

    const handles = {} as Row["handles"];
    for (const edge of ["start", "end"] as const) {
      const h = document.createElement("div");
      h.setAttribute("role", "slider");
      h.tabIndex = 0;
      h.setAttribute("aria-orientation", "horizontal");
      h.setAttribute("aria-label", `Range ${index + 1} ${edge}`);
      h.className = HANDLE_CLASS(edge);
      const down = (e: PointerEvent) => {
        e.preventDefault();
        e.stopPropagation();
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
        dragging = { index, edge };
        draggedRanges = null;
        hoverBadge.style.display = "none";
        current.onActiveIndexChange?.(index);
      };
      const key = (e: KeyboardEvent) => {
        const dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
        if (!dir) return;
        e.preventDefault();
        const range = current.ranges[index];
        const from = edge === "start" ? range.start : range.end;
        const { ranges } = dragRangeEdge(
          current.ranges,
          index,
          edge,
          from + dir * (e.shiftKey ? 1 : minDur()),
          current.duration,
          minDur(),
        );
        current.onRangesChange?.(ranges);
      };
      h.addEventListener("pointerdown", down);
      h.addEventListener("keydown", key);
      rowCleanups.add(() => {
        h.removeEventListener("pointerdown", down);
        h.removeEventListener("keydown", key);
      });
      handles[edge] = h;
      root.append(h);
    }

    let labelInner: HTMLSpanElement | null = null;
    if (current.rangeLabel) {
      const wrap = document.createElement("span");
      wrap.className =
        "zen-pointer-events-none zen-absolute zen-inset-0 zen-flex zen-items-center zen-px-3 zen-text-xs zen-text-zen-foreground";
      labelInner = document.createElement("span");
      labelInner.className = "zen-truncate";
      wrap.append(labelInner);
      root.append(wrap);
    }

    let removeBtn: HTMLButtonElement | null = null;
    if (current.onRangeRemove) {
      removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.setAttribute("aria-label", `Remove range ${index + 1}`);
      removeBtn.className = cn(
        "zen-absolute zen-top-1 zen-left-1/2 -zen-translate-x-1/2 zen-z-10",
        "zen-flex zen-h-4 zen-w-4 zen-cursor-pointer zen-items-center zen-justify-center",
        "zen-rounded-zen-full zen-border zen-border-zen-border zen-bg-zen-background zen-p-0",
        "zen-text-zen-muted-fg hover:zen-border-zen-error hover:zen-bg-zen-error hover:zen-text-zen-error-fg",
        "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
      );
      removeBtn.append(Icon({ name: "x", size: 10 }).el);
      const remove = (e: MouseEvent) => {
        e.stopPropagation();
        current.onRangeRemove?.(index);
      };
      // Stop the pointerdown too: in independent mode the bar body starts a
      // drag on pointerdown, and a drag started under this button would eat
      // its own click.
      const removeDown = (e: PointerEvent) => e.stopPropagation();
      removeBtn.addEventListener("click", remove);
      removeBtn.addEventListener("pointerdown", removeDown);
      rowCleanups.add(() => {
        removeBtn?.removeEventListener("click", remove);
        removeBtn?.removeEventListener("pointerdown", removeDown);
      });
      root.append(removeBtn);
    }

    track.append(root);
    return { root, handles, removeBtn, labelInner, lastLabel: undefined };
  };

  /** Rebuild the range rows. Only on COUNT change — never mid-drag. */
  const renderRanges = () => {
    rowCleanups.dispose();
    for (const row of rows) row.root.remove();
    rows = current.ranges.map((_, i) => buildRow(i));
  };

  const renderThumbs = () => {
    thumbLayer?.remove();
    thumbLayer = null;
    renderedThumbs = current.thumbnails;
    if (!current.thumbnails?.length) return;
    thumbLayer = document.createElement("div");
    thumbLayer.setAttribute("aria-hidden", "true");
    thumbLayer.className =
      "zen-absolute zen-inset-0 zen-flex zen-overflow-hidden zen-opacity-60 zen-pointer-events-none";
    for (const url of current.thumbnails) {
      const img = document.createElement("img");
      img.src = url;
      img.alt = "";
      img.draggable = false;
      img.className = "zen-h-full zen-shrink-0 zen-object-cover";
      img.style.width = `${100 / current.thumbnails.length}%`;
      thumbLayer.append(img);
    }
    // Behind the playhead, badges and rows — first child keeps DOM order = paint order.
    track.prepend(thumbLayer);
  };

  /** Everything a drag or a prop tweak touches. Cheap; no listeners, no nodes. */
  const paint = () => {
    el.className = cn("zen-flex zen-w-full zen-flex-col", current.class);
    removeProps?.();
    removeProps = applyProps(el, pickRest());

    track.setAttribute("aria-label", current.label ?? "Media timeline");
    track.className = cn(
      // Overlay lanes are shorter than filmstrip tracks — a per-mode default,
      // because the caller's `class` lands on the ROOT element.
      independent() ? "zen-h-10" : "zen-h-14",
      "zen-relative zen-select-none zen-overflow-hidden zen-rounded-zen-md",
      "zen-border zen-border-zen-border zen-bg-zen-muted zen-cursor-crosshair",
    );
    track.style.width = `${(current.zoom ?? 1) * 100}%`;
    track.style.minWidth = "100%";

    if (current.currentTime !== undefined && current.duration > 0) {
      playhead.style.left = `${toPct(current.currentTime)}%`;
      playhead.style.display = "";
    } else {
      playhead.style.display = "none";
    }

    rows.forEach((row, i) => {
      const range = current.ranges[i];
      if (!range) return;
      const active = i === current.activeIndex;
      const custom = current.rangeClass?.(i, active);
      // Precedence: rangeClass > rangeColor > default primary tint.
      const color = custom ? undefined : current.rangeColor?.(i, active);
      const moving = dragging !== null && dragging.edge === "move" && dragging.index === i;
      row.root.className = cn(
        "zen-absolute",
        independent()
          ? cn(
              "zen-top-1 zen-bottom-1 zen-rounded-zen-sm zen-overflow-hidden",
              moving ? "zen-cursor-grabbing" : "zen-cursor-grab",
              // Outline, not ring: the colour treatment owns the bar's
              // box-shadow inline, and an inline style would silently beat a
              // focus ring built from box-shadow.
              "focus-visible:zen-outline focus-visible:zen-outline-2 focus-visible:zen-outline-zen-ring",
            )
          : "zen-top-0 zen-h-full",
        custom ??
          (color
            ? ""
            : active
              ? "zen-ring-2 zen-ring-zen-primary"
              : "zen-ring-1 zen-ring-zen-primary"),
      );
      row.root.style.left = `${toPct(range.start)}%`;
      row.root.style.width = `${toPct(range.end - range.start)}%`;
      // A sliver of a span must stay visible and grabbable.
      row.root.style.minWidth = independent() ? "4px" : "";
      row.root.style.background = custom ? "" : color ? colorTint(color, active ? 40 : 25) : tint(active ? 40 : 20);
      row.root.style.boxShadow = !custom && color ? `inset 0 0 0 ${active ? 2 : 1}px ${color}` : "";
      if (independent()) {
        row.root.setAttribute("role", "slider");
        row.root.tabIndex = 0;
        row.root.setAttribute("aria-orientation", "horizontal");
        row.root.setAttribute("aria-label", `Range ${i + 1} position`);
        row.root.setAttribute("aria-valuemin", "0");
        row.root.setAttribute("aria-valuemax", String(current.duration - (range.end - range.start)));
        row.root.setAttribute("aria-valuenow", String(range.start));
        row.root.setAttribute("aria-valuetext", fmt(range.start));
      } else {
        row.root.removeAttribute("role");
        row.root.removeAttribute("tabindex");
        row.root.removeAttribute("aria-orientation");
        row.root.removeAttribute("aria-label");
        row.root.removeAttribute("aria-valuemin");
        row.root.removeAttribute("aria-valuemax");
        row.root.removeAttribute("aria-valuenow");
        row.root.removeAttribute("aria-valuetext");
      }
      for (const edge of ["start", "end"] as const) {
        const h = row.handles[edge];
        h.setAttribute("aria-valuemin", "0");
        h.setAttribute("aria-valuemax", String(current.duration));
        h.setAttribute("aria-valuenow", String(range[edge]));
        h.setAttribute("aria-valuetext", fmt(range[edge]));
        h.style.background = color ?? "";
      }
      if (row.labelInner && current.rangeLabel) {
        const value = current.rangeLabel(i);
        if (value !== row.lastLabel) {
          row.lastLabel = value;
          row.labelInner.replaceChildren(...toNodes(value));
        }
      }
      if (row.removeBtn) row.removeBtn.style.display = active ? "" : "none";
    });
  };

  /** color-mix fill for an arbitrary caller colour — see rangeColor. */
  const colorTint = (c: string, pct: number) =>
    `color-mix(in srgb, ${c} ${pct}%, transparent)`;

  /** BaseProps passthrough (id, style, data-*, aria-*) minus everything this factory owns. */
  const OWN_KEYS = new Set([
    "duration", "ranges", "rangeMode", "activeIndex", "onActiveIndexChange", "onRangesChange",
    "onRangesInput", "onRangesCommit", "onRangeRemove", "onSeek", "onTrackDblClick",
    "thumbnails", "currentTime", "zoom", "minRangeDuration", "formatTime",
    "rangeClass", "rangeColor", "rangeLabel", "label", "class",
  ]);
  const pickRest = (): Record<string, unknown> =>
    Object.fromEntries(
      Object.entries(current as unknown as Record<string, unknown>).filter(([k]) => !OWN_KEYS.has(k)),
    );

  renderThumbs();
  renderRanges();
  paint();
  disposer.add(() => rowCleanups.dispose());
  disposer.add(() => removeProps?.());

  return {
    el,
    update(next) {
      current = { ...current, ...next };
      // Rows carry index-bound listeners, the remove affordance and the label
      // span, so a count change or a presence change rebuilds them; a value
      // change never does.
      if (
        (next.ranges && next.ranges.length !== rows.length) ||
        "onRangeRemove" in next ||
        "rangeLabel" in next
      ) {
        renderRanges();
      }
      if ("thumbnails" in next && next.thumbnails !== renderedThumbs) renderThumbs();
      paint();
    },
    destroy() {
      disposer.dispose();
      el.remove();
    },
  };
}
