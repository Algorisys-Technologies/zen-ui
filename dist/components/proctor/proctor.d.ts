import * as React from "react";
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
export declare const ProctorFlagOverlay: ({ flags, max, className }: ProctorFlagOverlayProps) => React.JSX.Element | null;
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
export declare const ProctorStreamGrid: ({ participants, minTileWidth, max, onSelect, renderActions, emptyMessage, className, }: ProctorStreamGridProps) => React.JSX.Element;
//# sourceMappingURL=proctor.d.ts.map