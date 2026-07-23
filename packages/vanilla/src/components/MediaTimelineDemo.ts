import { formatMediaTime, type MediaRange } from "@algorisys/zen-ui-core";
import { MediaTimeline } from "./media-timeline/media-timeline";
import { Slider } from "./form/slider/slider";
import { DemoPage } from "./demo-helpers";

// Stand-in filmstrip frames — the component takes image URLs and never touches
// ffmpeg, so the demo fabricates frames the same way an app would supply them.
const thumb = (hue: number) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='80' height='56'><rect width='80' height='56' fill='hsl(${hue} 55% 60%)'/><circle cx='40' cy='28' r='12' fill='hsl(${hue} 65% 40%)'/></svg>`,
  )}`;
const THUMBS = Array.from({ length: 12 }, (_, i) => thumb(i * 30));

const fmtRanges = (ranges: MediaRange[]) =>
  ranges.map((r) => `${r.start.toFixed(1)}–${r.end.toFixed(1)}s`).join(" · ");

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

export default function MediaTimelineDemo(): HTMLElement {
  return DemoPage({
    title: "MediaTimeline",
    description:
      "A filmstrip trim track: draggable ranges over thumbnails, playhead, hover scrubbing, zoom. Controlled-only — the app owns ranges, zoom and the playhead, and feeds every change back through update(). Not the event Timeline; this one edits time.",
    sections: [
      {
        title: "1. Trim ranges",
        codeTitle: "Drag the edges; click the track to seek",
        codeDescription:
          "onRangesInput fires per pointermove (no history), onSeek follows the dragged edge so a video preview can track it live, and onRangesCommit fires once on release — wire undo there. Keyboard: focus a handle, arrows nudge (Shift for 1s steps).",
        code: `let ranges = [
  { start: 8, end: 22 },
  { start: 40, end: 65 },
];

const tl = MediaTimeline({
  duration: 120,
  ranges,
  activeIndex: 0,
  onActiveIndexChange: (i) => tl.update({ activeIndex: i }),
  onRangesInput: (r) => tl.update({ ranges: r }),
  onRangesChange: (r) => tl.update({ ranges: r }),
  onRangesCommit: (r) => pushHistory(r),
  onSeek: (t) => tl.update({ currentTime: t }),
  currentTime: 30,
  thumbnails,
});`,
        render: () => {
          let ranges: MediaRange[] = [
            { start: 8, end: 22 },
            { start: 40, end: 65 },
          ];
          let active = 0;
          let time = 30;
          let commits = 0;
          const info = readout();
          const paintInfo = () => {
            info.textContent = `ranges: ${fmtRanges(ranges)} · active: ${active} · playhead: ${formatMediaTime(time)} · commits: ${commits}`;
          };
          const tl = MediaTimeline({
            duration: 120,
            ranges,
            activeIndex: active,
            onActiveIndexChange: (i) => {
              active = i;
              tl.update({ activeIndex: i });
              paintInfo();
            },
            onRangesInput: (r) => {
              ranges = r;
              tl.update({ ranges: r });
              paintInfo();
            },
            onRangesChange: (r) => {
              ranges = r;
              tl.update({ ranges: r });
              paintInfo();
            },
            onRangesCommit: (r) => {
              ranges = r;
              commits += 1;
              tl.update({ ranges: r });
              paintInfo();
            },
            onSeek: (t) => {
              time = t;
              tl.update({ currentTime: t });
              paintInfo();
            },
            currentTime: time,
            thumbnails: THUMBS,
          });
          paintInfo();
          return column(tl.el, info);
        },
      },
      {
        title: "2. Zoom",
        codeTitle: "zoom is a plain controlled prop — bring your own control",
        codeDescription:
          "There is no built-in zoom UI: the component takes zoom (>= 1) and scrolls horizontally when the track outgrows its box. A Slider next to it is the whole story, and it stays in the app so the chrome matches the app's.",
        code: `const tl = MediaTimeline({ duration: 60, ranges, zoom: 2, … });
Slider({
  value: [2], min: 1, max: 10, step: 0.5,
  onValueChange: ([z]) => tl.update({ zoom: z }),
});`,
        render: () => {
          let ranges: MediaRange[] = [{ start: 20, end: 24 }];
          const zoomLabel = document.createElement("span");
          zoomLabel.className = "zen-text-xs zen-font-mono zen-text-zen-muted-fg";
          zoomLabel.textContent = "2x";
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
            thumbnails: THUMBS,
          });
          const slider = Slider({
            value: [2],
            min: 1,
            max: 10,
            step: 0.5,
            class: "zen-w-40",
            onValueChange: ([z]) => {
              tl.update({ zoom: z });
              slider.update({ value: [z] });
              zoomLabel.textContent = `${z}x`;
            },
          });
          const row = document.createElement("div");
          row.className = "zen-flex zen-items-center zen-gap-3";
          row.append(slider.el, zoomLabel);
          return column(row, tl.el);
        },
      },
      {
        title: "3. Consumer semantics",
        codeTitle: "A range is just a range — the app decides it means “cut”",
        codeDescription:
          "rangeClass replaces the default tint, onRangeRemove puts a remove button on the active range, and double-click hands the app a time — whether that adds a range (and with what overlap rules) is the app's call. This is a red cut-segment editor built on the generic component.",
        code: `const tl = MediaTimeline({
  duration: 120,
  ranges: cuts,
  onRangeRemove: (i) => setCuts(cuts.filter((_, k) => k !== i)),
  onTrackDblClick: (t) => addCutAround(t),
  rangeClass: (_, active) =>
    active
      ? "zen-ring-2 zen-ring-zen-error zen-bg-zen-error-soft"
      : "zen-ring-1 zen-ring-zen-error zen-bg-zen-error-soft",
});`,
        render: () => {
          let cuts: MediaRange[] = [{ start: 10, end: 25 }];
          let active = 0;
          const info = readout();
          const paintInfo = () => {
            info.textContent = `Double-click the track to add a cut · cuts: ${fmtRanges(cuts)}`;
          };
          const setCuts = (next: MediaRange[], nextActive = active) => {
            cuts = next;
            active = Math.max(0, Math.min(nextActive, next.length - 1));
            tl.update({ ranges: cuts, activeIndex: active });
            paintInfo();
          };
          const tl = MediaTimeline({
            duration: 120,
            ranges: cuts,
            activeIndex: active,
            onActiveIndexChange: (i) => {
              active = i;
              tl.update({ activeIndex: i });
            },
            onRangesInput: (r) => setCuts(r),
            onRangesChange: (r) => setCuts(r),
            onRangeRemove: (i) => setCuts(cuts.filter((_, k) => k !== i)),
            onTrackDblClick: (t) => {
              const half = 2.5;
              const next = { start: Math.max(0, t - half), end: Math.min(120, t + half) };
              if (cuts.some((c) => next.start < c.end && next.end > c.start)) return;
              const sorted = [...cuts, next].sort((a, b) => a.start - b.start);
              setCuts(sorted, sorted.indexOf(next));
            },
            rangeClass: (_, act) =>
              act
                ? "zen-ring-2 zen-ring-zen-error zen-bg-zen-error-soft"
                : "zen-ring-1 zen-ring-zen-error zen-bg-zen-error-soft",
          });
          paintInfo();
          return column(tl.el, info);
        },
      },
      {
        title: "4. Overlay elements (independent mode)",
        codeTitle: 'rangeMode: "independent" — free spans that move and overlap',
        codeDescription:
          "No neighbour clamps: spans overlap freely and z-order is array order. Drag a bar's body to move it (length preserved), its edges to trim. rangeLabel puts the element's text in the bar; rangeColor takes any CSS colour and derives the fill, ring and handles from it (rangeClass wins if both are given). Clicking empty track deselects (activeIndex -1, the DOM selectedIndex convention) and seeks. The bar body is focusable too — arrows move it.",
        code: `const tl = MediaTimeline({
  duration: 30,
  rangeMode: "independent",
  ranges: els,
  activeIndex: -1,                    // -1 = nothing selected
  onActiveIndexChange: (i) => tl.update({ activeIndex: i }),
  onRangesInput: (r) => tl.update({ ranges: r }),
  onRangesChange: (r) => tl.update({ ranges: r }),
  onRangeRemove: (i) => setEls(els.filter((_, k) => k !== i)),
  rangeLabel: (i) => LABELS[i],
  rangeColor: (i) => COLORS[i % COLORS.length],
  minRangeDuration: 0.5,
});`,
        render: () => {
          const COLORS = ["#e879f9", "#38bdf8", "#fbbf24", "#4ade80"];
          const LABELS = ["Title card", "Lower third", "Credits", "Watermark"];
          let els: MediaRange[] = [
            { start: 2, end: 14 },
            { start: 10, end: 22 },
            { start: 18, end: 27 },
          ];
          let active = -1;
          const info = readout();
          const paintInfo = () => {
            info.textContent = `elements: ${fmtRanges(els)} · selected: ${active === -1 ? "none" : LABELS[active % LABELS.length]}`;
          };
          const setEls = (next: MediaRange[], nextActive = active) => {
            els = next;
            active = Math.min(nextActive, next.length - 1);
            tl.update({ ranges: els, activeIndex: active });
            paintInfo();
          };
          const tl = MediaTimeline({
            duration: 30,
            rangeMode: "independent",
            ranges: els,
            activeIndex: active,
            onActiveIndexChange: (i) => {
              active = i;
              tl.update({ activeIndex: i });
              paintInfo();
            },
            onRangesInput: (r) => setEls(r),
            onRangesChange: (r) => setEls(r),
            onRangeRemove: (i) => setEls(els.filter((_, k) => k !== i), -1),
            rangeLabel: (i) => LABELS[i % LABELS.length],
            rangeColor: (i) => COLORS[i % COLORS.length],
            minRangeDuration: 0.5,
          });
          paintInfo();
          return column(tl.el, info);
        },
      },
    ],
  });
}
