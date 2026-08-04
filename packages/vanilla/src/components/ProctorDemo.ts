import { ProctorStreamGrid, ProctorFlagOverlay, type ProctorParticipant } from "./proctor/proctor";
import { Button } from "./button/button";
import { DemoPage } from "./demo-helpers";

/*
 * Posters rather than real webcams. The demo must not ask for camera permission
 * to show a layout — and one browser can only open its own camera once anyway,
 * so a grid of live tiles is not something a demo can honestly fake.
 */
const poster = (seed: string, tone: string) =>
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="0 0 320 180">
      <rect width="320" height="180" fill="${tone}"/>
      <circle cx="160" cy="74" r="30" fill="rgba(255,255,255,.22)"/>
      <path d="M104 180 c 0 -34 25 -56 56 -56 s 56 22 56 56 z" fill="rgba(255,255,255,.22)"/>
      <text x="12" y="170" font-family="monospace" font-size="12" fill="rgba(255,255,255,.55)">${seed}</text>
    </svg>`,
  );

const PEOPLE: ProctorParticipant[] = [
  { id: "1", name: "A. Fernandes", detail: "cand-2291", poster: poster("cam-01", "#3f3f46"), status: "live" },
  {
    id: "2",
    name: "R. Iyer",
    detail: "cand-2292",
    poster: poster("cam-02", "#44403c"),
    status: "live",
    flags: [
      { id: "f1", label: "Multiple faces", level: "error", at: "09:14" },
      { id: "f2", label: "Tab switch", level: "warning", at: "09:12" },
      { id: "f3", label: "Left frame", level: "warning", at: "09:07" },
    ],
  },
  {
    id: "3",
    name: "S. Menon",
    detail: "cand-2293",
    poster: poster("cam-03", "#3f3f46"),
    status: "connecting",
    flags: [{ id: "f4", label: "Low light", level: "info" }],
  },
  { id: "4", name: "K. Nair", detail: "cand-2294", status: "left" },
  { id: "5", name: "T. Bose", detail: "cand-2295", poster: poster("cam-05", "#44403c"), status: "live" },
  { id: "6", name: "M. Rao", detail: "cand-2296", poster: poster("cam-06", "#3f3f46"), status: "live" },
];

export default function ProctorDemo(): HTMLElement {
  return DemoPage({
    title: "ProctorStreamGrid / ProctorFlagOverlay",
    description:
      "Many live candidates on one screen, and what each of them just did. It displays; it does not detect — no webcam is opened here, no face is found, no tab switch is noticed.",
    sections: [
      {
        title: "1. The grid",
        codeTitle: "`participants` — streams you already have",
        codeDescription:
          "Detection is 500 lines of MediaPipe with thresholds tuned to one product's lighting and camera placement, and it would be wrong for the next one. A design system that shipped it would make every consumer carry a computer-vision dependency to render a card. This takes MediaStreams you already hold and flags you already raised, and puts them in a real responsive grid — not a wrapping row of fixed-width cards, which leaves a ragged last row at thirty candidates.",
        code: `ProctorStreamGrid({
  participants: people,           // { id, name, stream, flags, status }
  onSelect: (p) => open(p.id),
}).el`,
        render: () =>
          ProctorStreamGrid({
            participants: PEOPLE,
            onSelect: () => {},
            renderActions: () => Button({ size: "sm", variant: "ghost", children: "Log" }).el,
          }).el,
      },
      {
        title: "2. Flags over a tile",
        codeTitle: "`ProctorFlagOverlay`",
        codeDescription:
          "A gradient rather than a flat translucent bar, so a white shirt behind it does not make the text unreadable — this sits over arbitrary video and cannot assume a background. `max` caps the chips at 2 by default because a tile is small, and the remainder becomes '+n more' rather than overflowing. A tile with an error flag also takes a border, so it is findable while scanning thirty of them.",
        code: `ProctorFlagOverlay({ flags, max: 2 }).el`,
        render: () => {
          const frame = document.createElement("div");
          frame.className = "zen-relative zen-w-72 zen-overflow-hidden zen-rounded-zen-md zen-border zen-border-zen-border";
          const img = document.createElement("img");
          img.src = poster("cam-02", "#44403c");
          img.alt = "";
          img.className = "zen-block zen-w-full";
          frame.append(img);
          frame.append(ProctorFlagOverlay({ flags: PEOPLE[1].flags ?? [] }).el);
          return frame;
        },
      },
      {
        title: "3. Tile size, and a cap on how many",
        codeTitle: "`minTileWidth` and `max`",
        codeDescription:
          "There is no virtualisation here on purpose — a live <video> costs a decoder, and a hundred of them is a browser problem no layout fixes. `max` renders the first n and REPORTS the rest: a proctor who thinks they can see everyone and cannot is worse off than one who knows they are looking at 24.",
        code: `ProctorStreamGrid({ participants: people, minTileWidth: "10rem", max: 4 }).el`,
        render: () => ProctorStreamGrid({ participants: PEOPLE, minTileWidth: "10rem", max: 4 }).el,
      },
      {
        title: "4. Nobody yet",
        codeTitle: "`emptyMessage`",
        codeDescription:
          "An empty invigilation screen is the normal state five minutes before a test starts, not an error.",
        code: `ProctorStreamGrid({ participants: [], emptyMessage: "Nobody has joined yet." }).el`,
        render: () => ProctorStreamGrid({ participants: [], emptyMessage: "Nobody has joined yet." }).el,
      },
    ],
  });
}
