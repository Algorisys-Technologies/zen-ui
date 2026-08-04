import { createSignal, Show, type JSX } from "solid-js";
import { DiagramCanvas, ArchitectureDraw } from "./diagram-canvas/diagram-canvas";
import { Button } from "./button/button";
import { DemoPage, DemoSection } from "./demo-helpers";

const SEED = `<mxfile><diagram name="Page-1"><mxGraphModel dx="800" dy="600" grid="1" gridSize="10" page="1" pageWidth="850" pageHeight="1100"><root><mxCell id="0"/><mxCell id="1" parent="0"/><mxCell id="2" value="Client" style="rounded=1;whiteSpace=wrap;html=1;" vertex="1" parent="1"><mxGeometry x="80" y="80" width="120" height="50" as="geometry"/></mxCell><mxCell id="3" value="API" style="rounded=1;whiteSpace=wrap;html=1;" vertex="1" parent="1"><mxGeometry x="280" y="80" width="120" height="50" as="geometry"/></mxCell><mxCell id="4" style="edgeStyle=orthogonalEdgeStyle;html=1;" edge="1" parent="1" source="2" target="3"><mxGeometry relative="1" as="geometry"/></mxCell></root></mxGraphModel></diagram></mxfile>`;

/**
 * The editors are behind a button rather than loaded on page view.
 *
 * Both providers are third-party origins; a demo page that frames one the
 * instant you scroll past is a privacy decision made on the reader's behalf. It
 * also keeps the route clean in visual-check.
 */
const Deferred = (props: { children: JSX.Element; label: string }) => {
  const [on, setOn] = createSignal(false);
  return (
    <Show
      when={on()}
      fallback={
        <div class="zen-flex zen-h-48 zen-w-full zen-flex-col zen-items-center zen-justify-center zen-gap-2 zen-rounded-zen-md zen-border zen-border-dashed zen-border-zen-border">
          <p class="zen-m-0 zen-text-sm zen-text-zen-muted-fg">{props.label}</p>
          <Button size="sm" onClick={() => setOn(true)}>
            Load editor
          </Button>
        </div>
      }
    >
      {props.children}
    </Show>
  );
};

const NewDiagramCanvasDemo = () => {
  const [xml, setXml] = createSignal(SEED);
  const [saved, setSaved] = createSignal("—");
  const [err, setErr] = createSignal("");

  return (
    <DemoPage
      title="DiagramCanvas & ArchitectureDraw"
      description={
        <>
          An embedded diagram editor for a system-design answer. It speaks the
          editor's <code>postMessage</code> protocol — there is no npm diagram
          package here, and that is the point: a diagram editor is a whole
          application, and vendoring one would be the largest dependency in zen-ui
          by an order of magnitude to serve one screen.
        </>
      }
    >
      <DemoSection
        title="1. The canvas"
        codeTitle="draw.io XML in, draw.io XML out"
        codeDescription="onChange fires on every edit; onSave fires when the user presses save inside the editor, which is the point worth persisting. The trade is explicit: an embed means the editor is a third party's, loaded from their origin, and unavailable offline."
        code={`<DiagramCanvas value={xml()} onChange={setXml} onSave={persist} />`}
      >
        <div class="zen-w-full">
          <Deferred label="Frames diagrams.net — a third-party origin.">
            <DiagramCanvas
              value={xml()}
              onChange={setXml}
              onSave={(next) => setSaved(`${next.length} chars at ${new Date().toLocaleTimeString()}`)}
              height="24rem"
            />
          </Deferred>
          <p class="zen-mt-2 zen-text-xs zen-text-zen-muted-fg">
            last save: <code>{saved()}</code>
          </p>
        </div>
      </DemoSection>

      <DemoSection
        title="2. The sandbox"
        codeTitle="`allow-same-origin` is required, and safe here"
        codeDescription="Without it the frame gets an opaque origin, so every asset it fetches from its own server counts as cross-origin and needs CORS headers most apps do not send — measured against yappydraw.com, the document loaded and then all four of its own bundles were blocked, leaving a blank frame the host page cannot detect. What it grants is the frame's OWN origin back, not access to your document; the same-origin policy between two different origins does that. The one arrangement to avoid is a same-origin src together with it, where the frame can remove its own sandbox attribute."
        code={`<DiagramCanvas sandbox="allow-scripts allow-same-origin allow-popups" />`}
      >
        <p class="zen-m-0 zen-text-sm zen-text-zen-muted-fg">
          Host the editor on a different origin, which is the normal arrangement
          anyway.
        </p>
      </DemoSection>

      <DemoSection
        title="3. YappyDraw"
        codeTitle={`provider="yappydraw" — Algorisys’s own editor`}
        codeDescription="Client-side, free and self-hostable, which is the better answer for an exam that must not depend on a third party's uptime. It is not a URL swap: YappyDraw speaks a structured RPC bridge rather than draw.io's event stream, so the component has two protocol branches, and its documents are JSON not XML. One thing to know before wiring it: YappyDraw refuses cross-origin control unless ITS operator allowlists your origin at deploy time — a framing page cannot opt itself in. Until that is configured the bridge times out, which is why onError exists."
        code={`<DiagramCanvas provider="yappydraw" value={json()} onChange={setJson} onError={setError} />

// self-hosted:
<DiagramCanvas provider="yappydraw" src="https://draw.internal/" />`}
      >
        <div class="zen-w-full">
          <Deferred label="Frames yappydraw.com. Needs your origin allowlisted there to drive the API.">
            <DiagramCanvas provider="yappydraw" height="24rem" value="" onError={setErr} />
          </Deferred>
          <Show when={err()}>
            <p class="zen-mt-2 zen-text-xs zen-text-zen-error">{err()}</p>
          </Show>
        </div>
      </DemoSection>

      <DemoSection
        title="4. ArchitectureDraw"
        codeTitle="The canvas with a heading row"
        codeDescription="The composition an assessment actually renders — a labelled canvas with its own actions, rather than a bare frame every caller has to wrap."
        code={`<ArchitectureDraw label="System design — question 4" actions={<Button size="sm">Save</Button>} />`}
      >
        <Deferred label="Frames diagrams.net — a third-party origin.">
          <ArchitectureDraw
            label="System design — question 4"
            height="20rem"
            value={xml()}
            onChange={setXml}
            actions={
              <Button size="sm" variant="outline" onClick={() => setXml(SEED)}>
                Reset
              </Button>
            }
          />
        </Deferred>
      </DemoSection>
    </DemoPage>
  );
};

export default NewDiagramCanvasDemo;
