import { createSignal, For } from "solid-js";
import { Splitter, SplitterPanel, SplitterHandle } from "./splitter/splitter";
import { DemoPage, DemoSection } from "./demo-helpers";

const Pane = (props: { title: string; tone?: string; children?: string }) => (
  <div class="zen-flex zen-h-full zen-flex-col zen-gap-1 zen-p-3">
    <span class="zen-text-xs zen-font-semibold zen-uppercase zen-tracking-wide zen-text-zen-muted-fg">
      {props.title}
    </span>
    <p class="zen-m-0 zen-text-sm zen-text-zen-foreground">
      {props.children ?? "Drag the divider, or focus it and use the arrow keys."}
    </p>
  </div>
);

const NewSplitterDemo = () => {
  const [sizes, setSizes] = createSignal([30, 70]);
  const [saved, setSaved] = createSignal<number[] | null>(null);

  return (
    <DemoPage
      title="Splitter"
      description={
        <>
          Panes a user can resize by dragging the divider between them — the
          editor-shaped layout every writing, diffing or preview tool wants.
          Sizes are percentages, so the layout survives a window resize.
        </>
      }
    >
      <DemoSection
        title="1. Two panels and a handle"
        codeTitle="The handle is explicit"
        codeDescription="It is a child you place rather than something injected between panels. An implicit handle leaves you nowhere to put a collapse button or a grab affordance, and the handle is exactly where those belong. Sizes are percentages rather than pixels: a pixel-sized splitter breaks the moment the window resizes, and every consumer then writes the same resize observer."
        code={`<Splitter defaultSizes={[30, 70]}>
  <SplitterPanel min={20}><Manuscript /></SplitterPanel>
  <SplitterHandle />
  <SplitterPanel min={30}><Preview /></SplitterPanel>
</Splitter>`}
      >
        <div class="zen-h-56 zen-rounded-zen-md zen-border zen-border-zen-border">
          <Splitter defaultSizes={[30, 70]}>
            <SplitterPanel min={20}>
              <Pane title="Manuscript" />
            </SplitterPanel>
            <SplitterHandle />
            <SplitterPanel min={30}>
              <Pane title="Preview" />
            </SplitterPanel>
          </Splitter>
        </div>
      </DemoSection>

      <DemoSection
        title="2. Vertical"
        codeTitle="`orientation`"
        codeDescription="The same component stacked. The arrow keys follow the axis: up and down here, left and right when horizontal. Under RTL the horizontal axis mirrors — the left arrow grows the preceding panel — while vertical is left alone, because down is down in every writing direction."
        code={`<Splitter orientation="vertical" defaultSizes={[40, 60]}> … </Splitter>`}
      >
        <div class="zen-h-64 zen-rounded-zen-md zen-border zen-border-zen-border">
          <Splitter orientation="vertical" defaultSizes={[40, 60]}>
            <SplitterPanel min={15}>
              <Pane title="Editor" />
            </SplitterPanel>
            <SplitterHandle />
            <SplitterPanel min={15}>
              <Pane title="Console" />
            </SplitterPanel>
          </Splitter>
        </div>
      </DemoSection>

      <DemoSection
        title="3. Three panels"
        codeTitle="A handle moves only its two neighbours"
        codeDescription="Dragging the middle divider resizes the middle and right panels and leaves the left one exactly where it was. The alternative — borrowing from a third panel once a neighbour hits its min — silently rearranges a layout the user was not touching, and it is the bug the three-panel cases in check-splitter.ts exist to catch."
        code={`<Splitter defaultSizes={[25, 50, 25]}>
  <SplitterPanel min={15}>…</SplitterPanel>
  <SplitterHandle />
  <SplitterPanel min={20}>…</SplitterPanel>
  <SplitterHandle />
  <SplitterPanel min={15}>…</SplitterPanel>
</Splitter>`}
      >
        <div class="zen-h-56 zen-rounded-zen-md zen-border zen-border-zen-border">
          <Splitter defaultSizes={[25, 50, 25]}>
            <SplitterPanel min={15}>
              <Pane title="Files" />
            </SplitterPanel>
            <SplitterHandle />
            <SplitterPanel min={20}>
              <Pane title="Editor" />
            </SplitterPanel>
            <SplitterHandle />
            <SplitterPanel min={15}>
              <Pane title="Outline" />
            </SplitterPanel>
          </Splitter>
        </div>
      </DemoSection>

      <DemoSection
        title="4. Collapsing"
        codeTitle="`collapsible`, and `collapsedSize` for a rail"
        codeDescription="Dragged past its min toward zero, a collapsible panel snaps shut rather than sitting at an unusable sliver — it goes to whichever of collapsed-or-min is nearer, so the snap is symmetric with the drag back out. A collapsed panel reopens to at least its min on any outward drag, which is what stops it becoming a trap you can only escape in code. collapsedSize leaves a rail instead of nothing."
        code={`<SplitterPanel min={20} collapsible collapsedSize={6}>
  <Sidebar />
</SplitterPanel>`}
      >
        <div class="zen-h-56 zen-rounded-zen-md zen-border zen-border-zen-border">
          <Splitter defaultSizes={[30, 70]}>
            <SplitterPanel min={20} collapsible collapsedSize={6}>
              <Pane title="Sidebar">Drag me left until I snap shut, then drag back out.</Pane>
            </SplitterPanel>
            <SplitterHandle />
            <SplitterPanel min={30}>
              <Pane title="Content" />
            </SplitterPanel>
          </Splitter>
        </div>
      </DemoSection>

      <DemoSection
        title="5. Controlled, and persisting"
        codeTitle="`onSizesChange` during, `onSizesCommit` on release"
        codeDescription="It writes to no storage of its own. react-resizable-panels saves to localStorage behind an autoSaveId; a component library that writes to storage without being asked is one that surprises people. onSizesCommit fires once on release — that is what to persist, wherever you actually keep state — while onSizesChange fires during the drag, batched to one animation frame."
        code={`const [sizes, setSizes] = createSignal([30, 70]);

<Splitter
  sizes={sizes()}
  onSizesChange={setSizes}
  onSizesCommit={(s) => localStorage.setItem("layout", JSON.stringify(s))}
>`}
      >
        <div class="zen-flex zen-flex-col zen-gap-2">
          <p class="zen-m-0 zen-text-sm zen-text-zen-muted-fg">
            live{" "}
            <strong class="zen-tabular-nums zen-text-zen-foreground">
              <For each={sizes()}>{(s, i) => <>{i() ? " · " : ""}{Math.round(s)}%</>}</For>
            </strong>
            {" — "}committed{" "}
            <strong class="zen-tabular-nums zen-text-zen-foreground">
              {saved() ? saved()!.map((s) => `${Math.round(s)}%`).join(" · ") : "not yet"}
            </strong>
          </p>
          <div class="zen-h-48 zen-rounded-zen-md zen-border zen-border-zen-border">
            <Splitter sizes={sizes()} onSizesChange={setSizes} onSizesCommit={setSaved}>
              <SplitterPanel min={15}>
                <Pane title="Left" />
              </SplitterPanel>
              <SplitterHandle />
              <SplitterPanel min={15}>
                <Pane title="Right" />
              </SplitterPanel>
            </Splitter>
          </div>
        </div>
      </DemoSection>

      <DemoSection
        title="6. Keyboard"
        codeTitle="A real WAI-ARIA window splitter"
        codeDescription="Tab to the divider and it announces itself as a separator controlling the preceding panel, with aria-valuenow as that panel's percentage. Arrow along the axis moves 1%, shift + arrow moves 10%, and Home and End drive the preceding panel exactly to its min and its max — exactly, which is why the core returns infinities for those rather than a large number that happens to be big enough. The hit area is padded to 12px even though the divider is drawn as a 1px line, or it is unusable on touch."
        code={`// nothing to configure — Tab to the handle and try it
Arrow            1%
Shift + Arrow   10%
Home / End      min / max`}
      >
        <div class="zen-h-40 zen-rounded-zen-md zen-border zen-border-zen-border">
          <Splitter defaultSizes={[50, 50]}>
            <SplitterPanel min={20} max={80}>
              <Pane title="Focus the divider">Then press Arrow, Shift+Arrow, Home, End.</Pane>
            </SplitterPanel>
            <SplitterHandle label="Resize the panes" />
            <SplitterPanel min={20}>
              <Pane title="Right" />
            </SplitterPanel>
          </Splitter>
        </div>
      </DemoSection>

      <DemoSection
        title="7. Disabled"
        codeTitle="The handle stops responding; the layout stays"
        codeDescription="disabled freezes the divider without collapsing the panes or changing their sizes. The handle leaves the tab order rather than sitting in it doing nothing."
        code={`<Splitter defaultSizes={[40, 60]} disabled> … </Splitter>`}
      >
        <div class="zen-h-40 zen-rounded-zen-md zen-border zen-border-zen-border">
          <Splitter defaultSizes={[40, 60]} disabled>
            <SplitterPanel>
              <Pane title="Fixed" />
            </SplitterPanel>
            <SplitterHandle />
            <SplitterPanel>
              <Pane title="Fixed" />
            </SplitterPanel>
          </Splitter>
        </div>
      </DemoSection>
    </DemoPage>
  );
};

export default NewSplitterDemo;
