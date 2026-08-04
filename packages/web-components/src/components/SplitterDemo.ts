import { DemoPage } from "./demo-helpers";

const pane = (title: string, text?: string): HTMLElement => {
  const box = document.createElement("div");
  box.style.cssText = "display:flex;flex-direction:column;gap:4px;padding:12px;height:100%";
  const h = document.createElement("span");
  h.style.cssText =
    "font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.04em;color:var(--zen-color-muted-fg)";
  h.textContent = title;
  const p = document.createElement("p");
  p.style.cssText = "margin:0;font-size:14px";
  p.textContent = text ?? "Drag the divider, or focus it and use the arrow keys.";
  box.append(h, p);
  return box;
};

const framed = (height: number, el: HTMLElement): HTMLElement => {
  const box = document.createElement("div");
  box.style.cssText = `border:1px solid var(--zen-color-border);border-radius:8px;overflow:hidden;height:${height}px;width:100%`;
  box.append(el);
  return box;
};

/** Panels carry Nodes, so they go on as a property; plain ones can be an attribute. */
function splitter(panels: unknown[], attrs: Record<string, string> = {}, viaAttribute = false): HTMLElement {
  const el = document.createElement("zen-splitter");
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  if (viaAttribute) el.setAttribute("panels", JSON.stringify(panels));
  else (el as unknown as { panels: unknown[] }).panels = panels;
  return el;
}

