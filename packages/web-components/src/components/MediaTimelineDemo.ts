import { formatMediaTime, type MediaRange } from "@algorisys/zen-ui-vanilla";
import { DemoPage } from "./demo-helpers";

/**
 * MediaTimeline demo — the web-components port. `ranges` is the primary data
 * collection: a `json` attribute for inline authoring, a property for real
 * apps. The drag grammar arrives as CustomEvents (`zen-ranges-input` per move,
 * `zen-ranges-commit` on release); feeding the detail back into `el.ranges` is
 * the controlled loop. The remove affordance is presence-gated — it appears
 * because the demo listens for `zen-range-remove`.
 */

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

type MediaTimelineEl = HTMLElement & {
  ranges: MediaRange[];
  thumbnails?: string[];
  rangeClass?: (index: number, active: boolean) => string;
  rangeColor?: (index: number, active: boolean) => string;
  rangeLabel?: (index: number) => string;
};

const detail = <T,>(e: Event): T => (e as CustomEvent).detail as T;

export default function MediaTimelineDemo(): HTMLElement {
  return DemoPage({
    title: "MediaTimeline",
    description:
      "A filmstrip trim track: draggable ranges over thumbnails, playhead, hover scrubbing, zoom. Controlled-only — drags arrive as zen-ranges-input / zen-ranges-commit CustomEvents and the app feeds the detail back into el.ranges. Not the event Timeline; this one edits time.",
    sections: [
      {
        title: "1. Trim ranges",
        codeTitle: "Drag the edges; click the track to seek",
        codeDescription:
          "zen-ranges-input fires per pointermove (no history), zen-seek follows the dragged edge so a video preview can track it live, and zen-ranges-commit fires once on release — wire undo there. Keyboard: focus a handle, arrows nudge (Shift for 1s steps).",
        code: `<zen-media-timeline duration="120" active-index="0" current-time="30">
</zen-media-timeline>

el.ranges = [{ start: 8, end: 22 }, { start: 40, end: 65 }];
el.thumbnails = thumbnails;
el.addEventListener("zen-ranges-input", (e) => (el.ranges = e.detail));
el.addEventListener("zen-ranges-commit", (e) => pushHistory(e.detail));
el.addEventListener("zen-seek", (e) => el.setAttribute("current-time", e.detail));`,
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
          const el = document.createElement("zen-media-timeline") as MediaTimelineEl;
          el.setAttribute("duration", "120");
          el.setAttribute("active-index", "0");
          el.setAttribute("current-time", "30");
          el.ranges = ranges;
          el.thumbnails = THUMBS;
          el.addEventListener("zen-ranges-input", (e) => {
            ranges = detail<MediaRange[]>(e);
            el.ranges = ranges;
            paintInfo();
          });
          el.addEventListener("zen-ranges-change", (e) => {
            ranges = detail<MediaRange[]>(e);
            el.ranges = ranges;
            paintInfo();
          });
          el.addEventListener("zen-ranges-commit", (e) => {
            ranges = detail<MediaRange[]>(e);
            commits += 1;
            el.ranges = ranges;
            paintInfo();
          });
          el.addEventListener("zen-active-index-change", (e) => {
            active = detail<number>(e);
            el.setAttribute("active-index", String(active));
            paintInfo();
          });
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
        title: "2. Zoom",
        codeTitle: "zoom is a plain attribute — bring your own control",
        codeDescription:
          "There is no built-in zoom UI: the element takes zoom (>= 1) and scrolls horizontally when the track outgrows its box. A zen-slider next to it is the whole story, and it stays in the app so the chrome matches the app's.",
        code: `<zen-slider value="[2]" min="1" max="10" step="0.5"></zen-slider>
<zen-media-timeline duration="60" zoom="2"></zen-media-timeline>

slider.addEventListener("zen-value-change", (e) =>
  tl.setAttribute("zoom", e.detail[0]));`,
        render: () => {
          let ranges: MediaRange[] = [{ start: 20, end: 24 }];
          const el = document.createElement("zen-media-timeline") as MediaTimelineEl;
          el.setAttribute("duration", "60");
          el.setAttribute("active-index", "0");
          el.setAttribute("zoom", "2");
          el.ranges = ranges;
          el.thumbnails = THUMBS;
          el.addEventListener("zen-ranges-input", (e) => {
            ranges = detail<MediaRange[]>(e);
            el.ranges = ranges;
          });
          el.addEventListener("zen-ranges-change", (e) => {
            ranges = detail<MediaRange[]>(e);
            el.ranges = ranges;
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
            el.setAttribute("zoom", String(z));
            zoomLabel.textContent = `${z}x`;
          });
          const row = document.createElement("div");
          row.className = "zen-flex zen-items-center zen-gap-3";
          row.append(slider, zoomLabel);
          return column(row, el);
        },
      },
      {
        title: "3. Consumer semantics",
        codeTitle: "A range is just a range — the app decides it means “cut”",
        codeDescription:
          "rangeClass (a JS property) replaces the default tint, listening for zen-range-remove is what makes the remove button appear on the active range, and double-click hands the app a time via zen-track-dblclick — whether that adds a range is the app's call.",
        code: `el.rangeClass = (_, active) =>
  active
    ? "zen-ring-2 zen-ring-zen-error zen-bg-zen-error-soft"
    : "zen-ring-1 zen-ring-zen-error zen-bg-zen-error-soft";
el.addEventListener("zen-range-remove", (e) =>
  (el.ranges = ranges.filter((_, k) => k !== e.detail)));
el.addEventListener("zen-track-dblclick", (e) => addCutAround(e.detail));`,
        render: () => {
          let cuts: MediaRange[] = [{ start: 10, end: 25 }];
          let active = 0;
          const info = readout();
          const paintInfo = () => {
            info.textContent = `Double-click the track to add a cut · cuts: ${fmtRanges(cuts)}`;
          };
          const el = document.createElement("zen-media-timeline") as MediaTimelineEl;
          el.setAttribute("duration", "120");
          el.setAttribute("active-index", "0");
          el.rangeClass = (_, act) =>
            act
              ? "zen-ring-2 zen-ring-zen-error zen-bg-zen-error-soft"
              : "zen-ring-1 zen-ring-zen-error zen-bg-zen-error-soft";
          const setCuts = (next: MediaRange[], nextActive = active) => {
            cuts = next;
            active = Math.max(0, Math.min(nextActive, next.length - 1));
            el.ranges = cuts;
            el.setAttribute("active-index", String(active));
            paintInfo();
          };
          el.ranges = cuts;
          el.addEventListener("zen-ranges-input", (e) => setCuts(detail<MediaRange[]>(e)));
          el.addEventListener("zen-ranges-change", (e) => setCuts(detail<MediaRange[]>(e)));
          el.addEventListener("zen-active-index-change", (e) => {
            active = detail<number>(e);
            el.setAttribute("active-index", String(active));
          });
          el.addEventListener("zen-range-remove", (e) =>
            setCuts(cuts.filter((_, k) => k !== detail<number>(e))),
          );
          el.addEventListener("zen-track-dblclick", (e) => {
            const t = detail<number>(e);
            const half = 2.5;
            const next = { start: Math.max(0, t - half), end: Math.min(120, t + half) };
            if (cuts.some((c) => next.start < c.end && next.end > c.start)) return;
            const sorted = [...cuts, next].sort((a, b) => a.start - b.start);
            setCuts(sorted, sorted.indexOf(next));
          });
          paintInfo();
          return column(el, info);
        },
      },
      {
        title: "4. Overlay elements (independent mode)",
        codeTitle: 'range-mode="independent" — free spans that move and overlap',
        codeDescription:
          "No neighbour clamps: spans overlap freely and z-order is array order. Drag a bar's body to move it (length preserved), its edges to trim. rangeLabel (a JS property) puts the element's text in the bar; rangeColor takes any CSS colour and derives the fill, ring and handles from it. Clicking empty track deselects (zen-active-index-change fires -1, the DOM selectedIndex convention) and seeks. The bar body is focusable too — arrows move it.",
        code: `<zen-media-timeline duration="30" range-mode="independent"
  active-index="-1"></zen-media-timeline>

el.ranges = els;
el.rangeLabel = (i) => LABELS[i];
el.rangeColor = (i) => COLORS[i % COLORS.length];
el.addEventListener("zen-ranges-input", (e) => (el.ranges = e.detail));
el.addEventListener("zen-active-index-change", (e) =>
  el.setAttribute("active-index", e.detail)); // -1 on empty-track click`,
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
          const el = document.createElement("zen-media-timeline") as MediaTimelineEl;
          el.setAttribute("duration", "30");
          el.setAttribute("range-mode", "independent");
          el.setAttribute("active-index", "-1");
          el.setAttribute("min-range-duration", "0.5");
          el.rangeLabel = (i) => LABELS[i % LABELS.length];
          el.rangeColor = (i) => COLORS[i % COLORS.length];
          const setEls = (next: MediaRange[], nextActive = active) => {
            els = next;
            active = Math.min(nextActive, next.length - 1);
            el.ranges = els;
            el.setAttribute("active-index", String(active));
            paintInfo();
          };
          el.ranges = els;
          el.addEventListener("zen-ranges-input", (e) => setEls(detail<MediaRange[]>(e)));
          el.addEventListener("zen-ranges-change", (e) => setEls(detail<MediaRange[]>(e)));
          el.addEventListener("zen-active-index-change", (e) => {
            active = detail<number>(e);
            el.setAttribute("active-index", String(active));
            paintInfo();
          });
          el.addEventListener("zen-range-remove", (e) =>
            setEls(els.filter((_, k) => k !== detail<number>(e)), -1),
          );
          paintInfo();
          return column(el, info);
        },
      },
    ],
  });
}
