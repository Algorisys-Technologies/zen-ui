import { useState } from "react";
import { DiagramCanvas, ArchitectureDraw } from "./diagram-canvas/diagram-canvas";
import { Button } from "./button/button";
import { CodeExample } from "./demo-helpers";

const SEED = `<mxfile><diagram name="Page-1"><mxGraphModel dx="800" dy="600" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="850" pageHeight="1100" math="0" shadow="0"><root><mxCell id="0"/><mxCell id="1" parent="0"/><mxCell id="2" value="Client" style="rounded=1;whiteSpace=wrap;html=1;" vertex="1" parent="1"><mxGeometry x="80" y="80" width="120" height="50" as="geometry"/></mxCell><mxCell id="3" value="API" style="rounded=1;whiteSpace=wrap;html=1;" vertex="1" parent="1"><mxGeometry x="280" y="80" width="120" height="50" as="geometry"/></mxCell><mxCell id="4" style="edgeStyle=orthogonalEdgeStyle;html=1;" edge="1" parent="1" source="2" target="3"><mxGeometry relative="1" as="geometry"/></mxCell></root></mxGraphModel></diagram></mxfile>`;

/**
 * The editors are behind a button rather than loaded on page view.
 *
 * Both providers are third-party origins; a demo page that frames one the
 * instant you scroll past is a privacy decision made on the reader's behalf.
 * It also keeps the route clean in visual-check, where the sandboxed frame's
 * own blocked XHR would otherwise be reported as a runtime error on every run.
 */
const Deferred = ({ children, label }: { children: React.ReactNode; label: string }) => {
  const [on, setOn] = useState(false);
  if (on) return <>{children}</>;
  return (
    <div
      style={{
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        gap: 8, height: "12rem", width: "100%",
        border: "1px dashed var(--zen-color-border)", borderRadius: 8,
      }}
    >
      <p style={{ margin: 0, fontSize: 13, color: "var(--zen-color-muted-fg)" }}>{label}</p>
      <Button size="sm" onClick={() => setOn(true)}>Load editor</Button>
    </div>
  );
};

const NewDiagramCanvasDemo: React.FC = () => {
  const [xml, setXml] = useState(SEED);
  const [saved, setSaved] = useState("—");
  const [err, setErr] = useState("");

  return (
    <div className="demo-page">
      <h1>DiagramCanvas &amp; ArchitectureDraw</h1>
      <p className="lede">
        An embedded diagram editor for a system-design answer. It embeds
        diagrams.net and speaks its <code>postMessage</code> protocol — there is
        no npm diagram package here, and that is the point: a diagram editor is a
        whole application, and vendoring one would be the largest dependency in
        zen-ui by an order of magnitude to serve one screen.
      </p>

      <section className="demo-section">
        <h2>1. The canvas</h2>
        <CodeExample
          title="draw.io XML in, draw.io XML out"
          description="onChange fires on every edit; onSave fires when the user presses save inside the editor, which is the point worth persisting. The trade is explicit: an embed means the editor is a third party's, loaded from their origin, and unavailable offline."
          code={`<DiagramCanvas
  value={xml}
  onChange={setXml}
  onSave={(next) => persist(next)}
/>`}
        >
          <div style={{ width: "100%" }}>
            <Deferred label="Frames diagrams.net — a third-party origin.">
              <DiagramCanvas value={xml} onChange={setXml} onSave={(next) => setSaved(`${next.length} chars at ${new Date().toLocaleTimeString()}`)} height="24rem" />
            </Deferred>
            <p style={{ marginTop: 8, fontSize: 12, color: "var(--zen-color-muted-fg)" }}>
              last save: <code>{saved}</code>
            </p>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>2. Self-hosting</h2>
        <CodeExample
          title="`src` is a prop for a reason"
          description="An exam that must not depend on someone else's uptime points this at its own build. The origin is also what incoming messages are checked against — an unchecked message listener is a cross-origin write into your app, so a wrong src fails closed rather than trusting anything that posts to it."
          code={`<DiagramCanvas src="https://draw.internal/?embed=1&proto=json&ui=min" />`}
        >
          <p style={{ margin: 0, fontSize: 14, color: "var(--zen-color-muted-fg)" }}>
            The frame is sandboxed without <code>allow-same-origin</code>, so the
            editor cannot reach this document. It communicates by{" "}
            <code>postMessage</code>, which needs none of it.
          </p>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>3. YappyDraw</h2>
        <CodeExample
          title={`provider="yappydraw" — Algorisys’s own editor`}
          description="Client-side, free, and self-hostable, which is the better answer for an exam that must not depend on a third party's uptime. It is not a URL swap: YappyDraw speaks a structured RPC bridge (`{__yappy, id, method, args}`) rather than draw.io's event stream, so the component has two protocol branches. Its documents are JSON, not XML. One thing to know before wiring it: YappyDraw refuses cross-origin control unless ITS operator allowlists your origin at deploy time — a framing page cannot opt itself in. Until that is configured the bridge times out, which is why onError exists."
          code={`<DiagramCanvas
  provider="yappydraw"
  value={json}
  onChange={setJson}
  onError={setError}
/>

// self-hosted:
<DiagramCanvas provider="yappydraw" src="https://draw.internal/" />`}
        >
          <div style={{ width: "100%" }}>
            <Deferred label="Frames yappydraw.com. Needs your origin allowlisted there to drive the API.">
              <DiagramCanvas
                provider="yappydraw"
                height="24rem"
                value=""
                onChange={() => {}}
                onError={setErr}
              />
            </Deferred>
            {err ? (
              <p style={{ marginTop: 8, fontSize: 12, color: "var(--zen-color-error)" }}>{err}</p>
            ) : null}
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>4. ArchitectureDraw</h2>
        <CodeExample
          title="The canvas with a heading row"
          description="The composition an assessment actually renders — a labelled canvas with its own actions, rather than a bare frame every caller has to wrap."
          code={`<ArchitectureDraw
  label="System design — question 4"
  actions={<Button size="sm">Save</Button>}
  value={xml}
  onChange={setXml}
/>`}
        >
          <Deferred label="Frames diagrams.net — a third-party origin.">
            <ArchitectureDraw
              label="System design — question 4"
              height="20rem"
              value={xml}
              onChange={setXml}
              actions={
                <Button size="sm" variant="outline" onClick={() => setXml(SEED)}>
                  Reset
                </Button>
              }
            />
          </Deferred>
        </CodeExample>
      </section>
    </div>
  );
};

export default NewDiagramCanvasDemo;
