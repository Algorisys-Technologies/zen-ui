import { type JSX, For } from "solid-js";
import {
  ObjectStatus,
  ObjectNumber,
  ObjectIdentifier,
  ObjectMarker,
  type ObjectState,
  type ObjectMarkerType,
} from "./object/object";
import { DemoPage, DemoSection } from "./demo-helpers";

const STATES: ObjectState[] = ["none", "success", "warning", "error", "info"];
const MARKERS: ObjectMarkerType[] = ["flagged", "favorite", "draft", "locked", "unsaved"];

const row: JSX.CSSProperties = {
  display: "flex",
  gap: "1rem",
  "flex-wrap": "wrap",
  "align-items": "center",
};

const ROWS: { title: string; id: string; marker: ObjectMarkerType; num: string; state: ObjectState; label: string }[] = [
  { title: "Acme Corporation", id: "1000473", marker: "favorite", num: "1,234.56", state: "success", label: "Approved" },
  { title: "Globex Ltd", id: "1000891", marker: "draft", num: "88.00", state: "warning", label: "Pending" },
  { title: "Initech", id: "1000112", marker: "locked", num: "-92.10", state: "error", label: "Rejected" },
];

const NewObjectDemo = () => (
  <DemoPage
    title="Object atoms"
    description={
      <>
        The small semantic display elements object pages, list reports and tables
        are built out of: <code>ObjectStatus</code>, <code>ObjectNumber</code>,{" "}
        <code>ObjectIdentifier</code> and <code>ObjectMarker</code>. <code>state</code>{" "}
        maps onto the existing <code>--zen-color-&#123;success,warning,error,info&#125;</code>{" "}
        roles, so these retheme with everything else.
      </>
    }
  >
    <DemoSection
      title="1. ObjectStatus — states"
      codeTitle="state drives colour and the default icon"
      codeDescription="none · success · warning · error · info"
      code={`<ObjectStatus state="success">Approved</ObjectStatus>
<ObjectStatus state="warning">Pending</ObjectStatus>
<ObjectStatus state="error">Rejected</ObjectStatus>
<ObjectStatus state="info">In review</ObjectStatus>`}
    >
      <div style={row}>
        <For each={STATES}>{(s) => <ObjectStatus state={s}>{s}</ObjectStatus>}</For>
      </div>
    </DemoSection>

    <DemoSection
      title="2. ObjectStatus — inverted"
      codeTitle="A filled pill rather than coloured text"
      code={`<ObjectStatus inverted state="success">Approved</ObjectStatus>
<ObjectStatus inverted state="error">Rejected</ObjectStatus>`}
    >
      <div style={row}>
        <For each={STATES}>{(s) => <ObjectStatus inverted state={s}>{s}</ObjectStatus>}</For>
      </div>
    </DemoSection>

    <DemoSection
      title="3. ObjectStatus — custom icon, and no icon"
      codeTitle="icon overrides the state default; icon={null} drops it"
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
    </DemoSection>

    <DemoSection
      title="4. ObjectStatus — stateAnnouncement (a11y)"
      codeTitle="Colour alone must not carry meaning"
      codeDescription="stateAnnouncement adds screen-reader-only text naming the state. Inspect the DOM — it renders inside a .zen-sr-only span."
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
    </DemoSection>

    <DemoSection
      title="5. ObjectNumber — value, unit, state"
      codeTitle="value is pre-formatted — this component does not format"
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
    </DemoSection>

    <DemoSection
      title="6. ObjectNumber — emphasized"
      codeTitle="Larger and bolder — for the headline figure on an object page"
      code={`<ObjectNumber emphasized value="1,234.56" unit="EUR" state="success" />`}
    >
      <div style={row}>
        <ObjectNumber value="1,234.56" unit="EUR" state="success" />
        <ObjectNumber emphasized value="1,234.56" unit="EUR" state="success" />
      </div>
    </DemoSection>

    <DemoSection
      title="7. ObjectIdentifier"
      codeTitle="The title/subtitle pair that names an object"
      code={`<ObjectIdentifier title="Acme Corporation" text="Customer · 1000473" />
<ObjectIdentifier title="Title only" />`}
    >
      <div style={{ ...row, gap: "2rem", "align-items": "flex-start" }}>
        <ObjectIdentifier title="Acme Corporation" text="Customer · 1000473" />
        <ObjectIdentifier title="PO-2024-0917" text="Purchase order" />
        <ObjectIdentifier title="Title only" />
      </div>
    </DemoSection>

    <DemoSection
      title="8. ObjectMarker — types"
      codeTitle="Icon-only by default; still named for assistive tech"
      codeDescription="flagged · favorite · draft · locked · unsaved"
      code={`<ObjectMarker type="flagged" />
<ObjectMarker type="favorite" />
<ObjectMarker type="draft" />`}
    >
      <div style={row}>
        <For each={MARKERS}>{(t) => <ObjectMarker type={t} />}</For>
      </div>
    </DemoSection>

    <DemoSection
      title="9. ObjectMarker — showLabel and custom label"
      codeTitle="showLabel prints the name; label overrides it"
      code={`<ObjectMarker type="draft" showLabel />
<ObjectMarker type="locked" showLabel label="Locked by A. Sharma" />`}
    >
      <div style={row}>
        <For each={MARKERS}>{(t) => <ObjectMarker type={t} showLabel />}</For>
        <ObjectMarker type="locked" showLabel label="Locked by A. Sharma" />
      </div>
    </DemoSection>

    <DemoSection
      title="10. In context — a list row"
      codeTitle="What the atoms are for"
      code={`<ObjectIdentifier title="Acme Corporation" text="1000473" />
<ObjectMarker type="favorite" />
<ObjectNumber emphasized value="1,234.56" unit="EUR" state="success" />
<ObjectStatus state="success">Approved</ObjectStatus>`}
    >
      <div
        style={{
          display: "flex",
          "flex-direction": "column",
          width: "100%",
          border: "1px solid var(--zen-color-border)",
          "border-radius": "var(--zen-radius-md)",
        }}
      >
        <For each={ROWS}>
          {(r, i) => (
            <div
              style={{
                display: "flex",
                "align-items": "center",
                "justify-content": "space-between",
                gap: "1rem",
                padding: "0.75rem 1rem",
                "border-top": i() === 0 ? "none" : "1px solid var(--zen-color-border)",
              }}
            >
              <div style={{ display: "flex", "align-items": "center", gap: "0.5rem" }}>
                <ObjectIdentifier title={r.title} text={r.id} />
                <ObjectMarker type={r.marker} />
              </div>
              <div style={{ display: "flex", "align-items": "center", gap: "1rem" }}>
                <ObjectNumber emphasized value={r.num} unit="EUR" state={r.state} />
                <ObjectStatus state={r.state}>{r.label}</ObjectStatus>
              </div>
            </div>
          )}
        </For>
      </div>
    </DemoSection>
  </DemoPage>
);

export default NewObjectDemo;
