import {
  ObjectStatus,
  ObjectNumber,
  ObjectIdentifier,
  ObjectMarker,
  type ObjectState,
  type ObjectMarkerType,
} from "./object/object";
import { CodeExample } from "./demo-helpers";

const STATES: ObjectState[] = ["none", "success", "warning", "error", "info"];
const MARKERS: ObjectMarkerType[] = ["flagged", "favorite", "draft", "locked", "unsaved"];

const row: React.CSSProperties = { display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" };

const NewObjectDemo: React.FC = () => (
  <div className="demo-page">
    <h1>Object atoms</h1>
    <p className="lede">
      The small semantic display elements object pages, list reports and tables
      are built out of: <code>ObjectStatus</code>, <code>ObjectNumber</code>,{" "}
      <code>ObjectIdentifier</code> and <code>ObjectMarker</code>. <code>state</code>{" "}
      maps onto the existing <code>--zen-color-&#123;success,warning,error,info&#125;</code>{" "}
      roles, so these retheme with everything else.
    </p>

    <section className="demo-section">
      <h2>1. ObjectStatus — states</h2>
      <CodeExample
        title="state drives colour and the default icon"
        description="none · success · warning · error · info"
        code={`<ObjectStatus state="success">Approved</ObjectStatus>
<ObjectStatus state="warning">Pending</ObjectStatus>
<ObjectStatus state="error">Rejected</ObjectStatus>
<ObjectStatus state="info">In review</ObjectStatus>`}
      >
        <div style={row}>
          {STATES.map((s) => (
            <ObjectStatus key={s} state={s}>
              {s}
            </ObjectStatus>
          ))}
        </div>
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>2. ObjectStatus — inverted</h2>
      <CodeExample
        title="A filled pill rather than coloured text"
        code={`<ObjectStatus inverted state="success">Approved</ObjectStatus>
<ObjectStatus inverted state="error">Rejected</ObjectStatus>`}
      >
        <div style={row}>
          {STATES.map((s) => (
            <ObjectStatus key={s} inverted state={s}>
              {s}
            </ObjectStatus>
          ))}
        </div>
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>3. ObjectStatus — custom icon, and no icon</h2>
      <CodeExample
        title="icon overrides the state default; icon={null} drops it"
        code={`<ObjectStatus state="success" icon="star">Featured</ObjectStatus>
<ObjectStatus state="info" icon="clock">Scheduled</ObjectStatus>
<ObjectStatus state="error" icon={null}>Text only</ObjectStatus>`}
      >
        <div style={row}>
          <ObjectStatus state="success" icon="star">
            Featured
          </ObjectStatus>
          <ObjectStatus state="info" icon="clock">
            Scheduled
          </ObjectStatus>
          <ObjectStatus state="error" icon={null}>
            Text only
          </ObjectStatus>
        </div>
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>4. ObjectStatus — stateAnnouncement (a11y)</h2>
      <CodeExample
        title="Colour alone must not carry meaning"
        description="stateAnnouncement adds screen-reader-only text naming the state. Inspect the DOM — it renders inside a .zen-sr-only span."
        code={`<ObjectStatus state="error" stateAnnouncement="Error:">
  Payment failed
</ObjectStatus>`}
      >
        <div style={row}>
          <ObjectStatus state="error" stateAnnouncement="Error:">
            Payment failed
          </ObjectStatus>
          <ObjectStatus state="success" stateAnnouncement="Success:">
            Payment cleared
          </ObjectStatus>
        </div>
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>5. ObjectNumber — value, unit, state</h2>
      <CodeExample
        title="value is pre-formatted — this component does not format"
        code={`<ObjectNumber value="1,234.56" unit="EUR" />
<ObjectNumber value="847" unit="pcs" state="success" />
<ObjectNumber value="-92.10" unit="EUR" state="error" />`}
      >
        <div style={row}>
          <ObjectNumber value="1,234.56" unit="EUR" />
          <ObjectNumber value="847" unit="pcs" state="success" />
          <ObjectNumber value="12" unit="days" state="warning" />
          <ObjectNumber value="-92.10" unit="EUR" state="error" />
          <ObjectNumber value="3" unit="open" state="info" />
        </div>
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>6. ObjectNumber — emphasized</h2>
      <CodeExample
        title="Larger and bolder — for the headline figure on an object page"
        code={`<ObjectNumber emphasized value="1,234.56" unit="EUR" state="success" />`}
      >
        <div style={row}>
          <ObjectNumber value="1,234.56" unit="EUR" state="success" />
          <ObjectNumber emphasized value="1,234.56" unit="EUR" state="success" />
        </div>
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>7. ObjectIdentifier</h2>
      <CodeExample
        title="The title/subtitle pair that names an object"
        code={`<ObjectIdentifier title="Acme Corporation" text="Customer · 1000473" />
<ObjectIdentifier title="Title only" />`}
      >
        <div style={{ ...row, gap: 32, alignItems: "flex-start" }}>
          <ObjectIdentifier title="Acme Corporation" text="Customer · 1000473" />
          <ObjectIdentifier title="PO-2024-0917" text="Purchase order" />
          <ObjectIdentifier title="Title only" />
        </div>
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>8. ObjectMarker — types</h2>
      <CodeExample
        title="Icon-only by default; still named for assistive tech"
        description="flagged · favorite · draft · locked · unsaved"
        code={`<ObjectMarker type="flagged" />
<ObjectMarker type="favorite" />
<ObjectMarker type="draft" />`}
      >
        <div style={row}>
          {MARKERS.map((t) => (
            <ObjectMarker key={t} type={t} />
          ))}
        </div>
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>9. ObjectMarker — showLabel and custom label</h2>
      <CodeExample
        title="showLabel prints the name; label overrides it"
        code={`<ObjectMarker type="draft" showLabel />
<ObjectMarker type="locked" showLabel label="Locked by A. Sharma" />`}
      >
        <div style={row}>
          {MARKERS.map((t) => (
            <ObjectMarker key={t} type={t} showLabel />
          ))}
          <ObjectMarker type="locked" showLabel label="Locked by A. Sharma" />
        </div>
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>10. In context — a list row</h2>
      <CodeExample
        title="What the atoms are for"
        code={`<ObjectIdentifier title="Acme Corporation" text="1000473" />
<ObjectMarker type="favorite" />
<ObjectNumber emphasized value="1,234.56" unit="EUR" state="success" />
<ObjectStatus state="success">Approved</ObjectStatus>`}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 0,
            width: "100%",
            border: "1px solid var(--zen-color-border)",
            borderRadius: "var(--zen-radius-md)",
          }}
        >
          {[
            { title: "Acme Corporation", id: "1000473", marker: "favorite", num: "1,234.56", state: "success", label: "Approved" },
            { title: "Globex Ltd", id: "1000891", marker: "draft", num: "88.00", state: "warning", label: "Pending" },
            { title: "Initech", id: "1000112", marker: "locked", num: "-92.10", state: "error", label: "Rejected" },
          ].map((r, i) => (
            <div
              key={r.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
                padding: "0.75rem 1rem",
                borderTop: i === 0 ? "none" : "1px solid var(--zen-color-border)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <ObjectIdentifier title={r.title} text={r.id} />
                <ObjectMarker type={r.marker as ObjectMarkerType} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <ObjectNumber emphasized value={r.num} unit="EUR" state={r.state as ObjectState} />
                <ObjectStatus state={r.state as ObjectState}>{r.label}</ObjectStatus>
              </div>
            </div>
          ))}
        </div>
      </CodeExample>
    </section>
  </div>
);

export default NewObjectDemo;
