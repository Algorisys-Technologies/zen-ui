import { DEFAULT_DIAGRAM_EMBED_URL, DEFAULT_YAPPYDRAW_EMBED_URL } from "@algorisys/zen-ui-vanilla";
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
 * The editors are behind a button rather than loaded on page view — the same gate
 * the React and vanilla demos use, so all three match.
 *
 * Both providers are third-party origins; a demo page that frames one the instant
 * you scroll past is a privacy decision made on the reader's behalf. It also keeps
 * the route clean in visual-check: measured in the vanilla demo, framing
 * diagrams.net on load reports two runtime errors per run, both of them ITS
 * request to its own /notifications endpoint answering 404.
 */
function deferred(label: string, build: () => HTMLElement): HTMLElement {
  const box = document.createElement("div");
  box.style.cssText =
    "display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;height:12rem;width:100%;border:1px dashed var(--zen-color-border);border-radius:8px";
  const p = document.createElement("p");
  p.style.cssText = "margin:0;font-size:13px;color:var(--zen-color-muted-fg)";
  p.textContent = label;
  const btn = document.createElement("zen-button");
  btn.setAttribute("size", "sm");
  btn.textContent = "Load editor";
  btn.addEventListener("click", () => box.replaceWith(build()));
  box.append(p, btn);
  return box;
}

