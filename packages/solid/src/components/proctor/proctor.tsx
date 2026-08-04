import { createEffect, For, Show, type JSX } from "solid-js";
import { Dynamic } from "solid-js/web";
import { cn } from "../../lib/cn";
import { Badge } from "../badge/badge";

/**
 * ProctorStreamGrid and ProctorFlagOverlay — many live candidates on one screen,
 * and what each of them just did.
 *
 * **It displays; it does not detect.** No webcam is opened here, no face is
 * found, no tab switch is noticed. It takes `MediaStream`s you already have and
 * flags you already raised. That boundary is the whole design: detection is
 * hundreds of lines of computer vision with thresholds tuned to one product's
 * lighting and camera placement, and it would be wrong for the next one.
 *
 * The grid is a real responsive grid rather than a wrapping row of fixed-width
 * cards, with an explicit `max` — a live `<video>` costs a decoder, and a
 * hundred of them is a browser problem no layout fixes.
 */

export type ProctorFlagLevel = "info" | "warning" | "error";

export interface ProctorFlag {
  id: string;
  /** Short — it renders as a chip. */
  label: JSX.Element;
  level?: ProctorFlagLevel;
  /** Display string, as everywhere else in zen-ui — formatting is yours. */
  at?: string;
}

export interface ProctorParticipant {
  id: string;
  name: JSX.Element;
  detail?: JSX.Element;
  /** Live video. Omit for someone who has not connected yet. */
  stream?: MediaStream | null;
  /** Poster/thumbnail when there is no stream. */
  poster?: string;
  status?: "live" | "left" | "connecting";
  /** Newest first is the caller's job; the overlay shows the first few. */
  flags?: ProctorFlag[];
  muted?: boolean;
}

const STATUS_COLOR: Record<
  NonNullable<ProctorParticipant["status"]>,
  "success" | "neutral" | "warning"
> = { live: "success", left: "neutral", connecting: "warning" };

const FLAG_COLOR: Record<ProctorFlagLevel, "info" | "warning" | "error"> = {
  info: "info",
  warning: "warning",
  error: "error",
};

export interface ProctorFlagOverlayProps {
  flags: ProctorFlag[];
  /** How many chips before "+n more". Default 2 — a tile is small. */
  max?: number;
  class?: string;
}

/**
 * The flags over a tile. A gradient rather than a flat translucent bar, so a
 * white shirt behind it does not make the text unreadable — this sits over
 * arbitrary video and cannot assume a background.
 */
export const ProctorFlagOverlay = (props: ProctorFlagOverlayProps) => {
  const shown = () => props.flags.slice(0, props.max ?? 2);
  const rest = () => props.flags.length - shown().length;

  return (
    <Show when={props.flags.length > 0}>
      <div
        class={cn(
          "zen-pointer-events-none zen-absolute zen-inset-x-0 zen-bottom-0 zen-flex zen-flex-wrap zen-items-center zen-gap-1 zen-p-1.5",
          "zen-bg-gradient-to-t zen-from-black/70 zen-to-transparent",
          props.class,
        )}
      >
        <For each={shown()}>
          {(flag) => (
            <Badge variant="solid" color={FLAG_COLOR[flag.level ?? "warning"]}>
              {flag.label}
            </Badge>
          )}
        </For>
        <Show when={rest() > 0}>
          <Badge variant="soft" color="neutral">
            +{rest()} more
          </Badge>
        </Show>
      </div>
    </Show>
  );
};

/** Attaches a MediaStream without the element being re-created on every render. */
const StreamVideo = (props: {
  stream?: MediaStream | null;
  poster?: string;
  muted?: boolean;
  label: string;
}) => {
  let el: HTMLVideoElement | undefined;

  createEffect(() => {
    const stream = props.stream ?? null;
    if (!el) return;
    /* srcObject, never a blob URL: createObjectURL(MediaStream) is long removed,
       and assigning the same stream twice restarts playback. */
    if (el.srcObject !== stream) el.srcObject = stream;
  });

  return (
    <Show
      when={props.stream}
      fallback={
        <div class="zen-flex zen-h-full zen-w-full zen-items-center zen-justify-center zen-bg-zen-muted">
          <Show
            when={props.poster}
            fallback={<span class="zen-text-xs zen-text-zen-muted-fg">No video</span>}
          >
            <img src={props.poster} alt="" class="zen-h-full zen-w-full zen-object-cover" />
          </Show>
        </div>
      }
    >
      <video
        ref={el}
        autoplay
        playsinline
        /* Always muted by default: thirty unmuted candidate streams is a wall of
           noise and an instant feedback loop. */
        muted={props.muted ?? true}
        aria-label={props.label}
        class="zen-h-full zen-w-full zen-bg-black zen-object-cover"
      />
    </Show>
  );
};

