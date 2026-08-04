import { Splitter } from "./splitter/splitter";
import { DemoPage } from "./demo-helpers";

const pane = (title: string, text?: string): HTMLElement => {
  const box = document.createElement("div");
  box.style.display = "flex";
  box.style.flexDirection = "column";
  box.style.gap = "4px";
  box.style.padding = "12px";
  box.style.height = "100%";

  const heading = document.createElement("span");
  heading.style.fontSize = "11px";
  heading.style.fontWeight = "600";
  heading.style.textTransform = "uppercase";
  heading.style.letterSpacing = ".04em";
  heading.style.color = "var(--zen-color-muted-fg)";
  heading.textContent = title;

  const p = document.createElement("p");
  p.style.margin = "0";
  p.style.fontSize = "14px";
  p.textContent = text ?? "Drag the divider, or focus it and use the arrow keys.";

  box.append(heading, p);
  return box;
};

const framed = (height: number, el: HTMLElement): HTMLElement => {
  const box = document.createElement("div");
  box.style.border = "1px solid var(--zen-color-border)";
  box.style.borderRadius = "8px";
  box.style.overflow = "hidden";
  box.style.height = `${height}px`;
  box.style.width = "100%";
  box.append(el);
  return box;
};

export default function SplitterDemo(): HTMLElement {
  return DemoPage({
    title: "Splitter",
    description:
      "Panes a user can resize by dragging the divider between them — the editor-shaped layout every writing, diffing or preview tool wants. Sizes are percentages, so the layout survives a window resize.",
    sections: [
      {
        title: "1. Two panels and a divider",
        codeTitle: "`panels` is data, and the dividers are implied",
        codeDescription:
          "React composes <SplitterPanel> and <SplitterHandle> as children through a context. There is no framework here and so no context, so the panels are an array and the n-1 dividers between them are implied — which is the only arrangement a splitter can have anyway. Sizes are percentages rather than pixels: a pixel-sized splitter breaks the moment the window resizes, and every consumer then writes the same resize observer.",
        code: `Splitter({
  defaultSizes: [30, 70],
  panels: [
    { min: 20, content: manuscript },
    { min: 30, content: preview },
  ],
}).el`,
        render: () =>
          framed(
            224,
            Splitter({
              defaultSizes: [30, 70],
              panels: [
                { min: 20, content: pane("Manuscript") },
                { min: 30, content: pane("Preview") },
              ],
            }).el,
          ),
      },
      {
        title: "2. Vertical",
        codeTitle: "`orientation`",
        codeDescription:
          "The same component stacked. The arrow keys follow the axis: up and down here, left and right when horizontal. Under RTL the horizontal axis mirrors — the left arrow grows the preceding panel — while vertical is left alone, because down is down in every writing direction.",
        code: `Splitter({ orientation: "vertical", defaultSizes: [40, 60], panels: [...] }).el`,
        render: () =>
          framed(
            256,
            Splitter({
              orientation: "vertical",
              defaultSizes: [40, 60],
              panels: [
                { min: 15, content: pane("Editor") },
                { min: 15, content: pane("Console") },
              ],
            }).el,
          ),
      },
      {
        title: "3. Three panels",
        codeTitle: "A divider moves only its two neighbours",
        codeDescription:
          "Dragging the middle divider resizes the middle and right panels and leaves the left one exactly where it was. The alternative — borrowing from a third panel once a neighbour hits its min — silently rearranges a layout the user was not touching, and it is the bug the three-panel cases in check-splitter.ts exist to catch.",
        code: `Splitter({
  defaultSizes: [25, 50, 25],
  panels: [{ min: 15, … }, { min: 20, … }, { min: 15, … }],
}).el`,
        render: () =>
          framed(
            224,
            Splitter({
              defaultSizes: [25, 50, 25],
              panels: [
                { min: 15, content: pane("Files") },
                { min: 20, content: pane("Editor") },
                { min: 15, content: pane("Outline") },
              ],
            }).el,
          ),
      },
      {
        title: "4. Collapsing",
        codeTitle: "`collapsible`, and `collapsedSize` for a rail",
        codeDescription:
          "Dragged past its min toward zero, a collapsible panel snaps shut rather than sitting at an unusable sliver — it goes to whichever of collapsed-or-min is nearer, so the snap is symmetric with the drag back out. A collapsed panel reopens to at least its min on any outward drag, which is what stops it becoming a trap you can only escape in code.",
        code: `{ min: 20, collapsible: true, collapsedSize: 6, content: sidebar }`,
        render: () =>
          framed(
            224,
            Splitter({
              defaultSizes: [30, 70],
              panels: [
                {
                  min: 20,
                  collapsible: true,
                  collapsedSize: 6,
                  content: pane("Sidebar", "Drag me left until I snap shut, then drag back out."),
                },
                { min: 30, content: pane("Content") },
              ],
            }).el,
          ),
      },
      {
        title: "5. Controlled, and persisting",
        codeTitle: "`onSizesChange` during, `onSizesCommit` on release",
        codeDescription:
          "It writes to no storage of its own. react-resizable-panels saves to localStorage behind an autoSaveId; a component library that writes to storage without being asked is one that surprises people. onSizesCommit fires once on release — that is what to persist — while onSizesChange fires during the drag, batched to one animation frame.",
        code: `Splitter({
  sizes,
  onSizesChange: (s) => setSizes(s),
  onSizesCommit: (s) => localStorage.setItem("layout", JSON.stringify(s)),
  panels: [...],
}).el`,
        render: () => {
          const wrap = document.createElement("div");
          wrap.style.display = "flex";
          wrap.style.flexDirection = "column";
          wrap.style.gap = "8px";
          wrap.style.width = "100%";

          const readout = document.createElement("p");
          readout.style.margin = "0";
          readout.style.fontSize = "13px";
          readout.style.color = "var(--zen-color-muted-fg)";

          let sizes = [50, 50];
          let saved: number[] | null = null;
          const paint = () => {
            readout.textContent =
              `live ${sizes.map((s) => `${Math.round(s)}%`).join(" · ")}` +
              ` — committed ${saved ? saved.map((s) => `${Math.round(s)}%`).join(" · ") : "not yet"}`;
          };
          paint();

          const splitter = Splitter({
            sizes,
            onSizesChange: (s) => {
              sizes = s;
              splitter.update({ sizes: s });
              paint();
            },
            onSizesCommit: (s) => {
              saved = s;
              paint();
            },
            panels: [
              { min: 15, content: pane("Left") },
              { min: 15, content: pane("Right") },
            ],
          });

          wrap.append(readout, framed(192, splitter.el));
          return wrap;
        },
      },
      {
        title: "6. Keyboard",
        codeTitle: "A real WAI-ARIA window splitter",
        codeDescription:
          "Tab to the divider — or click it, which also focuses it — and it announces itself as a separator controlling the preceding panel, with aria-valuenow as that panel's percentage and aria-valuemin/max as its REAL clamps rather than a flat 0–100. Arrow moves 1%, shift+arrow 10%, and Home and End land exactly on the announced bounds. The hit area is padded to 12px even though the divider is drawn as a 1px line.",
        code: `// nothing to configure — click or Tab to the divider and try it
Arrow            1%
Shift + Arrow   10%
Home / End      min / max`,
        render: () =>
          framed(
            160,
            Splitter({
              defaultSizes: [50, 50],
              panels: [
                {
                  min: 20,
                  max: 80,
                  handleLabel: "Resize the panes",
                  content: pane("Focus the divider", "Then press Arrow, Shift+Arrow, Home, End."),
                },
                { min: 20, content: pane("Right") },
              ],
            }).el,
          ),
      },
      {
        title: "7. Disabled",
        codeTitle: "The divider stops responding; the layout stays",
        codeDescription:
          "disabled freezes the divider without collapsing the panes or changing their sizes. It leaves the tab order rather than sitting in it doing nothing.",
        code: `Splitter({ defaultSizes: [40, 60], disabled: true, panels: [...] }).el`,
        render: () =>
          framed(
            160,
            Splitter({
              defaultSizes: [40, 60],
              disabled: true,
              panels: [{ content: pane("Fixed") }, { content: pane("Fixed") }],
            }).el,
          ),
      },
    ],
  });
}
