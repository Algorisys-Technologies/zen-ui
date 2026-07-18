import * as React from "react";
import { ObjectPageLayout, type ObjectPageSection } from "./object-page/object-page";
import { ObjectIdentifier, ObjectNumber, ObjectStatus, ObjectMarker } from "./object/object";
import { Icon } from "./icon/icon";
import { CodeExample } from "./demo-helpers";

/**
 * ObjectPageLayout demo. Every preview pins its own height with an inline
 * style, because the component is `h-full` and min-height would be a floor
 * rather than a ceiling — a container that grows to fit leaves the inner
 * scroller nothing to scroll, and the scroll-spy nothing to spy on.
 */

const Field = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="zen-flex zen-flex-col zen-gap-0.5">
    <span className="zen-text-xs zen-text-zen-muted-fg">{label}</span>
    <span className="zen-text-sm">{value}</span>
  </div>
);

const Grid = ({ children }: { children: React.ReactNode }) => (
  <div className="zen-grid zen-grid-cols-2 zen-gap-4 md:zen-grid-cols-3">{children}</div>
);

const Lines = ({ rows }: { rows: [string, string, string][] }) => (
  <table className="zen-w-full zen-border-collapse zen-text-sm">
    <thead>
      <tr className="zen-text-left zen-text-xs zen-text-zen-muted-fg">
        <th className="zen-py-1 zen-font-medium">Item</th>
        <th className="zen-py-1 zen-font-medium">Material</th>
        <th className="zen-py-1 zen-text-right zen-font-medium">Net value</th>
      </tr>
    </thead>
    <tbody>
      {rows.map((r) => (
        <tr key={r[0]} className="zen-border-t zen-border-zen-border">
          <td className="zen-py-1.5">{r[0]}</td>
          <td className="zen-py-1.5">{r[1]}</td>
          <td className="zen-py-1.5 zen-text-right zen-tabular-nums">{r[2]}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

const OrderHeader = () => (
  <div className="zen-flex zen-flex-wrap zen-items-start zen-justify-between zen-gap-4">
    <div className="zen-flex zen-flex-col zen-gap-2">
      <ObjectIdentifier title="Titanium Bracket, 50×20mm" text="Sold-to: Nordwind Logistik GmbH" />
      <div className="zen-flex zen-items-center zen-gap-3">
        <ObjectStatus state="success" stateAnnouncement="Status">
          Delivered
        </ObjectStatus>
        <ObjectMarker type="favorite" showLabel />
        <span className="zen-inline-flex zen-items-center zen-gap-1 zen-text-xs zen-text-zen-muted-fg">
          <Icon name="calendar" size={12} />
          Created 14 Jul 2026
        </span>
      </div>
    </div>
    <ObjectNumber value="128,400.00" unit="EUR" state="success" emphasized />
  </div>
);

const makeSections = (p: string): ObjectPageSection[] => [
  {
    id: p + "general",
    title: "General Information",
    content: (
      <Grid>
        <Field label="Order number" value="SO-4711" />
        <Field label="Order type" value="Standard (OR)" />
        <Field label="Sales organisation" value="1000 — Germany" />
        <Field label="Distribution channel" value="10 — Direct sales" />
        <Field label="Division" value="00 — Cross-division" />
        <Field label="Currency" value="EUR" />
        <Field label="Incoterms" value="CIF Hamburg" />
        <Field label="Payment terms" value="Net 30" />
        <Field label="Created by" value="R. Pillai" />
      </Grid>
    ),
  },
  {
    id: p + "items",
    title: "Line Items",
    content: (
      <Lines
        rows={[
          ["10", "Titanium Bracket 50×20", "48,000.00"],
          ["20", "Stainless Fastener M8", "12,400.00"],
          ["30", "Assembly Service", "18,000.00"],
          ["40", "Protective Coating", "24,000.00"],
          ["50", "Packaging, export grade", "6,000.00"],
          ["60", "Freight, Hamburg → Oslo", "20,000.00"],
        ]}
      />
    ),
  },
  {
    id: p + "delivery",
    title: "Delivery",
    content: (
      <Grid>
        <Field label="Ship-to" value="Nordwind Logistik, Oslo" />
        <Field label="Shipping point" value="1000 — Hamburg" />
        <Field label="Route" value="EU-N-01" />
        <Field label="Requested date" value="28 Jul 2026" />
        <Field label="Confirmed date" value="26 Jul 2026" />
        <Field label="Delivery block" value={<ObjectStatus state="none">None</ObjectStatus>} />
      </Grid>
    ),
  },
  {
    id: p + "billing",
    title: "Billing",
    content: (
      <Grid>
        <Field label="Billing block" value={<ObjectStatus state="warning">Price review</ObjectStatus>} />
        <Field label="Invoice" value="90012345" />
        <Field label="Net value" value={<ObjectNumber value="128,400.00" unit="EUR" />} />
        <Field label="Tax" value={<ObjectNumber value="24,396.00" unit="EUR" />} />
        <Field label="Terms" value="Net 30" />
        <Field label="Dunning level" value="0" />
      </Grid>
    ),
  },
  {
    id: p + "attachments",
    title: "Attachments",
    content: (
      <ul className="zen-m-0 zen-flex zen-list-none zen-flex-col zen-gap-2 zen-p-0 zen-text-sm">
        {["Purchase order.pdf", "Drawing rev-C.dwg", "Certificate of origin.pdf"].map((f) => (
          <li key={f} className="zen-flex zen-items-center zen-gap-2">
            <Icon name="file" size={14} className="zen-text-zen-muted-fg" />
            {f}
          </li>
        ))}
      </ul>
    ),
  },
];

const SUB_SECTIONS: ObjectPageSection[] = [
  {
    id: "sub-general",
    title: "General Information",
    subSections: [
      {
        id: "sub-general-basic",
        title: "Basic data",
        content: (
          <Grid>
            <Field label="Order number" value="SO-4711" />
            <Field label="Order type" value="Standard (OR)" />
            <Field label="Currency" value="EUR" />
          </Grid>
        ),
      },
      {
        id: "sub-general-org",
        title: "Organisational data",
        content: (
          <Grid>
            <Field label="Sales organisation" value="1000 — Germany" />
            <Field label="Distribution channel" value="10 — Direct sales" />
            <Field label="Division" value="00 — Cross-division" />
          </Grid>
        ),
      },
    ],
  },
  {
    id: "sub-partners",
    title: "Business Partners",
    subSections: [
      {
        id: "sub-partners-sold",
        title: "Sold-to party",
        content: <Field label="Customer" value="Nordwind Logistik GmbH (0000102345)" />,
      },
      {
        id: "sub-partners-ship",
        title: "Ship-to party",
        content: <Field label="Customer" value="Nordwind Oslo Terminal (0000102377)" />,
      },
    ],
  },
  {
    id: "sub-history",
    title: "History",
    content: (
      <ol className="zen-m-0 zen-flex zen-list-none zen-flex-col zen-gap-3 zen-p-0 zen-text-sm">
        {[
          ["14 Jul 2026", "Order created by R. Pillai"],
          ["18 Jul 2026", "Credit check passed"],
          ["26 Jul 2026", "Goods issued from Hamburg"],
          ["29 Jul 2026", "Delivered, signed by K. Halvorsen"],
        ].map(([when, what]) => (
          <li key={when} className="zen-flex zen-gap-3">
            <span className="zen-w-24 zen-shrink-0 zen-text-xs zen-text-zen-muted-fg">{when}</span>
            <span>{what}</span>
          </li>
        ))}
      </ol>
    ),
  },
];

/**
 * A section's `id` lands on the DOM as-is so it can be linked to, which means it
 * has to be unique in the document. Real usage is one object page per screen;
 * this demo puts four on one, so each gets its own id namespace rather than
 * three elements answering to id="billing".
 *
 * Built by a factory rather than spread from one array, because in Solid a JSX
 * expression IS a DOM node — sharing one `content` between three object pages
 * would MOVE it into the last one and leave the first two empty, where React
 * would happily render the same element descriptor three times. Calling the
 * factory per page is the one shape that is correct in both bindings.
 */
const SECTIONS = makeSections("");
const CONTROLLED_SECTIONS = makeSections("ctl-");
const BARE_SECTIONS = makeSections("bare-");

const ControlledExample = () => {
  const [section, setSection] = React.useState("ctl-delivery");
  return (
    <div className="zen-flex zen-flex-col zen-gap-3">
      <div className="zen-flex zen-flex-wrap zen-items-center zen-gap-2 zen-text-sm">
        <span className="zen-text-zen-muted-fg">Jump to:</span>
        {CONTROLLED_SECTIONS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSection(s.id)}
            className="zen-cursor-pointer zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-px-2 zen-py-1 zen-text-xs hover:zen-bg-zen-muted"
          >
            {s.title}
          </button>
        ))}
        <span className="zen-ml-auto zen-text-xs zen-text-zen-muted-fg">
          selectedSectionId: <code>{section}</code>
        </span>
      </div>
      <div
        className="zen-overflow-hidden zen-rounded-zen-md zen-border zen-border-zen-border"
        style={{ height: 420 }}
      >
        <ObjectPageLayout
          title="SO-4711"
          sections={CONTROLLED_SECTIONS}
          selectedSectionId={section}
          onSelectedSectionChange={setSection}
        />
      </div>
    </div>
  );
};

const NewObjectPageDemo = () => (
  <div className="demo-page">
    <h1>ObjectPageLayout</h1>
    <p className="lede">
      The object detail page: a title bar that stays, an object header that
      scrolls away, and a sticky anchor bar whose links stay in sync with the
      section you are reading. <code>sections</code> is data rather than children
      — the anchor bar has to render the whole list before any section is on
      screen, and the scroll-spy needs an element per section to observe. Both
      would otherwise mean rebuilding the list out of the DOM on every scroll.
    </p>

    <section className="demo-section">
      <h2>1. Anchored sections, synced to the scroll</h2>
      <CodeExample
        title="Click an anchor; then scroll the content"
        description="Clicking scrolls the section to just under the bar. Scrolling by hand moves the current anchor — an IntersectionObserver rooted at the content scroller, not the window (this demo shell's .app-content owns page scrolling, so a window-based spy would never fire)."
        previewStyle={{ display: "block" }}
        code={`const SECTIONS: ObjectPageSection[] = [
  { id: "general", title: "General Information", content: <GeneralFields /> },
  { id: "items", title: "Line Items", content: <ItemTable /> },
  { id: "delivery", title: "Delivery", content: <DeliveryFields /> },
];

// The height must come from the container: the layout is h-full, and a
// container that grows to fit leaves the inner scroller nothing to scroll.
<div style={{ height: 520 }}>
  <ObjectPageLayout
    title="SO-4711"
    header={<OrderHeader />}
    sections={SECTIONS}
    onSelectedSectionChange={(id) => console.log(id)}
  />
</div>`}
      >
        <div
          className="zen-overflow-hidden zen-rounded-zen-md zen-border zen-border-zen-border"
          style={{ height: 520 }}
        >
          <ObjectPageLayout title="SO-4711" header={<OrderHeader />} sections={SECTIONS}>
            <ObjectStatus state="info">Open</ObjectStatus>
          </ObjectPageLayout>
        </div>
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>2. Sub-sections</h2>
      <CodeExample
        title="A section can be split into labelled sub-sections"
        description="Sub-sections render inside their section with their own heading and id, so they can be linked to directly. The anchor bar stays at section level — a per-section sub-menu is not implemented."
        previewStyle={{ display: "block" }}
        code={`const SECTIONS: ObjectPageSection[] = [
  {
    id: p + "general",
    title: "General Information",
    subSections: [
      { id: "general-basic", title: "Basic data", content: <BasicFields /> },
      { id: "general-org", title: "Organisational data", content: <OrgFields /> },
    ],
  },
];`}
      >
        <div
          className="zen-overflow-hidden zen-rounded-zen-md zen-border zen-border-zen-border"
          style={{ height: 420 }}
        >
          <ObjectPageLayout title="SO-4711 — details" sections={SUB_SECTIONS} />
        </div>
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>3. Controlled selection</h2>
      <CodeExample
        title="selectedSectionId is a command, not a mirror"
        description="Setting it scrolls there. onSelectedSectionChange fires for both a click and a scroll, so the two stay in step without fighting."
        previewStyle={{ display: "block" }}
        code={`const [section, setSection] = React.useState("delivery");

<ObjectPageLayout
  title="SO-4711"
  sections={SECTIONS}
  selectedSectionId={section}
  onSelectedSectionChange={setSection}
/>`}
      >
        <ControlledExample />
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>4. Without the anchor bar</h2>
      <CodeExample
        title="showAnchorBar={false}"
        description="Sections still render as labelled regions and the header still scrolls — there is just nothing to anchor to. For a short object with two sections, the bar is noise."
        previewStyle={{ display: "block" }}
        code={`<ObjectPageLayout
  title="SO-4711"
  header={<OrderHeader />}
  sections={SECTIONS}
  showAnchorBar={false}
/>`}
      >
        <div
          className="zen-overflow-hidden zen-rounded-zen-md zen-border zen-border-zen-border"
          style={{ height: 360 }}
        >
          <ObjectPageLayout
            title="SO-4711"
            header={<OrderHeader />}
            sections={BARE_SECTIONS}
            showAnchorBar={false}
          />
        </div>
      </CodeExample>
    </section>
  </div>
);

export default NewObjectPageDemo;
