import { cn } from "../../lib/cn";
import { Badge } from "../badge/badge";
import { applyProps, Disposer, setChildren, toNodes, type BaseProps, type Child, type ZenComponent } from "../../lib/component";

/**
 * ProctorStreamGrid and ProctorFlagOverlay — many live candidates on one screen,
 * and what each of them just did.
 *
 *   ProctorStreamGrid({ participants: people, onSelect: (p) => open(p.id) }).el
 *
 * Vanilla port; see the React binding for the reasoning. Same API, same output.
 *
 * **It displays; it does not detect.** No webcam is opened here, no face is
 * found, no tab switch is noticed. It takes MediaStreams you already have and
 * flags you already raised, and puts them in a grid. Detection is 500 lines of
 * MediaPipe tuned to one product's lighting and camera placement, and it would be
 * wrong for the next one.
 *
 * The grid is a real responsive grid rather than a wrapping row of fixed-width
 * cards: with thirty candidates the flex-wrap version leaves a ragged last row
 * and no way to cap what is rendered.
 */

/** Severity of a raised flag. Mirrors the library's semantic colours. */
export type ProctorFlagLevel = "info" | "warning" | "error";

export interface ProctorFlag {
  id: string;
  /** Short — it renders as a chip. "Multiple faces", "Tab switch". */
  label: Child;
  level?: ProctorFlagLevel;
  /** Display string, as everywhere else in zen-ui — formatting is yours. */
  at?: string;
}

export interface ProctorParticipant {
  id: string;
  name: Child;
  /** Under the name — an email, a candidate number. */
  detail?: Child;
  /** Live video. Omit for someone who has not connected yet. */
  stream?: MediaStream | null;
  /** Poster/thumbnail when there is no stream. */
  poster?: string;
  status?: "live" | "left" | "connecting";
  /** Newest first is the caller's job; the overlay shows the first few. */
  flags?: ProctorFlag[];
  muted?: boolean;
}

const STATUS_COLOR: Record<NonNullable<ProctorParticipant["status"]>, "success" | "neutral" | "warning"> = {
  live: "success",
  left: "neutral",
  connecting: "warning",
};

const FLAG_COLOR: Record<ProctorFlagLevel, "info" | "warning" | "error"> = {
  info: "info",
  warning: "warning",
  error: "error",
};

export interface ProctorFlagOverlayProps extends BaseProps {
  flags: ProctorFlag[];
  /** How many chips before "+n more". Default 2 — a tile is small. */
  max?: number;
}

/**
 * The flags over a tile. A gradient rather than a flat translucent bar, so a
 * white shirt behind it does not make the text unreadable — this sits over
 * arbitrary video and cannot assume a background.
 */
