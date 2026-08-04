import { createSignal } from "solid-js";
import { ProctorStreamGrid, ProctorFlagOverlay } from "./proctor/proctor";
import type { ProctorParticipant } from "./proctor/proctor";
import { Button } from "./button/button";
import { DemoPage, DemoSection } from "./demo-helpers";

/* No streams in a demo — `poster` is the documented path for a tile with no
   live video, which is also what a candidate who has not connected looks like. */
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

const NewProctorDemo = () => {
  const [opened, setOpened] = createSignal("—");

  return (
    <DemoPage
      title="ProctorStreamGrid & ProctorFlagOverlay"
      description={
        <>
          Many live candidates on one screen, and what each of them just did.{" "}
          <strong>It displays; it does not detect.</strong> No webcam is opened
          here, no face is found, no tab switch is noticed — it takes streams you
          already have and flags you already raised.
        </>
      }
    >
      <DemoSection
        title="1. The grid"
        codeTitle="Participants in, tiles out"
        codeDescription="A real responsive grid rather than a wrapping row of fixed-width cards: with thirty candidates the flex-wrap version leaves a ragged last row and no way to cap what is rendered. A tile with an error-level flag gets a border as well as a chip, because it has to be findable while scanning thirty of them."
        code={`<ProctorStreamGrid participants={people} onSelect={(p) => open(p.id)} />`}
      >
        <div class="zen-w-full">
          <ProctorStreamGrid
            participants={PEOPLE}
            onSelect={(p) => setOpened(typeof p.name === "string" ? p.name : p.id)}
          />
          <p class="zen-mt-2 zen-text-xs zen-text-zen-muted-fg">
            opened: <code>{opened()}</code>
          </p>
        </div>
      </DemoSection>

      <DemoSection
        title="2. Where detection stops"
        codeTitle="The boundary is the design"
        codeDescription="Detection is hundreds of lines of computer vision with thresholds tuned to one product's lighting and camera placement — it would be wrong for the next one, and a design system that shipped it would make every consumer carry that dependency to render a card. Raise your own flags and pass them in; the shape is deliberately trivial."
        code={`const flags = violations.map((v) => ({
  id: v.id,
  label: v.type,
  level: v.severe ? "error" : "warning",
}));

<ProctorStreamGrid participants={[{ id, name, stream, flags }]} />`}
      >
        <div class="zen-relative zen-w-64 zen-overflow-hidden zen-rounded-zen-md zen-bg-zen-foreground" style={{ "aspect-ratio": "16/9" }}>
          <ProctorFlagOverlay
            flags={[
              { id: "x", label: "No face", level: "error" },
              { id: "y", label: "Noise", level: "warning" },
              { id: "z", label: "Tab switch", level: "error" },
            ]}
          />
        </div>
      </DemoSection>

      <DemoSection
        title="3. Capping the render"
        codeTitle="`max`, and it says what it hid"
        codeDescription="A live <video> costs a decoder; a hundred of them is a browser problem no layout fixes. There is no virtualisation here — instead the cap is explicit and the remainder is reported. A proctor who thinks they can see everyone and cannot is worse off than one who knows they are looking at 24."
        code={`<ProctorStreamGrid participants={people} max={24} />`}
      >
        <ProctorStreamGrid participants={PEOPLE} max={2} minTileWidth="12rem" />
      </DemoSection>

      <DemoSection
        title="4. Actions and empty"
        codeTitle="Per-tile actions, and nobody connected"
        codeDescription="renderActions puts your own controls in the tile footer — mute, chat, open the violation log."
        code={`<ProctorStreamGrid participants={[]} emptyMessage="No candidates yet" />`}
      >
        <div class="zen-flex zen-w-full zen-flex-col zen-gap-4">
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
      </DemoSection>
    </DemoPage>
  );
};

export default NewProctorDemo;
