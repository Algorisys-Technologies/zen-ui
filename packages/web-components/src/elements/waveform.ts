import { Waveform, type WaveformProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

// <zen-waveform duration="90" audio-duration="30" peaks="[0.2,0.8,…]"></zen-waveform>
// `peaks` and `clip` are the data collections — `json` attributes for inline
// authoring plus properties for real apps (a decoded peaks array does not
// belong in HTML). Data-driven: renders from props, takes no slot.
defineZenElement<WaveformProps>({
  tag: "zen-waveform",
  factory: Waveform,
  attrs: {
    duration: "number",
    "audio-duration": "number",
    peaks: "json",
    clip: "json",
    "current-time": "number",
    zoom: "number",
    "min-clip-duration": "number",
    label: "string",
  },
  props: ["peaks", "clip", "formatTime", "clipClass"],
  events: {
    onClipChange: "zen-clip-change",
    onClipInput: "zen-clip-input",
    onClipCommit: "zen-clip-commit",
    onSeek: "zen-seek",
  },
  childrenProp: false,
});
