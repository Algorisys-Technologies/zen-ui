import { formatMediaTime, type MediaRange, type WaveformClip } from "@algorisys/zen-ui-vanilla";
import { DemoPage } from "./demo-helpers";

/**
 * Waveform demo — the web-components port. `peaks` and `clip` are `json`
 * attributes for inline authoring and properties for real apps (a decoded
 * peaks array does not belong in HTML). The clip drag grammar arrives as
 * zen-clip-input / zen-clip-commit CustomEvents; feeding the detail back into
 * `el.clip` is the controlled loop.
 */

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

type WaveformEl = HTMLElement & { peaks: number[]; clip?: WaveformClip };
type MediaTimelineEl = HTMLElement & { ranges: MediaRange[] };

const detail = <T,>(e: Event): T => (e as CustomEvent).detail as T;

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
          "peaks is a number[] 0..1 (decode your audio once, keep the numbers). The whole lane is the audio; hover shows a timestamp bubble and a zen-seek click seeks.",
        code: `<zen-waveform duration="90" current-time="12"></zen-waveform>

el.peaks = decodedPeaks; // number[] 0..1, from the app
el.addEventListener("zen-seek", (e) =>
  el.setAttribute("current-time", e.detail));`,
        render: () => {
          let time = 12;
          const info = readout();
          const paintInfo = () => {
            info.textContent = `playhead: ${formatMediaTime(time)}`;
          };
          const el = document.createElement("zen-waveform") as WaveformEl;
          el.setAttribute("duration", "90");
          el.setAttribute("current-time", "12");
          el.peaks = PEAKS;
          el.addEventListener("zen-seek", (e) => {
            time = detail<number>(e);
            el.setAttribute("current-time", String(time));
            paintInfo();
          });
          paintInfo();
          return column(el, info);
        },
      },
      {
        title: "2. Clip window",
        codeTitle: "Place and trim a clip on the lane",
        codeDescription:
          "offset is where on the LANE the clip sits; start/end trim within the AUDIO (audio-duration). Drag the body to move it — the left edge trims in place, keeping the tail put. zen-clip-input per move, zen-clip-commit once on release. Keyboard: the body and both edges are focusable; arrows nudge.",
        code: `<zen-waveform duration="90" audio-duration="30"
  clip='{"offset":20,"start":2,"end":18}'></zen-waveform>

el.peaks = decodedPeaks;
el.addEventListener("zen-clip-input", (e) => (el.clip = e.detail));
el.addEventListener("zen-clip-commit", (e) => pushHistory(e.detail));`,
        render: () => {
          let clip: WaveformClip = { offset: 20, start: 2, end: 18 };
          let commits = 0;
          const info = readout();
          const paintInfo = () => {
            info.textContent = `${fmtClip(clip)} · commits: ${commits}`;
          };
          const el = document.createElement("zen-waveform") as WaveformEl;
          el.setAttribute("duration", "90");
          el.setAttribute("audio-duration", "30");
          el.peaks = PEAKS;
          el.clip = clip;
          el.addEventListener("zen-clip-input", (e) => {
            clip = detail<WaveformClip>(e);
            el.clip = clip;
            paintInfo();
          });
          el.addEventListener("zen-clip-change", (e) => {
            clip = detail<WaveformClip>(e);
            el.clip = clip;
            paintInfo();
          });
          el.addEventListener("zen-clip-commit", (e) => {
            clip = detail<WaveformClip>(e);
            commits += 1;
            el.clip = clip;
            paintInfo();
          });
          paintInfo();
          return column(el, info);
        },
      },
      {
        title: "3. Under a MediaTimeline",
        codeTitle: "One duration, one zoom — the lanes align",
        codeDescription:
          "Give both lanes the same duration and zoom and every second lands on the same pixel column, which is what makes a stacked video + audio editor read as one surface. The zoom control stays in the app.",
        code: `<zen-slider value="[2]" min="1" max="10" step="0.5"></zen-slider>
<zen-media-timeline duration="60" zoom="2"></zen-media-timeline>
<zen-waveform duration="60" zoom="2" audio-duration="27"></zen-waveform>

slider.addEventListener("zen-value-change", (e) => {
  tl.setAttribute("zoom", e.detail[0]);
  wf.setAttribute("zoom", e.detail[0]);
});`,
        render: () => {
          let ranges: MediaRange[] = [{ start: 15, end: 42 }];
          let clip: WaveformClip = { offset: 15, start: 0, end: 27 };
          const tl = document.createElement("zen-media-timeline") as MediaTimelineEl;
          tl.setAttribute("duration", "60");
          tl.setAttribute("active-index", "0");
          tl.setAttribute("zoom", "2");
          tl.setAttribute("current-time", "20");
          tl.ranges = ranges;
          const wf = document.createElement("zen-waveform") as WaveformEl;
          wf.setAttribute("duration", "60");
          wf.setAttribute("audio-duration", "27");
          wf.setAttribute("zoom", "2");
          wf.setAttribute("current-time", "20");
          wf.peaks = PEAKS;
          wf.clip = clip;
          const seek = (e: Event) => {
            const t = String(detail<number>(e));
            tl.setAttribute("current-time", t);
            wf.setAttribute("current-time", t);
          };
          tl.addEventListener("zen-seek", seek);
          wf.addEventListener("zen-seek", seek);
          tl.addEventListener("zen-ranges-input", (e) => {
            ranges = detail<MediaRange[]>(e);
            tl.ranges = ranges;
          });
          tl.addEventListener("zen-ranges-change", (e) => {
            ranges = detail<MediaRange[]>(e);
            tl.ranges = ranges;
          });
          wf.addEventListener("zen-clip-input", (e) => {
            clip = detail<WaveformClip>(e);
            wf.clip = clip;
          });
          wf.addEventListener("zen-clip-change", (e) => {
            clip = detail<WaveformClip>(e);
            wf.clip = clip;
          });
          const zoomLabel = document.createElement("span");
          zoomLabel.className = "zen-text-xs zen-font-mono zen-text-zen-muted-fg";
          zoomLabel.textContent = "2x";
          const slider = document.createElement("zen-slider");
          slider.setAttribute("value", "[2]");
          slider.setAttribute("min", "1");
          slider.setAttribute("max", "10");
          slider.setAttribute("step", "0.5");
          slider.className = "zen-w-40";
          slider.addEventListener("zen-value-change", (e) => {
            const [z] = detail<number[]>(e);
            tl.setAttribute("zoom", String(z));
            wf.setAttribute("zoom", String(z));
            zoomLabel.textContent = `${z}x`;
          });
          const row = document.createElement("div");
          row.className = "zen-flex zen-items-center zen-gap-3";
          row.append(slider, zoomLabel);
          return column(row, tl, wf);
        },
      },
    ],
  });
}
