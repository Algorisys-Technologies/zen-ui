import { type JSX } from "solid-js";
import { type WaveformClip } from "@algorisys/zen-ui-core";
/**
 * Waveform — an audio lane: peaks rendered as a filled envelope, with an
 * optional draggable clip window (move to place, edge-drag to trim).
 *
 *   <Waveform
 *     peaks={peaks}                 // number[] 0..1, decoded by the app
 *     duration={video.duration}     // the lane's time axis
 *     audioDuration={audio.duration}
 *     clip={clip()}
 *     onClipInput={setClip}
 *     onClipCommit={commitToHistory}
 *     currentTime={playhead()}
 *   />
 *
 * The lane's axis is `duration` — under a MediaTimeline that is the VIDEO's
 * length, and giving both the same `zoom` keeps the lanes aligned. The clip's
 * `offset` lives on that axis; its `start`/`end` are trim points within the
 * AUDIO the peaks describe (`audioDuration`, defaults to `duration` for the
 * standalone case). Dragging the left edge moves offset and start together so
 * the clip's tail stays put — core's `dragClipEdge`, contract-tested in
 * scripts/check-media.ts.
 *
 * Assets come from the caller: `peaks` is plain numbers. Nothing here decodes
 * audio. Controlled-only, with the same Input/Commit drag grammar as
 * MediaTimeline.
 *
 * Mirrors the React binding's API.
 */
export type WaveformProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "class"> & {
    /** Peak amplitudes, 0..1, evenly spread across `audioDuration`. */
    peaks: number[];
    /** The lane's time axis, seconds — the video's length when composed. */
    duration: number;
    /** Length of the audio behind `peaks`. Defaults to `duration`. */
    audioDuration?: number;
    /** The clip window (controlled). Omit to render the whole lane as audio. */
    clip?: WaveformClip;
    /** Committed edits — keyboard nudges land here. */
    onClipChange?: (clip: WaveformClip) => void;
    /** Per-pointermove during a drag, no history. Falls back to onClipChange. */
    onClipInput?: (clip: WaveformClip) => void;
    /** Once, when a drag ends — commit to history here. */
    onClipCommit?: (clip: WaveformClip) => void;
    /** Click-to-seek on the lane, in lane time. */
    onSeek?: (time: number) => void;
    /** Playhead position in lane time. Omit to hide the playhead. */
    currentTime?: number;
    /** Lane width multiplier, >= 1. Match the MediaTimeline's to align lanes. */
    zoom?: number;
    /** Smallest span a trim can shrink the clip to. Default 0.1s. */
    minClipDuration?: number;
    /** Timestamp formatter for tooltips. Default formatMediaTime (HH:MM:SS.cc). */
    formatTime?: (seconds: number) => string;
    /** Colour treatment for the clip window. Replaces the default tint + ring. */
    clipClass?: string;
    /** Names the lane for a screen reader. */
    label?: string;
    class?: string;
};
export declare const Waveform: (props: WaveformProps) => JSX.Element;
//# sourceMappingURL=waveform.d.ts.map