import { MediaTimeline, type MediaTimelineProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

// <zen-media-timeline duration="120" ranges='[{"start":8,"end":22}]'></zen-media-timeline>
// `ranges` is the primary data collection — a `json` attribute for inline
// authoring plus a property (like zen-slider's value). `thumbnails` is an array
// and `range-class`/`format-time` are functions, so they are JS properties.
// Data-driven: renders from props, takes no slot. The remove affordance is
// presence-gated on `onRangeRemove` — listening for `zen-range-remove` is what
// makes it appear (events are opt-in wired in the base class).
defineZenElement<MediaTimelineProps>({
  tag: "zen-media-timeline",
  factory: MediaTimeline,
  attrs: {
    duration: "number",
    ranges: "json",
    // "partition" (default) or "independent" — overlay-element lanes.
    "range-mode": "string",
    "active-index": "number",
    "current-time": "number",
    zoom: "number",
    "min-range-duration": "number",
    label: "string",
  },
  props: ["ranges", "thumbnails", "formatTime", "rangeClass", "rangeColor", "rangeLabel"],
  events: {
    onRangesChange: "zen-ranges-change",
    onRangesInput: "zen-ranges-input",
    onRangesCommit: "zen-ranges-commit",
    onActiveIndexChange: "zen-active-index-change",
    onRangeRemove: "zen-range-remove",
    onSeek: "zen-seek",
    onTrackDblClick: "zen-track-dblclick",
  },
  childrenProp: false,
});
