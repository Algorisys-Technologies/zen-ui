import {
  DiagramCanvas,
  ArchitectureDraw,
  DEFAULT_DIAGRAM_EMBED_URL,
  DEFAULT_YAPPYDRAW_EMBED_URL,
} from "./diagram-canvas/diagram-canvas";
import { Button } from "./button/button";
import { DemoPage } from "./demo-helpers";

const STARTER = `<mxGraphModel dx="800" dy="600" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="850" pageHeight="1100" math="0" shadow="0">
  <root>
    <mxCell id="0" /><mxCell id="1" parent="0" />
    <mxCell id="2" value="Client" style="rounded=1;whiteSpace=wrap;html=1;" vertex="1" parent="1"><mxGeometry x="80" y="80" width="120" height="50" as="geometry" /></mxCell>
    <mxCell id="3" value="API" style="rounded=1;whiteSpace=wrap;html=1;" vertex="1" parent="1"><mxGeometry x="280" y="80" width="120" height="50" as="geometry" /></mxCell>
    <mxCell id="4" style="edgeStyle=orthogonalEdgeStyle;html=1;" edge="1" parent="1" source="2" target="3"><mxGeometry relative="1" as="geometry" /></mxCell>
  </root>
</mxGraphModel>`;

/**
 * The editors are behind a button rather than loaded on page view — the same
 * gate the React demo uses, so the two demos match.
 *
 * Both providers are third-party origins; a demo page that frames one the
 * instant you scroll past is a privacy decision made on the reader's behalf. It
 * also keeps the route clean in visual-check: measured, framing diagrams.net on
 * load reports two runtime errors per run, both of them ITS request to its own
 * /notifications endpoint answering 404. Nothing zen-ui can fix, and exactly the
 * kind of third-party noise that trains you to ignore the check.
 */
function deferred(label: string, build: () => HTMLElement): HTMLElement {
  const box = document.createElement("div");
  box.style.display = "flex";
  box.style.flexDirection = "column";
  box.style.alignItems = "center";
  box.style.justifyContent = "center";
  box.style.gap = "8px";
  box.style.height = "12rem";
  box.style.width = "100%";
  box.style.border = "1px dashed var(--zen-color-border)";
  box.style.borderRadius = "8px";

  const p = document.createElement("p");
  p.style.margin = "0";
  p.style.fontSize = "13px";
  p.style.color = "var(--zen-color-muted-fg)";
  p.textContent = label;

  const load = Button({
    size: "sm",
    children: "Load editor",
    onClick: () => box.replaceWith(build()),
  });

  box.append(p, load.el);
  return box;
}