export function ProctorFlagOverlay(props: ProctorFlagOverlayProps): ZenComponent<ProctorFlagOverlayProps> {
  let current: ProctorFlagOverlayProps = { ...props };
  const disposer = new Disposer();
  let removeProps: (() => void) | undefined;
  let chips: Array<{ destroy(): void }> = [];

  const el = document.createElement("div");

  const render = () => {
    const { flags, max = 2, class: className, children: _children, ...rest } = current;

    for (const c of chips) c.destroy();
    chips = [];
    el.replaceChildren();

    /* React returns null for an empty overlay; a factory cannot, because `el` was
       already handed out. An empty, unstyled, non-painting div is the closest
       honest equivalent — it must not draw the gradient over nothing. */
    if (flags.length === 0) {
      el.className = "";
      el.hidden = true;
    } else {
      el.hidden = false;
      el.className = cn(
        "zen-pointer-events-none zen-absolute zen-inset-x-0 zen-bottom-0 zen-flex zen-flex-wrap zen-items-center zen-gap-1 zen-p-1.5",
        "zen-bg-gradient-to-t zen-from-black/70 zen-to-transparent",
        className,
      );

      const shown = flags.slice(0, max);
      for (const flag of shown) {
        const chip = Badge({ variant: "solid", color: FLAG_COLOR[flag.level ?? "warning"], children: flag.label });
        chips.push(chip);
        el.append(chip.el);
      }
      const rest_ = flags.length - shown.length;
      if (rest_ > 0) {
        const more = Badge({ variant: "soft", color: "neutral", children: `+${rest_} more` });
        chips.push(more);
        el.append(more.el);
      }
    }

    removeProps?.();
    removeProps = applyProps(el, rest as Record<string, unknown>);
  };

  render();
  disposer.add(() => removeProps?.());
  disposer.add(() => {
    for (const c of chips) c.destroy();
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

export interface ProctorStreamGridProps extends BaseProps {
  participants: ProctorParticipant[];
  /** Minimum tile width; the grid fits as many as will go. Default `"14rem"`. */
  minTileWidth?: string;
  /**
   * Render at most this many tiles. There is no virtualisation here — a live
   * <video> costs a decoder, and a hundred of them is a browser problem no layout
   * fixes. The remainder is REPORTED rather than silently dropped.
   */
  max?: number;
  onSelect?: (participant: ProctorParticipant) => void;
  /** Per-tile actions — mute, chat, open the log. */
  renderActions?: (participant: ProctorParticipant) => Child;
  emptyMessage?: Child;
}

export function ProctorStreamGrid(props: ProctorStreamGridProps): ZenComponent<ProctorStreamGridProps> {
  let current: ProctorStreamGridProps = { ...props };
  const disposer = new Disposer();
  let removeProps: (() => void) | undefined;
  let parts: Array<{ destroy(): void }> = [];

  const el = document.createElement("div");

  /**
   * Video elements are kept ACROSS renders, keyed by participant id.
   *
   * Rebuilding one tears down its decoder and restarts playback, so a grid that
   * re-rendered for an unrelated flag would make thirty streams flash black at
   * once. Reusing the element is also what keeps `srcObject` assignment rare.
   */
  const videos = new Map<string, HTMLVideoElement>();

  const videoFor = (p: ProctorParticipant): HTMLElement => {
    if (!p.stream) {
      const box = document.createElement("div");
      box.className = "zen-flex zen-h-full zen-w-full zen-items-center zen-justify-center zen-bg-zen-muted";
      if (p.poster) {
        const img = document.createElement("img");
        img.src = p.poster;
        img.alt = "";
        img.className = "zen-h-full zen-w-full zen-object-cover";
        box.append(img);
      } else {
        const span = document.createElement("span");
        span.className = "zen-text-xs zen-text-zen-muted-fg";
        span.textContent = "No video";
        box.append(span);
      }
      return box;
    }

    let video = videos.get(p.id);
    if (!video) {
      video = document.createElement("video");
      video.autoplay = true;
      video.playsInline = true;
      video.className = "zen-h-full zen-w-full zen-bg-black zen-object-cover";
      videos.set(p.id, video);
    }
    /* Always muted by default: thirty unmuted candidate streams is a wall of
       noise and an instant feedback loop. */
    video.muted = p.muted ?? true;
    video.setAttribute("aria-label", typeof p.name === "string" ? `${p.name} video` : "Candidate video");
    /* srcObject, never a blob URL: createObjectURL(MediaStream) is long removed,
       and assigning the same stream twice restarts playback. */
    if (video.srcObject !== (p.stream ?? null)) video.srcObject = p.stream ?? null;
    return video;
  };

  const render = () => {
    const {
      participants, minTileWidth = "14rem", max, onSelect, renderActions, emptyMessage,
      class: className, children: _children,
      ...rest
    } = current;

    for (const p of parts) p.destroy();
    parts = [];
    el.replaceChildren();

    /* Streams for participants who have gone away must not keep decoders alive. */
    const live = new Set(participants.map((p) => p.id));
    for (const [id, video] of videos) {
      if (!live.has(id)) {
        video.srcObject = null;
        videos.delete(id);
      }
    }

    if (participants.length === 0) {
      el.className = cn(className);
      const p = document.createElement("p");
      p.className = "zen-m-0 zen-py-6 zen-text-center zen-text-sm zen-text-zen-muted-fg";
      p.append(...toNodes(emptyMessage ?? "Nobody is connected."));
      el.append(p);
      removeProps?.();
      removeProps = applyProps(el, rest as Record<string, unknown>);
      return;
    }

    el.className = cn("zen-flex zen-w-full zen-flex-col zen-gap-2", className);

    const shown = max ? participants.slice(0, max) : participants;
    const hidden = participants.length - shown.length;

    const ul = document.createElement("ul");
    ul.className = "zen-m-0 zen-grid zen-list-none zen-gap-3 zen-p-0";
    ul.style.gridTemplateColumns = `repeat(auto-fill, minmax(${minTileWidth}, 1fr))`;

    for (const p of shown) {
      const flags = p.flags ?? [];
      const li = document.createElement("li");

      const tile = document.createElement(onSelect ? "button" : "div");
      if (onSelect) {
        (tile as HTMLButtonElement).type = "button";
        const click = () => onSelect(p);
        tile.addEventListener("click", click);
        disposer.add(() => tile.removeEventListener("click", click));
      }
      tile.className = cn(
        "zen-w-full zen-overflow-hidden zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-text-start",
        onSelect &&
          "zen-cursor-pointer hover:zen-border-zen-primary focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
        /* A tile with an error flag gets a border, not just a chip — it must be
           findable while scanning thirty of them. */
        flags.some((f) => f.level === "error") && "zen-border-zen-error",
      );

      const frame = document.createElement("div");
      frame.className = "zen-relative zen-aspect-video zen-w-full";
      frame.append(videoFor(p));

      const statusWrap = document.createElement("span");
      statusWrap.className = "zen-absolute zen-start-1 zen-top-1";
      const status = Badge({
        variant: "solid",
        color: STATUS_COLOR[p.status ?? "live"],
        children: p.status ?? "live",
      });
      parts.push(status);
      statusWrap.append(status.el);
      frame.append(statusWrap);

      const overlay = ProctorFlagOverlay({ flags });
      parts.push(overlay);
      frame.append(overlay.el);
      tile.append(frame);

      const foot = document.createElement("div");
      foot.className = "zen-flex zen-items-center zen-gap-2 zen-px-2 zen-py-1.5";

      const names = document.createElement("span");
      names.className = "zen-min-w-0 zen-flex-1";
      const nameEl = document.createElement("span");
      nameEl.className = "zen-block zen-truncate zen-text-sm zen-font-medium zen-text-zen-foreground";
      setChildren(nameEl, p.name);
      names.append(nameEl);
      if (p.detail !== undefined && p.detail !== null) {
        const detail = document.createElement("span");
        detail.className = "zen-block zen-truncate zen-text-xs zen-text-zen-muted-fg";
        setChildren(detail, p.detail);
        names.append(detail);
      }
      foot.append(names);

      if (flags.length > 0) {
        const count = document.createElement("span");
        count.className = "zen-shrink-0 zen-text-xs zen-tabular-nums zen-text-zen-error";
        count.textContent = String(flags.length);
        const sr = document.createElement("span");
        sr.className = "zen-sr-only";
        sr.textContent = " flags raised";
        count.append(sr);
        foot.append(count);
      }

      if (renderActions) {
        const actions = document.createElement("span");
        actions.className = "zen-shrink-0";
        setChildren(actions, renderActions(p));
        foot.append(actions);
      }

      tile.append(foot);
      li.append(tile);
      ul.append(li);
    }

    el.append(ul);

    /* Never silently truncate — a proctor who thinks they can see everyone and
       cannot is worse off than one who knows they are looking at 24. */
    if (hidden > 0) {
      const note = document.createElement("p");
      note.className = "zen-m-0 zen-text-xs zen-text-zen-muted-fg";
      note.textContent = `Showing ${shown.length} of ${participants.length}. ${hidden} not rendered.`;
      el.append(note);
    }

    removeProps?.();
    removeProps = applyProps(el, rest as Record<string, unknown>);
  };

  render();
  disposer.add(() => removeProps?.());
  disposer.add(() => {
    for (const p of parts) p.destroy();
    /* Drop every stream reference so the decoders can go. */
    for (const video of videos.values()) video.srcObject = null;
    videos.clear();
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
