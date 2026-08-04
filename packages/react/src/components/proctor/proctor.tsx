import * as React from "react";
import { cn } from "../../lib/cn";
import { Badge } from "../badge/badge";

/**
 * ProctorStreamGrid and ProctorFlagOverlay — many live candidates on one screen,
 * and what each of them just did.
 *
 *   <ProctorStreamGrid
 *     participants={people}
 *     onSelect={(p) => open(p.id)}
 *   />
 *
 * **It displays; it does not detect.** No webcam is opened here, no face is
 * found, no tab switch is noticed. It takes `MediaStream`s you already have and
 * flags you already raised, and puts them in a grid. That boundary is the whole
 * design: detection is 500 lines of MediaPipe with thresholds tuned to one
 * product's lighting and camera placement, and it would be wrong for the next
 * one. A design system that shipped it would make every consumer carry a
 * computer-vision dependency to render a card.
 *
 * The grid is a real responsive grid rather than a wrapping row of fixed-width
 * cards. With thirty candidates the flex-wrap version leaves a ragged last row
 * and no way to cap what is rendered; `columns` and `max` are here because a
 * proctor with a hundred live streams has a browser problem, not a layout one.
 */

/** Severity of a raised flag. Mirrors the library's semantic colours. */
export type ProctorFlagLevel = "info" | "warning" | "error";

export interface ProctorFlag {
  id: string;
  /** Short — it renders as a chip. "Multiple faces", "Tab switch". */
  label: React.ReactNode;
  level?: ProctorFlagLevel;
  /** Display string, as everywhere else in zen-ui — formatting is yours. */
  at?: string;
}

export interface ProctorParticipant {
  id: string;
  name: React.ReactNode;
  /** Under the name — an email, a candidate number. */
  detail?: React.ReactNode;
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

export interface ProctorFlagOverlayProps {
  flags: ProctorFlag[];
  /** How many chips before "+n more". Default 2 — a tile is small. */
  max?: number;
  className?: string;
}

/**
 * The flags over a tile. A gradient rather than a flat translucent bar, so a
 * white shirt behind it does not make the text unreadable — this sits over
 * arbitrary video and cannot assume a background.
 */
export const ProctorFlagOverlay = ({ flags, max = 2, className }: ProctorFlagOverlayProps) => {
  if (flags.length === 0) return null;
  const shown = flags.slice(0, max);
  const rest = flags.length - shown.length;

  return (
    <div
      className={cn(
        "zen-pointer-events-none zen-absolute zen-inset-x-0 zen-bottom-0 zen-flex zen-flex-wrap zen-items-center zen-gap-1 zen-p-1.5",
        "zen-bg-gradient-to-t zen-from-black/70 zen-to-transparent",
        className,
      )}
    >
      {shown.map((flag) => (
        <Badge key={flag.id} variant="solid" color={FLAG_COLOR[flag.level ?? "warning"]}>
          {flag.label}
        </Badge>
      ))}
      {rest > 0 ? (
        <Badge variant="soft" color="neutral">
          +{rest} more
        </Badge>
      ) : null}
    </div>
  );
};

/** Attaches a MediaStream without React re-creating the element on every render. */
const StreamVideo = ({
  stream,
  poster,
  muted,
  label,
}: {
  stream?: MediaStream | null;
  poster?: string;
  muted?: boolean;
  label: string;
}) => {
  const ref = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    /* srcObject, never a blob URL: createObjectURL(MediaStream) is long
       removed, and assigning the same stream twice restarts playback. */
    if (el.srcObject !== (stream ?? null)) el.srcObject = stream ?? null;
  }, [stream]);

  if (!stream) {
    return (
      <div className="zen-flex zen-h-full zen-w-full zen-items-center zen-justify-center zen-bg-zen-muted">
        {poster ? (
          <img src={poster} alt="" className="zen-h-full zen-w-full zen-object-cover" />
        ) : (
          <span className="zen-text-xs zen-text-zen-muted-fg">No video</span>
        )}
      </div>
    );
  }

  return (
    <video
      ref={ref}
      autoPlay
      playsInline
      /* Always muted by default: thirty unmuted candidate streams is a wall of
         noise and an instant feedback loop. */
      muted={muted ?? true}
      aria-label={label}
      className="zen-h-full zen-w-full zen-bg-black zen-object-cover"
    />
  );
};

