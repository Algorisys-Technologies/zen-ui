import { useState } from "react";
import { formatMediaTime, type MediaRange, type WaveformClip } from "@algorisys/zen-ui-core";
import { Waveform } from "./waveform/waveform";
import { MediaTimeline } from "./media-timeline/media-timeline";
import { Slider } from "./form/slider/slider";
import { CodeExample } from "./demo-helpers";

// Peaks come from the app (decode once, store numbers 0..1) — the component
// never touches audio. A deterministic fake stands in for a decoded file.
const PEAKS = Array.from({ length: 240 }, (_, i) =>
  Math.min(1, 0.12 + 0.85 * Math.abs(Math.sin(i / 6.3) * Math.sin(i / 23))),
);

const fmtClip = (c: WaveformClip) =>
  `offset ${c.offset.toFixed(1)}s · audio ${c.start.toFixed(1)}–${c.end.toFixed(1)}s`;

const NewWaveformDemo: React.FC = () => {
  const [time, setTime] = useState(12);

  const [clip, setClip] = useState<WaveformClip>({ offset: 20, start: 2, end: 18 });
  const [commits, setCommits] = useState(0);

  const [zoom, setZoom] = useState([2]);
  const [ranges, setRanges] = useState<MediaRange[]>([{ start: 15, end: 42 }]);
  const [laneClip, setLaneClip] = useState<WaveformClip>({ offset: 15, start: 0, end: 27 });
  const [laneTime, setLaneTime] = useState(20);

  return (
    <div className="demo-page">
      <h1>Waveform</h1>
      <p className="lede">
        An audio lane: peaks rendered as a filled envelope, with an optional draggable clip window —
        move it to place the audio, drag its edges to trim. Peaks are plain numbers the app decodes;
        controlled-only, same drag grammar as MediaTimeline.
      </p>

      <section className="demo-section">
        <h2>Lane</h2>
        <CodeExample
          title="peaks in, envelope out — click to seek"
          description="peaks is a number[] 0..1 (decode your audio once, keep the numbers). The whole lane is the audio; hover shows a timestamp bubble and a click seeks."
          code={`const peaks = decodedPeaks; // number[] 0..1, from the app

<Waveform
  peaks={peaks}
  duration={90}
  currentTime={time}
  onSeek={setTime}
/>`}
        >
          <div className="zen-flex zen-w-full zen-flex-col zen-gap-2">
            <Waveform peaks={PEAKS} duration={90} currentTime={time} onSeek={setTime} />
            <div className="zen-text-xs zen-font-mono zen-text-zen-muted-fg">
              playhead: {formatMediaTime(time)}
            </div>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>Clip window</h2>
        <CodeExample
          title="Place and trim a clip on the lane"
          description="offset is where on the LANE the clip sits; start/end trim within the AUDIO (audioDuration). Drag the body to move it — the left edge trims in place, keeping the tail put. onClipInput per move, onClipCommit once on release. Keyboard: the body and both edges are focusable; arrows nudge."
          code={`const [clip, setClip] = useState<WaveformClip>({
  offset: 20, start: 2, end: 18,
});

<Waveform
  peaks={peaks}
  duration={90}          // the lane's axis
  audioDuration={30}     // the audio behind the peaks
  clip={clip}
  onClipInput={setClip}
  onClipChange={setClip}
  onClipCommit={(c) => { setClip(c); pushHistory(c); }}
/>`}
        >
          <div className="zen-flex zen-w-full zen-flex-col zen-gap-2">
            <Waveform
              peaks={PEAKS}
              duration={90}
              audioDuration={30}
              clip={clip}
              onClipInput={setClip}
              onClipChange={setClip}
              onClipCommit={(c) => {
                setClip(c);
                setCommits((n) => n + 1);
              }}
            />
            <div className="zen-text-xs zen-font-mono zen-text-zen-muted-fg">
              {fmtClip(clip)} · commits: {commits}
            </div>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>Under a MediaTimeline</h2>
        <CodeExample
          title="One duration, one zoom — the lanes align"
          description="Give both lanes the same duration and zoom and every second lands on the same pixel column, which is what makes a stacked video + audio editor read as one surface. The zoom control stays in the app."
          code={`<Slider value={zoom} onValueChange={setZoom} min={1} max={10} step={0.5} />

<MediaTimeline duration={60} zoom={zoom[0]} ranges={ranges} … />
<Waveform duration={60} zoom={zoom[0]} audioDuration={27}
  clip={clip} onClipInput={setClip} … />`}
        >
          <div className="zen-flex zen-w-full zen-flex-col zen-gap-2">
            <div className="zen-flex zen-items-center zen-gap-3">
              <Slider
                value={zoom}
                onValueChange={setZoom}
                min={1}
                max={10}
                step={0.5}
                className="zen-w-40"
              />
              <span className="zen-text-xs zen-font-mono zen-text-zen-muted-fg">{zoom[0]}x</span>
            </div>
            <MediaTimeline
              duration={60}
              ranges={ranges}
              activeIndex={0}
              onRangesInput={setRanges}
              onRangesChange={setRanges}
              zoom={zoom[0]}
              currentTime={laneTime}
              onSeek={setLaneTime}
            />
            <Waveform
              peaks={PEAKS}
              duration={60}
              audioDuration={27}
              clip={laneClip}
              onClipInput={setLaneClip}
              onClipChange={setLaneClip}
              zoom={zoom[0]}
              currentTime={laneTime}
              onSeek={setLaneTime}
            />
          </div>
        </CodeExample>
      </section>
    </div>
  );
};

export default NewWaveformDemo;
