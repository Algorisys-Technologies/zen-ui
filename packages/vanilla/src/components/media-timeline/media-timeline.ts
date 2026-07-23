import {
  MIN_MEDIA_RANGE,
  type MediaRange,
  clampBadgePct,
  dragRangeEdge,
  formatMediaTime,
} from "@algorisys/zen-ui-core";
import { cn } from "../../lib/cn";
import { applyProps, Disposer, type BaseProps, type ZenComponent } from "../../lib/component";
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
  /** Sorted, non-overlapping spans. The app owns the array (controlled). */
  ranges: MediaRange[];
  /** Which range is highlighted; the remove affordance renders on it. */
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
   */
  rangeClass?: (index: number, active: boolean) => string;
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
}

export function MediaTimeline(props: MediaTimelineProps): ZenComponent<MediaTimelineProps> {
  let current: MediaTimelineProps = { ...props };
  const disposer = new Disposer();
  const rowCleanups = new Disposer();
  let removeProps: (() => void) | undefined;

  let dragging: { index: number; edge: "start" | "end" } | null = null;
  let draggedRanges: MediaRange[] | null = null;
  let suppressClick = false;

  const fmt = (s: number) => (current.formatTime ?? formatMediaTime)(s);
  const minDur = () => current.minRangeDuration ?? MIN_MEDIA_RANGE;
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
  track.className = cn(
    "zen-relative zen-h-14 zen-select-none zen-overflow-hidden zen-rounded-zen-md",
    "zen-border zen-border-zen-border zen-bg-zen-muted zen-cursor-crosshair",
  );
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
    const { ranges, edgeTime } = dragRangeEdge(
      current.ranges,
      dragging.index,
      dragging.edge,
      toTime(e.clientX),
      current.duration,
      minDur(),
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
  };

  const onClick = (e: MouseEvent) => {
    if (suppressClick) {
      suppressClick = false;
      return;
    }
    current.onSeek?.(toTime(e.clientX));
  };

  const onDblClick = (e: MouseEvent) => current.onTrackDblClick?.(toTime(e.clientX));
  const onPointerLeave = () => {
    hoverBadge.style.display = "none";
  };

  track.addEventListener("pointermove", onPointerMove);
  track.addEventListener("pointerup", onPointerUp);
  track.addEventListener("click", onClick);
  track.addEventListener("dblclick", onDblClick);
  track.addEventListener("pointerleave", onPointerLeave);
  disposer.add(() => {
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
      removeBtn.addEventListener("click", remove);
      rowCleanups.add(() => removeBtn?.removeEventListener("click", remove));
      root.append(removeBtn);
    }

    track.append(root);
    return { root, handles, removeBtn };
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
      row.root.className = cn(
        "zen-absolute zen-top-0 zen-h-full",
        custom ?? (active ? "zen-ring-2 zen-ring-zen-primary" : "zen-ring-1 zen-ring-zen-primary"),
      );
      row.root.style.left = `${toPct(range.start)}%`;
      row.root.style.width = `${toPct(range.end - range.start)}%`;
      row.root.style.background = custom ? "" : tint(active ? 40 : 20);
      for (const edge of ["start", "end"] as const) {
        const h = row.handles[edge];
        h.setAttribute("aria-valuemin", "0");
        h.setAttribute("aria-valuemax", String(current.duration));
        h.setAttribute("aria-valuenow", String(range[edge]));
        h.setAttribute("aria-valuetext", fmt(range[edge]));
      }
      if (row.removeBtn) row.removeBtn.style.display = active ? "" : "none";
    });
  };

  /** BaseProps passthrough (id, style, data-*, aria-*) minus everything this factory owns. */
  const OWN_KEYS = new Set([
    "duration", "ranges", "activeIndex", "onActiveIndexChange", "onRangesChange",
    "onRangesInput", "onRangesCommit", "onRangeRemove", "onSeek", "onTrackDblClick",
    "thumbnails", "currentTime", "zoom", "minRangeDuration", "formatTime",
    "rangeClass", "label", "class",
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
      // Rows carry index-bound listeners and the remove affordance, so a count
      // change or a presence change rebuilds them; a value change never does.
      if (
        (next.ranges && next.ranges.length !== rows.length) ||
        "onRangeRemove" in next
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
