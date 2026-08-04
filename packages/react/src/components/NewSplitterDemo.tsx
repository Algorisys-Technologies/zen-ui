import { useState } from "react";
import { Splitter, SplitterPanel, SplitterHandle } from "./splitter/splitter";
import { CodeExample } from "./demo-helpers";

const Pane = ({ title, children }: { title: string; children?: React.ReactNode }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 4, padding: 12, height: "100%" }}>
    <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".04em", color: "var(--zen-color-muted-fg)" }}>
      {title}
    </span>
    <p style={{ margin: 0, fontSize: 14 }}>
      {children ?? "Drag the divider, or focus it and use the arrow keys."}
    </p>
  </div>
);

const BOX: React.CSSProperties = {
  border: "1px solid var(--zen-color-border)",
  borderRadius: 8,
  overflow: "hidden",
};

const NewSplitterDemo: React.FC = () => {
  const [sizes, setSizes] = useState([30, 70]);
  const [saved, setSaved] = useState<number[] | null>(null);

  return (
    <div className="demo-page">
      <h1>Splitter</h1>
      <p className="lede">
        Panes a user can resize by dragging the divider between them — the
        editor-shaped layout every writing, diffing or preview tool wants. Sizes
        are percentages, so the layout survives a window resize.
      </p>

      <section className="demo-section">
        <h2>1. Two panels and a handle</h2>
        <CodeExample
          title="The handle is explicit"
          description="It is a child you place rather than something injected between panels. An implicit handle leaves you nowhere to put a collapse button or a grab affordance. Sizes are percentages rather than pixels: a pixel-sized splitter breaks the moment the window resizes, and every consumer then writes the same resize observer."
          code={`<Splitter defaultSizes={[30, 70]}>
  <SplitterPanel min={20}><Manuscript /></SplitterPanel>
  <SplitterHandle />
  <SplitterPanel min={30}><Preview /></SplitterPanel>
</Splitter>`}
        >
          <div style={{ ...BOX, height: 224, width: "100%" }}>
            <Splitter defaultSizes={[30, 70]}>
              <SplitterPanel min={20}><Pane title="Manuscript" /></SplitterPanel>
              <SplitterHandle />
              <SplitterPanel min={30}><Pane title="Preview" /></SplitterPanel>
            </Splitter>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>2. Vertical</h2>
        <CodeExample
          title="`orientation`"
          description="The same component stacked. The arrow keys follow the axis: up and down here, left and right when horizontal. Under RTL the horizontal axis mirrors — the left arrow grows the preceding panel — while vertical is left alone, because down is down in every writing direction."
          code={`<Splitter orientation="vertical" defaultSizes={[40, 60]}> … </Splitter>`}
        >
          <div style={{ ...BOX, height: 256, width: "100%" }}>
            <Splitter orientation="vertical" defaultSizes={[40, 60]}>
              <SplitterPanel min={15}><Pane title="Editor" /></SplitterPanel>
              <SplitterHandle />
              <SplitterPanel min={15}><Pane title="Console" /></SplitterPanel>
            </Splitter>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>3. Three panels</h2>
        <CodeExample
          title="A handle moves only its two neighbours"
          description="Dragging the middle divider resizes the middle and right panels and leaves the left one exactly where it was. The alternative — borrowing from a third panel once a neighbour hits its min — silently rearranges a layout the user was not touching, and it is the bug the three-panel cases in check-splitter.ts exist to catch."
          code={`<Splitter defaultSizes={[25, 50, 25]}>
  <SplitterPanel min={15}>…</SplitterPanel>
  <SplitterHandle />
  <SplitterPanel min={20}>…</SplitterPanel>
  <SplitterHandle />
  <SplitterPanel min={15}>…</SplitterPanel>
</Splitter>`}
        >
          <div style={{ ...BOX, height: 224, width: "100%" }}>
            <Splitter defaultSizes={[25, 50, 25]}>
              <SplitterPanel min={15}><Pane title="Files" /></SplitterPanel>
              <SplitterHandle />
              <SplitterPanel min={20}><Pane title="Editor" /></SplitterPanel>
              <SplitterHandle />
              <SplitterPanel min={15}><Pane title="Outline" /></SplitterPanel>
            </Splitter>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>4. Collapsing</h2>
        <CodeExample
          title="`collapsible`, and `collapsedSize` for a rail"
          description="Dragged past its min toward zero, a collapsible panel snaps shut rather than sitting at an unusable sliver — it goes to whichever of collapsed-or-min is nearer, so the snap is symmetric with the drag back out. A collapsed panel reopens to at least its min on any outward drag, which is what stops it becoming a trap you can only escape in code."
          code={`<SplitterPanel min={20} collapsible collapsedSize={6}>
  <Sidebar />
</SplitterPanel>`}
        >
          <div style={{ ...BOX, height: 224, width: "100%" }}>
            <Splitter defaultSizes={[30, 70]}>
              <SplitterPanel min={20} collapsible collapsedSize={6}>
                <Pane title="Sidebar">Drag me left until I snap shut, then drag back out.</Pane>
              </SplitterPanel>
              <SplitterHandle />
              <SplitterPanel min={30}><Pane title="Content" /></SplitterPanel>
            </Splitter>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>5. Controlled, and persisting</h2>
        <CodeExample
          title="`onSizesChange` during, `onSizesCommit` on release"
          description="It writes to no storage of its own. react-resizable-panels saves to localStorage behind an autoSaveId; a component library that writes to storage without being asked is one that surprises people. onSizesCommit fires once on release — that is what to persist — while onSizesChange fires during the drag, batched to one animation frame."
          code={`<Splitter
  sizes={sizes}
  onSizesChange={setSizes}
  onSizesCommit={(s) => localStorage.setItem("layout", JSON.stringify(s))}
/>`}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
            <p style={{ margin: 0, fontSize: 13, color: "var(--zen-color-muted-fg)" }}>
              live <strong>{sizes.map((s) => `${Math.round(s)}%`).join(" · ")}</strong>
              {" — "}committed{" "}
              <strong>{saved ? saved.map((s) => `${Math.round(s)}%`).join(" · ") : "not yet"}</strong>
            </p>
            <div style={{ ...BOX, height: 192, width: "100%" }}>
              <Splitter sizes={sizes} onSizesChange={setSizes} onSizesCommit={setSaved}>
                <SplitterPanel min={15}><Pane title="Left" /></SplitterPanel>
                <SplitterHandle />
                <SplitterPanel min={15}><Pane title="Right" /></SplitterPanel>
              </Splitter>
            </div>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>6. Keyboard</h2>
        <CodeExample
          title="A real WAI-ARIA window splitter"
          description="Tab to the divider — or click it, which also focuses it — and it announces itself as a separator controlling the preceding panel, with aria-valuenow as that panel's percentage and aria-valuemin/max as its REAL clamps rather than a flat 0–100. Arrow moves 1%, shift+arrow 10%, and Home and End land exactly on the announced bounds. The hit area is padded to 12px even though the divider is drawn as a 1px line."
          code={`// nothing to configure — click or Tab to the handle and try it
Arrow            1%
Shift + Arrow   10%
Home / End      min / max`}
        >
          <div style={{ ...BOX, height: 160, width: "100%" }}>
            <Splitter defaultSizes={[50, 50]}>
              <SplitterPanel min={20} max={80}>
                <Pane title="Focus the divider">Then press Arrow, Shift+Arrow, Home, End.</Pane>
              </SplitterPanel>
              <SplitterHandle label="Resize the panes" />
              <SplitterPanel min={20}><Pane title="Right" /></SplitterPanel>
            </Splitter>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>7. Disabled</h2>
        <CodeExample
          title="The handle stops responding; the layout stays"
          description="disabled freezes the divider without collapsing the panes or changing their sizes. The handle leaves the tab order rather than sitting in it doing nothing."
          code={`<Splitter defaultSizes={[40, 60]} disabled> … </Splitter>`}
        >
          <div style={{ ...BOX, height: 160, width: "100%" }}>
            <Splitter defaultSizes={[40, 60]} disabled>
              <SplitterPanel><Pane title="Fixed" /></SplitterPanel>
              <SplitterHandle />
              <SplitterPanel><Pane title="Fixed" /></SplitterPanel>
            </Splitter>
          </div>
        </CodeExample>
      </section>
    </div>
  );
};

export default NewSplitterDemo;