function canvas(tag: string, attrs: Record<string, string>): HTMLElement {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

export default function DiagramCanvasDemo(): HTMLElement {
  return DemoPage({
    title: "DiagramCanvas / ArchitectureDraw",
    description:
      "An embedded diagram editor, for a system-design answer. Two providers: diagrams.net, and YappyDraw — Algorisys's own client-side editor.",
    sections: [
      {
        title: "1. draw.io, over postMessage",
        codeTitle: "`value` in, `zen-change` and `zen-save` out",
        codeDescription:
          "There is no npm diagram package here and that is the point: the editor is a whole application — shape libraries, routing, a format — and vendoring one would be the largest dependency in zen-ui by an order of magnitude, to serve one screen in one product. The trade is real, so it is explicit: the editor is a third party's, loaded from their origin, and unavailable offline. zen-change fires on every edit; zen-save fires when the user presses save inside the editor, which is the point worth persisting.",
        code: `<zen-diagram-canvas value="<mxGraphModel …>" height="26rem"></zen-diagram-canvas>

el.addEventListener("zen-save", (e) => persist(e.detail));`,
        render: () =>
          deferred("diagrams.net, framed from embed.diagrams.net", () => {
            const wrap = document.createElement("div");
            wrap.style.cssText = "display:flex;flex-direction:column;gap:8px;width:100%";
            const state = document.createElement("p");
            state.style.cssText = "margin:0;font-size:13px;color:var(--zen-color-muted-fg)";
            state.textContent = "waiting for the editor…";

            const el = canvas("zen-diagram-canvas", { value: STARTER, height: "26rem" });
            el.addEventListener("zen-ready", () => {
              state.textContent = "ready — the starter diagram was loaded into it";
            });
            el.addEventListener("zen-change", (e) => {
              state.textContent = `zen-change: ${String((e as CustomEvent<string>).detail).length} characters of draw.io XML`;
            });
            el.addEventListener("zen-save", (e) => {
              state.textContent = `zen-save: persist these ${String((e as CustomEvent<string>).detail).length} characters`;
            });

            wrap.append(state, el);
            return wrap;
          }),
      },
      {
        title: "2. YappyDraw",
        codeTitle: '`provider="yappydraw"`',
        codeDescription:
          "YappyDraw is Algorisys's own editor: client-side, free, and self-hostable, which is what makes it the better answer for an exam that must not depend on someone else's uptime. It is not merely a URL swap — the two speak different protocols, and its document format is JSON rather than draw.io XML, so the component has two branches rather than one parameterised one. YappyDraw also refuses cross-origin control unless ITS deployment allowlists the framing origin (VITE_EMBED_ALLOWED_ORIGINS); a framing page cannot opt itself in, which is the right way round. That is what zen-error reports, because silence there is indistinguishable from a bug.",
        code: `<zen-diagram-canvas provider="yappydraw" height="26rem"></zen-diagram-canvas>

<!-- self-host either one -->
<zen-diagram-canvas provider="yappydraw" src="/vendor/yappydraw/"></zen-diagram-canvas>`,
        render: () =>
          deferred(`YappyDraw, framed from ${DEFAULT_YAPPYDRAW_EMBED_URL}`, () => {
            const wrap = document.createElement("div");
            wrap.style.cssText = "display:flex;flex-direction:column;gap:8px;width:100%";
            const state = document.createElement("p");
            state.style.cssText = "margin:0;font-size:13px;color:var(--zen-color-muted-fg)";
            state.textContent = `bridging to ${DEFAULT_YAPPYDRAW_EMBED_URL} …`;

            const el = canvas("zen-diagram-canvas", { provider: "yappydraw", height: "26rem" });
            el.addEventListener("zen-ready", () => {
              state.textContent = "ready — the Yappy bridge answered";
            });
            el.addEventListener("zen-change", (e) => {
              state.textContent = `zen-change: ${String((e as CustomEvent<string>).detail).length} characters of Yappy JSON`;
            });
            el.addEventListener("zen-error", (e) => {
              state.textContent = String((e as CustomEvent<string>).detail);
            });

            wrap.append(state, el);
            return wrap;
          }),
      },
      {
        title: "3. Self-hosting, and the sandbox",
        codeTitle: "`src`, and why `allow-same-origin` is in the default",
        codeDescription:
          "src replaces the editor origin, and is also what incoming messages are checked against — an unchecked message listener is a cross-origin write into your app. The sandbox is an attribute because overriding it is a security decision a consumer must be able to make without forking the component. The default keeps allow-same-origin deliberately: without it the frame gets an OPAQUE origin, so every asset it fetches from its own server counts as cross-origin and needs CORS headers most apps do not send. Measured against yappydraw.com: the document loaded and then all four of its own bundles were blocked, leaving a blank frame with no error the component could see. It grants the frame its OWN origin back, not access to this document — the configuration to avoid is a same-origin src together with it.",
        code: `<zen-diagram-canvas src="/vendor/drawio/?embed=1&proto=json"></zen-diagram-canvas>

<!-- the defaults, for reference -->
<!-- ${DEFAULT_DIAGRAM_EMBED_URL} -->
<!-- ${DEFAULT_YAPPYDRAW_EMBED_URL} -->`,
        render: () => {
          const p = document.createElement("p");
          p.style.cssText = "margin:0;font-size:14px;color:var(--zen-color-muted-fg)";
          p.textContent =
            "Both frames above use the default sandbox: allow-scripts allow-same-origin allow-popups allow-forms allow-downloads.";
          return p;
        },
      },
      {
        title: "4. The composition an assessment renders",
        codeTitle: "`<zen-architecture-draw>`, whose slot is its actions",
        codeDescription:
          "A labelled canvas with its own actions, rather than a bare frame the caller has to wrap every time. Light-DOM children go to the action row beside the label, and every DiagramCanvas attribute is forwarded, provider included.",
        code: `<zen-architecture-draw label="Design the ingest pipeline" height="22rem">
  <zen-button size="sm">Save answer</zen-button>
</zen-architecture-draw>`,
        render: () =>
          deferred("ArchitectureDraw, wrapping the same frame", () => {
            const el = canvas("zen-architecture-draw", {
              label: "Design the ingest pipeline",
              height: "22rem",
            });
            const btn = document.createElement("zen-button");
            btn.setAttribute("size", "sm");
            btn.textContent = "Save answer";
            el.append(btn);
            return el;
          }),
      },
    ],
  });
}