export interface ProctorStreamGridProps {
  participants: ProctorParticipant[];
  /** Minimum tile width; the grid fits as many as will go. Default `"14rem"`. */
  minTileWidth?: string;
  /**
   * Render at most this many tiles. There is no virtualisation here — a live
   * `<video>` costs a decoder. The remainder is reported rather than silently
   * dropped.
   */
  max?: number;
  onSelect?: (participant: ProctorParticipant) => void;
  /** Per-tile actions — mute, chat, open the log. */
  renderActions?: (participant: ProctorParticipant) => JSX.Element;
  emptyMessage?: JSX.Element;
  class?: string;
}

export const ProctorStreamGrid = (props: ProctorStreamGridProps) => {
  const shown = () => (props.max ? props.participants.slice(0, props.max) : props.participants);
  const hidden = () => props.participants.length - shown().length;

  return (
    <Show
      when={props.participants.length > 0}
      fallback={
        <p class="zen-m-0 zen-py-6 zen-text-center zen-text-sm zen-text-zen-muted-fg">
          {props.emptyMessage ?? "Nobody is connected."}
        </p>
      }
    >
      <div class={cn("zen-flex zen-w-full zen-flex-col zen-gap-2", props.class)}>
        <ul
          class="zen-m-0 zen-grid zen-list-none zen-gap-3 zen-p-0"
          style={{
            "grid-template-columns": `repeat(auto-fill, minmax(${props.minTileWidth ?? "14rem"}, 1fr))`,
          }}
        >
          <For each={shown()}>
            {(p) => {
              const flags = () => p.flags ?? [];
              return (
                <li>
                  <Dynamic
                    component={props.onSelect ? "button" : "div"}
                    {...(props.onSelect
                      ? { type: "button", onClick: () => props.onSelect?.(p) }
                      : {})}
                    class={cn(
                      "zen-w-full zen-overflow-hidden zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-text-start",
                      props.onSelect &&
                        "zen-cursor-pointer hover:zen-border-zen-primary focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
                      /* A tile with an error flag gets a border, not just a chip
                         — it must be findable while scanning thirty of them. */
                      flags().some((f) => f.level === "error") && "zen-border-zen-error",
                    )}
                  >
                    <div class="zen-relative zen-aspect-video zen-w-full">
                      <StreamVideo
                        stream={p.stream}
                        poster={p.poster}
                        muted={p.muted}
                        label={typeof p.name === "string" ? `${p.name} video` : "Candidate video"}
                      />
                      <span class="zen-absolute zen-start-1 zen-top-1">
                        <Badge variant="solid" color={STATUS_COLOR[p.status ?? "live"]}>
                          {p.status ?? "live"}
                        </Badge>
                      </span>
                      <ProctorFlagOverlay flags={flags()} />
                    </div>

                    <div class="zen-flex zen-items-center zen-gap-2 zen-px-2 zen-py-1.5">
                      <span class="zen-min-w-0 zen-flex-1">
                        <span class="zen-block zen-truncate zen-text-sm zen-font-medium zen-text-zen-foreground">
                          {p.name}
                        </span>
                        <Show when={p.detail}>
                          <span class="zen-block zen-truncate zen-text-xs zen-text-zen-muted-fg">
                            {p.detail}
                          </span>
                        </Show>
                      </span>
                      <Show when={flags().length > 0}>
                        <span class="zen-shrink-0 zen-text-xs zen-tabular-nums zen-text-zen-error">
                          {flags().length}
                          <span class="zen-sr-only"> flags raised</span>
                        </span>
                      </Show>
                      <Show when={props.renderActions}>
                        <span class="zen-shrink-0">{props.renderActions?.(p)}</span>
                      </Show>
                    </div>
                  </Dynamic>
                </li>
              );
            }}
          </For>
        </ul>

        {/* Never silently truncate — a proctor who thinks they can see everyone
            and cannot is worse off than one who knows they are looking at 24. */}
        <Show when={hidden() > 0}>
          <p class="zen-m-0 zen-text-xs zen-text-zen-muted-fg">
            Showing {shown().length} of {props.participants.length}. {hidden()} not rendered.
          </p>
        </Show>
      </div>
    </Show>
  );
};
