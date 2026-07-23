import { useState } from "react";
import { formatMediaTime, type MediaRange } from "@algorisys/zen-ui-core";
import { MediaTimeline } from "./media-timeline/media-timeline";
import { Slider } from "./form/slider/slider";
import { CodeExample } from "./demo-helpers";

// Stand-in filmstrip frames — the component takes image URLs and never touches
// ffmpeg, so the demo fabricates frames the same way an app would supply them.
const thumb = (hue: number) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='80' height='56'><rect width='80' height='56' fill='hsl(${hue} 55% 60%)'/><circle cx='40' cy='28' r='12' fill='hsl(${hue} 65% 40%)'/></svg>`,
  )}`;
const THUMBS = Array.from({ length: 12 }, (_, i) => thumb(i * 30));

const fmtRanges = (ranges: MediaRange[]) =>
  ranges.map((r) => `${r.start.toFixed(1)}–${r.end.toFixed(1)}s`).join(" · ");

const NewMediaTimelineDemo: React.FC = () => {
  const [ranges, setRanges] = useState<MediaRange[]>([
    { start: 8, end: 22 },
    { start: 40, end: 65 },
  ]);
  const [active, setActive] = useState(0);
  const [time, setTime] = useState(30);
  const [commits, setCommits] = useState(0);

  const [zoom, setZoom] = useState([2]);
  const [zRanges, setZRanges] = useState<MediaRange[]>([{ start: 20, end: 24 }]);
  const [zActive, setZActive] = useState(0);

  const [cuts, setCuts] = useState<MediaRange[]>([{ start: 10, end: 25 }]);
  const [cutActive, setCutActive] = useState(0);

  const ELEMENT_COLORS = ["#e879f9", "#38bdf8", "#fbbf24", "#4ade80"];
  const ELEMENT_LABELS = ["Title card", "Lower third", "Credits", "Watermark"];
  const [els, setEls] = useState<MediaRange[]>([
    { start: 2, end: 14 },
    { start: 10, end: 22 },
    { start: 18, end: 27 },
  ]);
  const [elActive, setElActive] = useState(-1);

  const addCut = (t: number) => {
    const half = 2.5;
    const next: MediaRange = { start: Math.max(0, t - half), end: Math.min(120, t + half) };
    if (cuts.some((c) => next.start < c.end && next.end > c.start)) return;
    const sorted = [...cuts, next].sort((a, b) => a.start - b.start);
    setCuts(sorted);
    setCutActive(sorted.indexOf(next));
  };

  return (
    <div className="demo-page">
      <h1>MediaTimeline</h1>
      <p className="lede">
        A filmstrip trim track: draggable ranges over thumbnails, playhead, hover scrubbing, zoom.
        Controlled-only — the app owns ranges, zoom and the playhead. Not the event Timeline; this
        one edits time.
      </p>

      <section className="demo-section">
        <h2>Trim ranges</h2>
        <CodeExample
          title="Drag the edges; click the track to seek"
          description="onRangesInput fires per pointermove (no history), onSeek follows the dragged edge so a video preview can track it live, and onRangesCommit fires once on release — wire undo there. Keyboard: focus a handle, arrows nudge (Shift for 1s steps)."
          code={`const [ranges, setRanges] = useState<MediaRange[]>([
  { start: 8, end: 22 },
  { start: 40, end: 65 },
]);

<MediaTimeline
  duration={120}
  ranges={ranges}
  activeIndex={active}
  onActiveIndexChange={setActive}
  onRangesInput={setRanges}
  onRangesChange={setRanges}
  onRangesCommit={(r) => { setRanges(r); pushHistory(r); }}
  onSeek={setTime}
  currentTime={time}
  thumbnails={thumbnails}
/>`}
        >
          <div className="zen-flex zen-w-full zen-flex-col zen-gap-2">
            <MediaTimeline
              duration={120}
              ranges={ranges}
              activeIndex={active}
              onActiveIndexChange={setActive}
              onRangesInput={setRanges}
              onRangesChange={setRanges}
              onRangesCommit={(r) => {
                setRanges(r);
                setCommits((n) => n + 1);
              }}
              onSeek={setTime}
              currentTime={time}
              thumbnails={THUMBS}
            />
            <div className="zen-text-xs zen-font-mono zen-text-zen-muted-fg">
              ranges: {fmtRanges(ranges)} · active: {active} · playhead: {formatMediaTime(time)} ·
              commits: {commits}
            </div>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>Zoom</h2>
        <CodeExample
          title="zoom is a plain controlled prop — bring your own control"
          description="There is no built-in zoom UI: the component takes zoom (>= 1) and scrolls horizontally when the track outgrows its box. A Slider next to it is the whole story, and it stays in the app so the chrome matches the app's."
          code={`const [zoom, setZoom] = useState([2]);

<Slider value={zoom} onValueChange={setZoom} min={1} max={10} step={0.5} />
<MediaTimeline duration={60} ranges={ranges} zoom={zoom[0]} … />`}
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
              ranges={zRanges}
              activeIndex={zActive}
              onActiveIndexChange={setZActive}
              onRangesInput={setZRanges}
              onRangesChange={setZRanges}
              zoom={zoom[0]}
              thumbnails={THUMBS}
            />
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>Consumer semantics</h2>
        <CodeExample
          title="A range is just a range — the app decides it means “cut”"
          description="rangeClass replaces the default tint, onRangeRemove puts a remove button on the active range, and double-click hands the app a time — whether that adds a range (and with what overlap rules) is the app's call. This is StudioX's red cut-segment editor built on the generic component."
          code={`<MediaTimeline
  duration={120}
  ranges={cuts}
  activeIndex={cutActive}
  onActiveIndexChange={setCutActive}
  onRangesInput={setCuts}
  onRangesChange={setCuts}
  onRangeRemove={(i) => setCuts(cuts.filter((_, k) => k !== i))}
  onTrackDblClick={addCut}
  rangeClass={(_, act) =>
    act
      ? "zen-ring-2 zen-ring-zen-error zen-bg-zen-error-soft"
      : "zen-ring-1 zen-ring-zen-error zen-bg-zen-error-soft"
  }
/>`}
        >
          <div className="zen-flex zen-w-full zen-flex-col zen-gap-2">
            <MediaTimeline
              duration={120}
              ranges={cuts}
              activeIndex={cutActive}
              onActiveIndexChange={setCutActive}
              onRangesInput={setCuts}
              onRangesChange={setCuts}
              onRangeRemove={(i) => {
                setCuts(cuts.filter((_, k) => k !== i));
                setCutActive((a) => Math.min(a, cuts.length - 2));
              }}
              onTrackDblClick={addCut}
              rangeClass={(_, act) =>
                act
                  ? "zen-ring-2 zen-ring-zen-error zen-bg-zen-error-soft"
                  : "zen-ring-1 zen-ring-zen-error zen-bg-zen-error-soft"
              }
            />
            <div className="zen-text-xs zen-font-mono zen-text-zen-muted-fg">
              Double-click the track to add a cut · cuts: {fmtRanges(cuts)}
            </div>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>Overlay elements (independent mode)</h2>
        <CodeExample
          title='rangeMode="independent" — free spans that move and overlap'
          description="No neighbour clamps: spans overlap freely and z-order is array order. Drag a bar's body to move it (length preserved), its edges to trim. rangeLabel puts the element's text in the bar; rangeColor takes any CSS colour and derives the fill, ring and handles from it (rangeClass wins if both are given). Clicking empty track deselects (activeIndex -1, the DOM selectedIndex convention) and seeks. The bar body is focusable too — arrows move it."
          code={`<MediaTimeline
  duration={30}
  rangeMode="independent"
  ranges={els}
  activeIndex={elActive}          // -1 = nothing selected
  onActiveIndexChange={setElActive} // empty-track click emits -1
  onRangesInput={setEls}
  onRangesChange={setEls}
  onRangeRemove={(i) => setEls(els.filter((_, k) => k !== i))}
  rangeLabel={(i) => LABELS[i]}
  rangeColor={(i) => COLORS[i % COLORS.length]}
  minRangeDuration={0.5}
/>`}
        >
          <div className="zen-flex zen-w-full zen-flex-col zen-gap-2">
            <MediaTimeline
              duration={30}
              rangeMode="independent"
              ranges={els}
              activeIndex={elActive}
              onActiveIndexChange={setElActive}
              onRangesInput={setEls}
              onRangesChange={setEls}
              onRangeRemove={(i) => {
                setEls(els.filter((_, k) => k !== i));
                setElActive(-1);
              }}
              rangeLabel={(i) => ELEMENT_LABELS[i % ELEMENT_LABELS.length]}
              rangeColor={(i) => ELEMENT_COLORS[i % ELEMENT_COLORS.length]}
              minRangeDuration={0.5}
            />
            <div className="zen-text-xs zen-font-mono zen-text-zen-muted-fg">
              elements: {fmtRanges(els)} · selected:{" "}
              {elActive === -1 ? "none" : ELEMENT_LABELS[elActive % ELEMENT_LABELS.length]}
            </div>
          </div>
        </CodeExample>
      </section>
    </div>
  );
};

export default NewMediaTimelineDemo;
