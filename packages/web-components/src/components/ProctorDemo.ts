import { DemoPage } from "./demo-helpers";

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

const PEOPLE = [
  { id: "1", name: "A. Fernandes", detail: "cand-2291", poster: poster("cam-01", "#3f3f46"), status: "live" },
  {
    id: "2", name: "R. Iyer", detail: "cand-2292", poster: poster("cam-02", "#44403c"), status: "live",
    flags: [
      { id: "f1", label: "Multiple faces", level: "error", at: "09:14" },
      { id: "f2", label: "Tab switch", level: "warning", at: "09:12" },
      { id: "f3", label: "Left frame", level: "warning", at: "09:07" },
    ],
  },
  {
    id: "3", name: "S. Menon", detail: "cand-2293", poster: poster("cam-03", "#3f3f46"), status: "connecting",
    flags: [{ id: "f4", label: "Low light", level: "info" }],
  },
  { id: "4", name: "K. Nair", detail: "cand-2294", status: "left" },
  { id: "5", name: "T. Bose", detail: "cand-2295", poster: poster("cam-05", "#44403c"), status: "live" },
  { id: "6", name: "M. Rao", detail: "cand-2296", poster: poster("cam-06", "#3f3f46"), status: "live" },
];

function el(tag: string, attrs: Record<string, string>): HTMLElement {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  return node;
}

export default function ProctorDemo(): HTMLElement {
  return DemoPage({
    title: "ProctorStreamGrid / ProctorFlagOverlay",
    description:
      "Many live candidates on one screen, and what each of them just did. It displays; it does not detect — no webcam is opened here, no face is found, no tab switch is noticed.",
    sections: [
      {
        title: "1. The grid",
        codeTitle: "`participants` — a json attribute that cannot carry the streams",
        codeDescription:
          "Worth being plain about: a participant's `stream` is a MediaStream, which JSON cannot express, so markup can only seed the posters, names and flags — anything live arrives through el.participants. Detection is not here at all, and that is the design: it is 500 lines of MediaPipe with thresholds tuned to one product's lighting and camera placement, and a design system that shipped it would make every consumer carry a computer-vision dependency to render a card.",
        code: `<zen-proctor-stream-grid participants='[
  { "id": "1", "name": "A. Fernandes", "status": "live", "poster": "…" }
]'></zen-proctor-stream-grid>

el.participants = people;                       // with real MediaStreams
el.addEventListener("zen-select", (e) => open(e.detail.id));`,
        render: () => {
          const grid = document.createElement("zen-proctor-stream-grid");
          (grid as unknown as { participants: unknown[] }).participants = PEOPLE;
          grid.addEventListener("zen-select", () => {});
          return grid;
        },
      },
      {
        title: "2. Flags over a tile",
        codeTitle: "`<zen-proctor-flag-overlay>`",
        codeDescription:
          "A gradient rather than a flat translucent bar, so a white shirt behind it does not make the text unreadable — this sits over arbitrary video and cannot assume a background. `max` caps the chips at 2 by default because a tile is small, and the remainder becomes '+n more' rather than overflowing. A tile with an error flag also takes a border, so it is findable while scanning thirty of them.",
        code: `<zen-proctor-flag-overlay max="2" flags='[
  { "id": "f1", "label": "Multiple faces", "level": "error" }
]'></zen-proctor-flag-overlay>`,
        render: () => {
          const frame = document.createElement("div");
          frame.className = "zen-relative zen-w-72 zen-overflow-hidden zen-rounded-zen-md zen-border zen-border-zen-border";
          const img = document.createElement("img");
          img.src = poster("cam-02", "#44403c");
          img.alt = "";
          img.className = "zen-block zen-w-full";
          frame.append(img, el("zen-proctor-flag-overlay", { flags: JSON.stringify(PEOPLE[1].flags) }));
          return frame;
        },
      },
      {
        title: "3. Tile size, and a cap on how many",
        codeTitle: "`min-tile-width` and `max`",
        codeDescription:
          "There is no virtualisation here on purpose — a live <video> costs a decoder, and a hundred of them is a browser problem no layout fixes. `max` renders the first n and REPORTS the rest: a proctor who thinks they can see everyone and cannot is worse off than one who knows they are looking at 24.",
        code: `<zen-proctor-stream-grid min-tile-width="10rem" max="4" participants='[…]'>
</zen-proctor-stream-grid>`,
        render: () =>
          el("zen-proctor-stream-grid", {
            "min-tile-width": "10rem",
            max: "4",
            participants: JSON.stringify(PEOPLE),
          }),
      },
      {
        title: "4. Nobody yet",
        codeTitle: "`empty-message`",
        codeDescription:
          "An empty invigilation screen is the normal state five minutes before a test starts, not an error.",
        code: `<zen-proctor-stream-grid participants="[]" empty-message="Nobody has joined yet.">
</zen-proctor-stream-grid>`,
        render: () =>
          el("zen-proctor-stream-grid", { participants: "[]", "empty-message": "Nobody has joined yet." }),
      },
    ],
  });
}