export default function SplitterDemo(): HTMLElement {
  return DemoPage({
    title: "Splitter",
    description:
      "Panes a user can resize by dragging the divider between them — the editor-shaped layout every writing, diffing or preview tool wants. Sizes are percentages, so the layout survives a window resize.",
    sections: [
      {
        title: "1. Panels are data",
        codeTitle: "`panels` is json, and the dividers are implied",
        codeDescription:
          "There is no slot. React composes <SplitterPanel> children through a context; a custom element has none, and light-DOM children would have no way to say which pane they belong to. So the panes are an array and the n-1 dividers between them are implied — which is the only arrangement a splitter can have anyway. A panel's content may be a Node, which JSON cannot express, so anything real goes on as el.panels.",
        code: `<zen-splitter default-sizes="[30,70]"
  panels='[{"min":20,"content":"Manuscript"},{"min":30,"content":"Preview"}]'>
</zen-splitter>`,
        render: () =>
          framed(
            224,
            splitter([
              { min: 20, content: pane("Manuscript") },
              { min: 30, content: pane("Preview") },
            ], { "default-sizes": "[30,70]" }),
          ),
      },
      {
        title: "2. Straight from markup",
        codeTitle: "String content really does work as an attribute",
        codeDescription:
          "This one is built entirely from the json attribute — no properties, no script. It is the case the custom-element layer exists for, and the reason `panels` is a json attribute as well as a property.",
        code: `<zen-splitter default-sizes="[40,60]"
  panels='[{"min":20,"content":"Left pane, from markup"},{"min":20,"content":"Right pane"}]'>
</zen-splitter>`,
        render: () =>
          framed(
            160,
            splitter(
              [
                { min: 20, content: "Left pane, from markup" },
                { min: 20, content: "Right pane" },
              ],
              { "default-sizes": "[40,60]" },
              true,
            ),
          ),
      },
      {
        title: "3. Vertical, and three panels",
        codeTitle: "`orientation`, and a divider that moves only its neighbours",
        codeDescription:
          "The arrow keys follow the axis: up and down when vertical, left and right when horizontal. Under RTL the horizontal axis mirrors while vertical is left alone, because down is down in every writing direction. Dragging a middle divider resizes its two neighbours and leaves the third panel exactly where it was — borrowing from a third silently rearranges a layout the user was not touching.",
        code: `<zen-splitter orientation="vertical" default-sizes="[40,60]" …></zen-splitter>`,
        render: () => {
          const wrap = document.createElement("div");
          wrap.style.cssText = "display:flex;flex-direction:column;gap:16px;width:100%";
          wrap.append(
            framed(
              200,
              splitter([{ min: 15, content: pane("Editor") }, { min: 15, content: pane("Console") }], {
                orientation: "vertical",
                "default-sizes": "[40,60]",
              }),
            ),
            framed(
              200,
              splitter(
                [
                  { min: 15, content: pane("Files") },
                  { min: 20, content: pane("Editor") },
                  { min: 15, content: pane("Outline") },
                ],
                { "default-sizes": "[25,50,25]" },
              ),
            ),
          );
          return wrap;
        },
      },
      {
        title: "4. Collapsing",
        codeTitle: "`collapsible` and `collapsedSize`, per panel",
        codeDescription:
          "Dragged past its min toward zero, a collapsible panel snaps shut rather than sitting at an unusable sliver — it goes to whichever of collapsed-or-min is nearer, so the snap is symmetric with the drag back out. A collapsed panel reopens to at least its min on any outward drag, which is what stops it becoming a trap you can only escape in code.",
        code: `panels='[{"min":20,"collapsible":true,"collapsedSize":6},{"min":30}]'`,
        render: () =>
          framed(
            224,
            splitter([
              { min: 20, collapsible: true, collapsedSize: 6, content: pane("Sidebar", "Drag me left until I snap shut.") },
              { min: 30, content: pane("Content") },
            ], { "default-sizes": "[30,70]" }),
          ),
      },
      {
        title: "5. Events, not callbacks",
        codeTitle: "`zen-sizes-change` during, `zen-sizes-commit` on release",
        codeDescription:
          "It writes to no storage of its own — a component library that writes to localStorage without being asked is one that surprises people. zen-sizes-commit fires once on release and is what to persist; zen-sizes-change fires during the drag, batched to one animation frame.",
        code: `el.addEventListener("zen-sizes-commit", (e) =>
  localStorage.setItem("layout", JSON.stringify(e.detail)));`,
        render: () => {
          const wrap = document.createElement("div");
          wrap.style.cssText = "display:flex;flex-direction:column;gap:8px;width:100%";
          const readout = document.createElement("p");
          readout.style.cssText = "margin:0;font-size:13px;color:var(--zen-color-muted-fg)";
          readout.textContent = "live — · committed not yet";

          let live = "—";
          let saved = "not yet";
          const paint = () => (readout.textContent = `live ${live} · committed ${saved}`);

          const el = splitter([{ min: 15, content: pane("Left") }, { min: 15, content: pane("Right") }], {
            "default-sizes": "[50,50]",
          });
          el.addEventListener("zen-sizes-change", (e) => {
            live = (e as CustomEvent<number[]>).detail.map((s) => `${Math.round(s)}%`).join(" · ");
            paint();
          });
          el.addEventListener("zen-sizes-commit", (e) => {
            saved = (e as CustomEvent<number[]>).detail.map((s) => `${Math.round(s)}%`).join(" · ");
            paint();
          });

          wrap.append(readout, framed(192, el));
          return wrap;
        },
      },
      {
        title: "6. Keyboard",
        codeTitle: "A real WAI-ARIA window splitter",
        codeDescription:
          "Tab to the divider — or click it, which also focuses it — and it announces itself as a separator controlling the preceding panel, with aria-valuenow as that panel's percentage and aria-valuemin/max as its REAL clamps rather than a flat 0–100. Arrow moves 1%, shift+arrow 10%, and Home and End land exactly on the announced bounds. The hit area is padded to 12px even though the divider is drawn as a 1px line.",
        code: `Arrow            1%
Shift + Arrow   10%
Home / End      min / max`,
        render: () =>
          framed(
            160,
            splitter([
              { min: 20, max: 80, handleLabel: "Resize the panes", content: pane("Focus the divider", "Then press Arrow, Shift+Arrow, Home, End.") },
              { min: 20, content: pane("Right") },
            ], { "default-sizes": "[50,50]" }),
          ),
      },
      {
        title: "7. Disabled",
        codeTitle: "The divider stops responding; the layout stays",
        codeDescription:
          "disabled freezes the divider without collapsing the panes or changing their sizes, and it leaves the tab order rather than sitting in it doing nothing. It defaults to false, so it is a plain boolean attribute.",
        code: `<zen-splitter disabled default-sizes="[40,60]" …></zen-splitter>`,
        render: () =>
          framed(
            160,
            splitter([{ content: pane("Fixed") }, { content: pane("Fixed") }], {
              disabled: "",
              "default-sizes": "[40,60]",
            }),
          ),
      },
    ],
  });
}