export interface ProctorStreamGridProps {
  participants: ProctorParticipant[];
  /** Minimum tile width; the grid fits as many as will go. Default `"14rem"`. */
  minTileWidth?: string;
  /**
   * Render at most this many tiles. There is no virtualisation here — a live
   * `<video>` costs a decoder, and a hundred of them is a browser problem no
   * layout fixes. The remainder is reported rather than silently dropped.
   */
  max?: number;
  onSelect?: (participant: ProctorParticipant) => void;
  /** Per-tile actions — mute, chat, open the log. */
  renderActions?: (participant: ProctorParticipant) => React.ReactNode;
  emptyMessage?: React.ReactNode;
  className?: string;
}

export const ProctorStreamGrid = ({
  participants,
  minTileWidth = "14rem",
  max,
  onSelect,
  renderActions,
  emptyMessage,
  className,
}: ProctorStreamGridProps) => {
  const shown = max ? participants.slice(0, max) : participants;
  const hidden = participants.length - shown.length;

  if (participants.length === 0) {
    return (
      <p className="zen-m-0 zen-py-6 zen-text-center zen-text-sm zen-text-zen-muted-fg">
        {emptyMessage ?? "Nobody is connected."}
      </p>
    );
  }

  return (
    <div className={cn("zen-flex zen-w-full zen-flex-col zen-gap-2", className)}>
      <ul
        className="zen-m-0 zen-grid zen-list-none zen-gap-3 zen-p-0"
        style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${minTileWidth}, 1fr))` }}
      >
        {shown.map((p) => {
          const flags = p.flags ?? [];
          const Tile = onSelect ? "button" : "div";
          return (
            <li key={p.id}>
              <Tile
                {...(onSelect
                  ? { type: "button" as const, onClick: () => onSelect(p) }
                  : {})}
                className={cn(
                  "zen-w-full zen-overflow-hidden zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-text-start",
                  onSelect &&
                    "zen-cursor-pointer hover:zen-border-zen-primary focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
                  /* A tile with an error flag gets a border, not just a chip —
                     it must be findable while scanning thirty of them. */
                  flags.some((f) => f.level === "error") && "zen-border-zen-error",
                )}
              >
                <div className="zen-relative zen-aspect-video zen-w-full">
                  <StreamVideo
                    stream={p.stream}
                    poster={p.poster}
                    muted={p.muted}
                    label={typeof p.name === "string" ? `${p.name} video` : "Candidate video"}
                  />
                  <span className="zen-absolute zen-start-1 zen-top-1">
                    <Badge variant="solid" color={STATUS_COLOR[p.status ?? "live"]}>
                      {p.status ?? "live"}
                    </Badge>
                  </span>
                  <ProctorFlagOverlay flags={flags} />
                </div>

                <div className="zen-flex zen-items-center zen-gap-2 zen-px-2 zen-py-1.5">
                  <span className="zen-min-w-0 zen-flex-1">
                    <span className="zen-block zen-truncate zen-text-sm zen-font-medium zen-text-zen-foreground">
                      {p.name}
                    </span>
                    {p.detail ? (
                      <span className="zen-block zen-truncate zen-text-xs zen-text-zen-muted-fg">
                        {p.detail}
                      </span>
                    ) : null}
                  </span>
                  {flags.length > 0 ? (
                    <span className="zen-shrink-0 zen-text-xs zen-tabular-nums zen-text-zen-error">
                      {flags.length}
                      <span className="zen-sr-only"> flags raised</span>
                    </span>
                  ) : null}
                  {renderActions ? (
                    <span className="zen-shrink-0">{renderActions(p)}</span>
                  ) : null}
                </div>
              </Tile>
            </li>
          );
        })}
      </ul>

      {/* Never silently truncate — a proctor who thinks they can see everyone
          and cannot is worse off than one who knows they are looking at 24. */}
      {hidden > 0 ? (
        <p className="zen-m-0 zen-text-xs zen-text-zen-muted-fg">
          Showing {shown.length} of {participants.length}. {hidden} not rendered.
        </p>
      ) : null}
    </div>
  );
};
