import { useState } from "react";
import { ProctorStreamGrid, ProctorFlagOverlay } from "./proctor/proctor";
import type { ProctorParticipant } from "./proctor/proctor";
import { Button } from "./button/button";
import { CodeExample } from "./demo-helpers";

/* No streams in a demo — `poster` is the documented path for a tile with no
   live video, which is also what a candidate who has not connected yet looks
   like. */
const face = (seed: string) =>
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180"><rect width="320" height="180" fill="#1f2937"/><circle cx="160" cy="70" r="38" fill="#374151"/><rect x="100" y="118" width="120" height="62" rx="30" fill="#374151"/><text x="160" y="172" font-family="sans-serif" font-size="12" fill="#9ca3af" text-anchor="middle">${seed}</text></svg>`,
  );

const PEOPLE: ProctorParticipant[] = [
  { id: "1", name: "R. Iyer", detail: "r.iyer@example.com", poster: face("cam 1"), status: "live", flags: [] },
  {
    id: "2",
    name: "S. Menon",
    detail: "s.menon@example.com",
    poster: face("cam 2"),
    status: "live",
    flags: [{ id: "a", label: "Looking away", level: "warning", at: "09:14" }],
  },
  {
    id: "3",
    name: "A. Fernandes",
    detail: "a.fernandes@example.com",
    poster: face("cam 3"),
    status: "live",
    flags: [
      { id: "b", label: "Multiple faces", level: "error", at: "09:12" },
      { id: "c", label: "Tab switch", level: "error", at: "09:11" },
      { id: "d", label: "Background noise", level: "warning", at: "09:08" },
    ],
  },
  { id: "4", name: "K. Rao", detail: "k.rao@example.com", status: "connecting", flags: [] },
  { id: "5", name: "P. Das", detail: "p.das@example.com", poster: face("cam 5"), status: "left", flags: [] },
];

const NewProctorDemo: React.FC = () => {
  const [opened, setOpened] = useState("—");

  return (
    <div className="demo-page">
      <h1>ProctorStreamGrid &amp; ProctorFlagOverlay</h1>
      <p className="lede">
        Many live candidates on one screen, and what each of them just did.{" "}
        <strong>It displays; it does not detect.</strong> No webcam is opened here,
        no face is found, no tab switch is noticed — it takes streams you already
        have and flags you already raised.
      </p>

      <section className="demo-section">
        <h2>1. The grid</h2>
        <CodeExample
          title="Participants in, tiles out"
          description="A real responsive grid rather than a wrapping row of fixed-width cards: with thirty candidates the flex-wrap version leaves a ragged last row and no way to cap what is rendered. A tile with an error-level flag gets a border as well as a chip, because it has to be findable while scanning thirty of them."
          code={`<ProctorStreamGrid
  participants={people}
  onSelect={(p) => openCandidate(p.id)}
  renderActions={(p) => <Button size="sm">Logs</Button>}
/>`}
        >
          <div style={{ width: "100%" }}>
            <ProctorStreamGrid
              participants={PEOPLE}
              onSelect={(p) => setOpened(typeof p.name === "string" ? p.name : p.id)}
            />
            <p style={{ marginTop: 8, fontSize: 12, color: "var(--zen-color-muted-fg)" }}>
              opened: <code>{opened}</code>
            </p>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>2. Where detection stops</h2>
        <CodeExample
          title="The boundary is the design"
          description="Detection is hundreds of lines of MediaPipe with thresholds tuned to one product's lighting and camera placement — it would be wrong for the next one, and a design system that shipped it would make every consumer carry a computer-vision dependency to render a card. Raise your own flags and pass them in; the shape is deliberately trivial."
          code={`// yours — MediaPipe, a tab-visibility listener, whatever you use
const flags = violations.map((v) => ({
  id: v.id,
  label: v.type,          // "Multiple faces"
  level: v.severe ? "error" : "warning",
  at: format(v.at),
}));

<ProctorStreamGrid participants={[{ id, name, stream, flags }]} />`}
        >
          <div style={{ position: "relative", width: 260, aspectRatio: "16/9", background: "#1f2937", borderRadius: 8, overflow: "hidden" }}>
            <ProctorFlagOverlay
              flags={[
                { id: "x", label: "No face", level: "error" },
                { id: "y", label: "Noise", level: "warning" },
                { id: "z", label: "Tab switch", level: "error" },
              ]}
            />
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>3. Capping the render</h2>
        <CodeExample
          title="`max`, and it says what it hid"
          description="A live <video> costs a decoder; a hundred of them is a browser problem no layout fixes. There is no virtualisation here — instead the cap is explicit and the remainder is reported. A proctor who thinks they can see everyone and cannot is worse off than one who knows they are looking at 24."
          code={`<ProctorStreamGrid participants={people} max={24} />`}
        >
          <ProctorStreamGrid participants={PEOPLE} max={2} minTileWidth="12rem" />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>4. Actions and empty</h2>
        <CodeExample
          title="Per-tile actions, and nobody connected"
          description="renderActions puts your own controls in the tile footer — mute, chat, open the violation log."
          code={`<ProctorStreamGrid
  participants={[]}
  emptyMessage="No candidates are sitting this test yet"
/>`}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%" }}>
            <ProctorStreamGrid
              participants={PEOPLE.slice(0, 2)}
              minTileWidth="12rem"
              renderActions={() => (
                <Button size="sm" variant="outline">
                  Logs
                </Button>
              )}
            />
            <ProctorStreamGrid participants={[]} emptyMessage="No candidates are sitting this test yet" />
          </div>
        </CodeExample>
      </section>
    </div>
  );
};

export default NewProctorDemo;
