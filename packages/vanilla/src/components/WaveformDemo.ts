import { formatMediaTime, type MediaRange, type WaveformClip } from "@algorisys/zen-ui-core";
import { Waveform } from "./waveform/waveform";
import { MediaTimeline } from "./media-timeline/media-timeline";
import { Slider } from "./form/slider/slider";
import { DemoPage } from "./demo-helpers";

// Peaks come from the app (decode once, store numbers 0..1) — the component
// never touches audio. A deterministic fake stands in for a decoded file.
const PEAKS = Array.from({ length: 240 }, (_, i) =>
  Math.min(1, 0.12 + 0.85 * Math.abs(Math.sin(i / 6.3) * Math.sin(i / 23))),
);

const fmtClip = (c: WaveformClip) =>
  `offset ${c.offset.toFixed(1)}s · audio ${c.start.toFixed(1)}–${c.end.toFixed(1)}s`;

const readout = (): HTMLDivElement => {
  const div = document.createElement("div");
  div.className = "zen-text-xs zen-font-mono zen-text-zen-muted-fg";
  return div;
};

const column = (...children: Node[]): HTMLDivElement => {
  const div = document.createElement("div");
  div.className = "zen-flex zen-w-full zen-flex-col zen-gap-2";
  div.append(...children);
  return div;
};

export default function WaveformDemo(): HTMLElement {
  return DemoPage({
    title: "Waveform",
    description:
      "An audio lane: peaks rendered as a filled envelope, with an optional draggable clip window — move it to place the audio, drag its edges to trim. Peaks are plain numbers the app decodes; controlled-only, same drag grammar as MediaTimeline.",
    sections: [
      {
        title: "1. Lane",
        codeTitle: "peaks in, envelope out — click to seek",
        codeDescription:
          "peaks is a number[] 0..1 (decode your audio once, keep the numbers). The whole lane is the audio; hover shows a timestamp bubble and a click seeks.",
        code: `const wf = Waveform({
  peaks,               // number[] 0..1, from the app
  duration: 90,
  currentTime: 12,
  onSeek: (t) => wf.update({ currentTime: t }),
});`,
        render: () => {
          let time = 12;
          const info = readout();
          const paintInfo = () => {
            info.textContent = `playhead: ${formatMediaTime(time)}`;
          };
          const wf = Waveform({
            peaks: PEAKS,
            duration: 90,
            currentTime: time,
            onSeek: (t) => {
              time = t;
              wf.update({ currentTime: t });
              paintInfo();
            },
          });
          paintInfo();
          return column(wf.el, info);
        },
      },
      {
        title: "2. Clip window",
        codeTitle: "Place and trim a clip on the lane",
        codeDescription:
          "offset is where on the LANE the clip sits; start/end trim within the AUDIO (audioDuration). Drag the body to move it — the left edge trims in place, keeping the tail put. onClipInput per move, onClipCommit once on release. Keyboard: the body and both edges are focusable; arrows nudge.",
        code: `const wf = Waveform({
  peaks,
  duration: 90,          // the lane's axis
  audioDuration: 30,     // the audio behind the peaks
  clip: { offset: 20, start: 2, end: 18 },
  onClipInput: (c) => wf.update({ clip: c }),
  onClipChange: (c) => wf.update({ clip: c }),
  onClipCommit: (c) => pushHistory(c),
});`,
        render: () => {
          let clip: WaveformClip = { offset: 20, start: 2, end: 18 };
          let commits = 0;
          const info = readout();
          const paintInfo = () => {
            info.textContent = `${fmtClip(clip)} · commits: ${commits}`;
          };
          const wf = Waveform({
            peaks: PEAKS,
            duration: 90,
            audioDuration: 30,
            clip,
            onClipInput: (c) => {
              clip = c;
              wf.update({ clip: c });
              paintInfo();
            },
            onClipChange: (c) => {
              clip = c;
              wf.update({ clip: c });
              paintInfo();
            },
            onClipCommit: (c) => {
              clip = c;
              commits += 1;
              wf.update({ clip: c });
              paintInfo();
            },
          });
          paintInfo();
          return column(wf.el, info);
        },
      },
      {
        title: "3. Under a MediaTimeline",
        codeTitle: "One duration, one zoom — the lanes align",
        codeDescription:
          "Give both lanes the same duration and zoom and every second lands on the same pixel column, which is what makes a stacked video + audio editor read as one surface. The zoom control stays in the app.",
        code: `const tl = MediaTimeline({ duration: 60, zoom: 2, ranges, … });
const wf = Waveform({ duration: 60, zoom: 2, audioDuration: 27, clip, … });
Slider({
  value: [2], min: 1, max: 10, step: 0.5,
  onValueChange: ([z]) => { tl.update({ zoom: z }); wf.update({ zoom: z }); },
});`,
        render: () => {
          let ranges: MediaRange[] = [{ start: 15, end: 42 }];
          let clip: WaveformClip = { offset: 15, start: 0, end: 27 };
          let time = 20;
          const seek = (t: number) => {
            time = t;
            tl.update({ currentTime: time });
            wf.update({ currentTime: time });
          };
          const tl = MediaTimeline({
            duration: 60,
            ranges,
            activeIndex: 0,
            onRangesInput: (r) => {
              ranges = r;
              tl.update({ ranges: r });
            },
            onRangesChange: (r) => {
              ranges = r;
              tl.update({ ranges: r });
            },
            zoom: 2,
            currentTime: time,
            onSeek: seek,
          });
          const wf = Waveform({
            peaks: PEAKS,
            duration: 60,
            audioDuration: 27,
            clip,
            onClipInput: (c) => {
              clip = c;
              wf.update({ clip: c });
            },
            onClipChange: (c) => {
              clip = c;
              wf.update({ clip: c });
            },
            zoom: 2,
            currentTime: time,
            onSeek: seek,
          });
          const zoomLabel = document.createElement("span");
          zoomLabel.className = "zen-text-xs zen-font-mono zen-text-zen-muted-fg";
          zoomLabel.textContent = "2x";
          const slider = Slider({
            value: [2],
            min: 1,
            max: 10,
            step: 0.5,
            class: "zen-w-40",
            onValueChange: ([z]) => {
              tl.update({ zoom: z });
              wf.update({ zoom: z });
              slider.update({ value: [z] });
              zoomLabel.textContent = `${z}x`;
            },
          });
          const row = document.createElement("div");
          row.className = "zen-flex zen-items-center zen-gap-3";
          row.append(slider.el, zoomLabel);
          return column(row, tl.el, wf.el);
        },
      },
    ],
  });
}