export default function DiagramCanvasDemo(): HTMLElement {
  return DemoPage({
    title: "DiagramCanvas / ArchitectureDraw",
    description:
      "An embedded diagram editor, for a system-design answer. Two providers: diagrams.net, and YappyDraw — Algorisys's own client-side editor.",
    sections: [
      {
        title: "1. draw.io, over postMessage",
        codeTitle: "`value` in, `onChange` and `onSave` out",
        codeDescription:
          "There is no npm diagram package here and that is the point: the editor is a whole application — shape libraries, routing, a format — and vendoring one would be the largest dependency in zen-ui by an order of magnitude, to serve one screen in one product. The trade is real, so it is explicit: the editor is a third party's, loaded from their origin, and unavailable offline. onChange fires on every edit; onSave fires when the user presses save inside the editor, which is the point worth persisting.",
        code: `DiagramCanvas({ value: xml, onChange: (x) => (xml = x), onSave: persist }).el`,
        render: () =>
          deferred("diagrams.net, framed from embed.diagrams.net", () => {
            const wrap = document.createElement("div");
            wrap.style.display = "flex";
            wrap.style.flexDirection = "column";
            wrap.style.gap = "8px";
            wrap.style.width = "100%";

            const state = document.createElement("p");
            state.style.margin = "0";
            state.style.fontSize = "13px";
            state.style.color = "var(--zen-color-muted-fg)";
            state.textContent = "waiting for the editor…";

            wrap.append(
              state,
              DiagramCanvas({
                value: STARTER,
                height: "26rem",
                onReady: () => {
                  state.textContent = "ready — the starter diagram was loaded into it";
                },
                onChange: (xml) => {
                  state.textContent = `onChange: ${xml.length} characters of draw.io XML`;
                },
                onSave: (xml) => {
                  state.textContent = `onSave: persist these ${xml.length} characters`;
                },
              }).el,
            );
            return wrap;
          }),
      },
      {
        title: "2. YappyDraw",
        codeTitle: '`provider: "yappydraw"`',
        codeDescription:
          "YappyDraw is Algorisys's own editor: client-side, free, and self-hostable, which is what makes it the better answer for an exam that must not depend on someone else's uptime. It is not merely a URL swap — the two speak different protocols, and its document format is JSON rather than draw.io XML, so the component has two branches rather than one parameterised one. Note that YappyDraw refuses cross-origin control unless ITS deployment allowlists the framing origin (VITE_EMBED_ALLOWED_ORIGINS); a framing page cannot opt itself in, which is the right way round. That is what onError reports, because silence there is indistinguishable from a bug.",
        code: `DiagramCanvas({
  provider: "yappydraw",
  value: json,
  onChange: (doc) => (json = doc),
  onError: (message) => console.warn(message),
}).el

// self-host either one:
DiagramCanvas({ provider: "yappydraw", src: "/vendor/yappydraw/" }).el`,
        render: () =>
          deferred(`YappyDraw, framed from ${DEFAULT_YAPPYDRAW_EMBED_URL}`, () => {
            const wrap = document.createElement("div");
            wrap.style.display = "flex";
            wrap.style.flexDirection = "column";
            wrap.style.gap = "8px";
            wrap.style.width = "100%";

            const state = document.createElement("p");
            state.style.margin = "0";
            state.style.fontSize = "13px";
            state.style.color = "var(--zen-color-muted-fg)";
            state.textContent = `bridging to ${DEFAULT_YAPPYDRAW_EMBED_URL} …`;

            wrap.append(
              state,
              DiagramCanvas({
                provider: "yappydraw",
                height: "26rem",
                onReady: () => {
                  state.textContent = "ready — the Yappy bridge answered";
                },
                onChange: (doc) => {
                  state.textContent = `onChange: ${doc.length} characters of Yappy JSON`;
                },
                onError: (message) => {
                  state.textContent = message;
                },
              }).el,
            );
            return wrap;
          }),
      },
      {
        title: "3. Self-hosting, and the sandbox",
        codeTitle: "`src`, and why `allow-same-origin` is in the default",
        codeDescription:
          "src replaces the editor origin, and is also what incoming messages are checked against — an unchecked message listener is a cross-origin write into your app. The default sandbox keeps allow-same-origin, and that is deliberate: without it the frame gets an OPAQUE origin, so every asset it fetches from its own server counts as cross-origin and needs CORS headers most apps do not send. Measured against yappydraw.com: the document loaded and then all four of its own bundles were blocked, leaving a blank frame with no error the component could see. It grants the frame its OWN origin back, not access to this document. The configuration to avoid is a same-origin src together with it, because then the frame can reach in and remove its own sandbox attribute.",
        code: `DiagramCanvas({ src: "/vendor/drawio/?embed=1&proto=json" }).el

// the defaults, for reference:
DEFAULT_DIAGRAM_EMBED_URL     // ${DEFAULT_DIAGRAM_EMBED_URL}
DEFAULT_YAPPYDRAW_EMBED_URL   // ${DEFAULT_YAPPYDRAW_EMBED_URL}`,
        render: () => {
          const p = document.createElement("p");
          p.style.margin = "0";
          p.style.fontSize = "14px";
          p.style.color = "var(--zen-color-muted-fg)";
          p.textContent =
            "Both frames above use the default sandbox: allow-scripts allow-same-origin allow-popups allow-forms allow-downloads.";
          return p;
        },
      },
      {
        title: "4. The composition an assessment renders",
        codeTitle: "`ArchitectureDraw`",
        codeDescription:
          "A labelled canvas with its own actions, rather than a bare frame the caller has to wrap every time. It forwards every DiagramCanvas prop, provider included.",
        code: `ArchitectureDraw({
  label: "Design the ingest pipeline",
  actions: saveButton.el,
  onSave: persist,
}).el`,
        render: () =>
          deferred("ArchitectureDraw, wrapping the same frame", () =>
            ArchitectureDraw({
              label: "Design the ingest pipeline",
              height: "22rem",
              actions: Button({ size: "sm", children: "Save answer" }).el,
            }).el,
          ),
      },
    ],
  });
}
