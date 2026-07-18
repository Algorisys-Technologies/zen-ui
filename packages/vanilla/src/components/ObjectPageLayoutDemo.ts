import { ObjectPageLayout, type ObjectPageSection } from "./object-page/object-page";
import {
  ObjectIdentifier,
  ObjectNumber,
  ObjectStatus,
  ObjectMarker,
} from "./object/object";
import { Icon } from "./icon/icon";
import { DemoPage } from "./demo-helpers";
import { toNodes, type Child } from "../lib/component";

/**
 * ObjectPageLayout demo. Every preview pins its own height with an inline style,
 * because the component is `h-full` and min-height would be a floor rather than a
 * ceiling — a container that grows to fit leaves the inner scroller nothing to
 * scroll, and the scroll-spy nothing to spy on.
 *
 * Sections are built by a factory per page rather than shared from one array: in
 * a no-framework binding a built node is a real DOM node, so sharing one content
 * node between pages would MOVE it into the last and leave the others empty.
 */

const Field = (label: string, value: Child): HTMLElement => {
  const wrap = document.createElement("div");
  wrap.className = "zen-flex zen-flex-col zen-gap-0.5";
  const l = document.createElement("span");
  l.className = "zen-text-xs zen-text-zen-muted-fg";
  l.textContent = label;
  const v = document.createElement("span");
  v.className = "zen-text-sm";
  v.append(...toNodes(value));
  wrap.append(l, v);
  return wrap;
};

const Grid = (children: HTMLElement[]): HTMLElement => {
  const grid = document.createElement("div");
  grid.className = "zen-grid zen-grid-cols-2 zen-gap-4 md:zen-grid-cols-3";
  grid.append(...children);
  return grid;
};

const Lines = (rows: [string, string, string][]): HTMLElement => {
  const table = document.createElement("table");
  table.className = "zen-w-full zen-border-collapse zen-text-sm";
  table.innerHTML = `
    <thead>
      <tr class="zen-text-left zen-text-xs zen-text-zen-muted-fg">
        <th class="zen-py-1 zen-font-medium">Item</th>
        <th class="zen-py-1 zen-font-medium">Material</th>
        <th class="zen-py-1 zen-text-right zen-font-medium">Net value</th>
      </tr>
    </thead>`;
  const tbody = document.createElement("tbody");
  for (const r of rows) {
    const tr = document.createElement("tr");
    tr.className = "zen-border-t zen-border-zen-border";
    const c0 = document.createElement("td");
    c0.className = "zen-py-1.5";
    c0.textContent = r[0];
    const c1 = document.createElement("td");
    c1.className = "zen-py-1.5";
    c1.textContent = r[1];
    const c2 = document.createElement("td");
    c2.className = "zen-py-1.5 zen-text-right zen-tabular-nums";
    c2.textContent = r[2];
    tr.append(c0, c1, c2);
    tbody.append(tr);
  }
  table.append(tbody);
  return table;
};

const OrderHeader = (): HTMLElement => {
  const wrap = document.createElement("div");
  wrap.className =
    "zen-flex zen-flex-wrap zen-items-start zen-justify-between zen-gap-4";

  const left = document.createElement("div");
  left.className = "zen-flex zen-flex-col zen-gap-2";
  left.append(
    ObjectIdentifier({
      title: "Titanium Bracket, 50×20mm",
      text: "Sold-to: Nordwind Logistik GmbH",
    }).el,
  );

  const meta = document.createElement("div");
  meta.className = "zen-flex zen-items-center zen-gap-3";
  meta.append(
    ObjectStatus({ state: "success", stateAnnouncement: "Status", children: "Delivered" }).el,
    ObjectMarker({ type: "favorite", showLabel: true }).el,
  );
  const created = document.createElement("span");
  created.className =
    "zen-inline-flex zen-items-center zen-gap-1 zen-text-xs zen-text-zen-muted-fg";
  created.append(Icon({ name: "calendar", size: 12 }).el, document.createTextNode("Created 14 Jul 2026"));
  meta.append(created);
  left.append(meta);

  wrap.append(
    left,
    ObjectNumber({ value: "128,400.00", unit: "EUR", state: "success", emphasized: true }).el,
  );
  return wrap;
};

const Attachments = (): HTMLElement => {
  const ul = document.createElement("ul");
  ul.className = "zen-m-0 zen-flex zen-list-none zen-flex-col zen-gap-2 zen-p-0 zen-text-sm";
  for (const f of ["Purchase order.pdf", "Drawing rev-C.dwg", "Certificate of origin.pdf"]) {
    const li = document.createElement("li");
    li.className = "zen-flex zen-items-center zen-gap-2";
    li.append(
      Icon({ name: "file", size: 14, class: "zen-text-zen-muted-fg" }).el,
      document.createTextNode(f),
    );
    ul.append(li);
  }
  return ul;
};

const makeSections = (p: string): ObjectPageSection[] => [
  {
    id: p + "general",
    title: "General Information",
    content: Grid([
      Field("Order number", "SO-4711"),
      Field("Order type", "Standard (OR)"),
      Field("Sales organisation", "1000 — Germany"),
      Field("Distribution channel", "10 — Direct sales"),
      Field("Division", "00 — Cross-division"),
      Field("Currency", "EUR"),
      Field("Incoterms", "CIF Hamburg"),
      Field("Payment terms", "Net 30"),
      Field("Created by", "R. Pillai"),
    ]),
  },
  {
    id: p + "items",
    title: "Line Items",
    content: Lines([
      ["10", "Titanium Bracket 50×20", "48,000.00"],
      ["20", "Stainless Fastener M8", "12,400.00"],
      ["30", "Assembly Service", "18,000.00"],
      ["40", "Protective Coating", "24,000.00"],
      ["50", "Packaging, export grade", "6,000.00"],
      ["60", "Freight, Hamburg → Oslo", "20,000.00"],
    ]),
  },
  {
    id: p + "delivery",
    title: "Delivery",
    content: Grid([
      Field("Ship-to", "Nordwind Logistik, Oslo"),
      Field("Shipping point", "1000 — Hamburg"),
      Field("Route", "EU-N-01"),
      Field("Requested date", "28 Jul 2026"),
      Field("Confirmed date", "26 Jul 2026"),
      Field("Delivery block", ObjectStatus({ state: "none", children: "None" })),
    ]),
  },
  {
    id: p + "billing",
    title: "Billing",
    content: Grid([
      Field("Billing block", ObjectStatus({ state: "warning", children: "Price review" })),
      Field("Invoice", "90012345"),
      Field("Net value", ObjectNumber({ value: "128,400.00", unit: "EUR" })),
      Field("Tax", ObjectNumber({ value: "24,396.00", unit: "EUR" })),
      Field("Terms", "Net 30"),
      Field("Dunning level", "0"),
    ]),
  },
  {
    id: p + "attachments",
    title: "Attachments",
    content: Attachments(),
  },
];

const makeSubSections = (): ObjectPageSection[] => [
  {
    id: "sub-general",
    title: "General Information",
    subSections: [
      {
        id: "sub-general-basic",
        title: "Basic data",
        content: Grid([
          Field("Order number", "SO-4711"),
          Field("Order type", "Standard (OR)"),
          Field("Currency", "EUR"),
        ]),
      },
      {
        id: "sub-general-org",
        title: "Organisational data",
        content: Grid([
          Field("Sales organisation", "1000 — Germany"),
          Field("Distribution channel", "10 — Direct sales"),
          Field("Division", "00 — Cross-division"),
        ]),
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
        content: Field("Customer", "Nordwind Logistik GmbH (0000102345)"),
      },
      {
        id: "sub-partners-ship",
        title: "Ship-to party",
        content: Field("Customer", "Nordwind Oslo Terminal (0000102377)"),
      },
    ],
  },
  {
    id: "sub-history",
    title: "History",
    content: (() => {
      const ol = document.createElement("ol");
      ol.className = "zen-m-0 zen-flex zen-list-none zen-flex-col zen-gap-3 zen-p-0 zen-text-sm";
      for (const [when, what] of [
        ["14 Jul 2026", "Order created by R. Pillai"],
        ["18 Jul 2026", "Credit check passed"],
        ["26 Jul 2026", "Goods issued from Hamburg"],
        ["29 Jul 2026", "Delivered, signed by K. Halvorsen"],
      ]) {
        const li = document.createElement("li");
        li.className = "zen-flex zen-gap-3";
        const w = document.createElement("span");
        w.className = "zen-w-24 zen-shrink-0 zen-text-xs zen-text-zen-muted-fg";
        w.textContent = when;
        const t = document.createElement("span");
        t.textContent = what;
        li.append(w, t);
        ol.append(li);
      }
      return ol;
    })(),
  },
];

/** A fixed-height, bordered frame — the object page needs a definite height. */
const framed = (height: number, child: Node): HTMLElement => {
  const box = document.createElement("div");
  box.className = "zen-overflow-hidden zen-rounded-zen-md zen-border zen-border-zen-border";
  box.style.height = `${height}px`;
  box.style.width = "100%";
  box.append(child);
  return box;
};

const ControlledExample = (): HTMLElement => {
  const CONTROLLED_SECTIONS = makeSections("ctl-");
  let section = "ctl-delivery";

  const wrap = document.createElement("div");
  wrap.className = "zen-flex zen-flex-col zen-gap-3";
  wrap.style.width = "100%";

  const controls = document.createElement("div");
  controls.className = "zen-flex zen-flex-wrap zen-items-center zen-gap-2 zen-text-sm";
  const jump = document.createElement("span");
  jump.className = "zen-text-zen-muted-fg";
  jump.textContent = "Jump to:";
  controls.append(jump);

  const state = document.createElement("span");
  state.className = "zen-ml-auto zen-text-xs zen-text-zen-muted-fg";

  const page = ObjectPageLayout({
    title: "SO-4711",
    sections: CONTROLLED_SECTIONS,
    selectedSectionId: section,
    onSelectedSectionChange: (id) => {
      section = id;
      page.update({ selectedSectionId: id });
      renderState();
    },
  });

  const renderState = () => {
    state.replaceChildren(document.createTextNode("selectedSectionId: "));
    const code = document.createElement("code");
    code.textContent = section;
    state.append(code);
  };
  renderState();

  for (const s of CONTROLLED_SECTIONS) {
    const b = document.createElement("button");
    b.type = "button";
    b.className =
      "zen-cursor-pointer zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-px-2 zen-py-1 zen-text-xs hover:zen-bg-zen-muted";
    b.append(...toNodes(s.title));
    b.addEventListener("click", () => {
      section = s.id;
      page.update({ selectedSectionId: s.id });
      renderState();
    });
    controls.append(b);
  }
  controls.append(state);

  wrap.append(controls, framed(420, page.el));
  return wrap;
};

export default function ObjectPageLayoutDemo(): HTMLElement {
  return DemoPage({
    title: "ObjectPageLayout",
    description:
      "The object detail page: a title bar that stays, an object header that scrolls away, and a sticky anchor bar whose links stay in sync with the section you are reading. sections is data rather than children — the anchor bar has to render the whole list before any section is on screen, and the scroll-spy needs an element per section to observe.",
    sections: [
      {
        title: "1. Anchored sections, synced to the scroll",
        codeTitle: "Click an anchor; then scroll the content",
        codeDescription:
          "Clicking scrolls the section to just under the bar. Scrolling by hand moves the current anchor — an IntersectionObserver rooted at the content scroller, not the window (this demo shell's .app-content owns page scrolling, so a window-based spy would never fire).",
        code: `const SECTIONS: ObjectPageSection[] = [
  { id: "general", title: "General Information", content: generalFields() },
  { id: "items", title: "Line Items", content: itemTable() },
  { id: "delivery", title: "Delivery", content: deliveryFields() },
];

// The height must come from the container: the layout is h-full, and a
// container that grows to fit leaves the inner scroller nothing to scroll.
const box = document.createElement("div");
box.style.height = "520px";
box.append(
  ObjectPageLayout({
    title: "SO-4711",
    header: orderHeader(),
    sections: SECTIONS,
    onSelectedSectionChange: (id) => console.log(id),
  }).el,
);`,
        render: () =>
          framed(
            520,
            ObjectPageLayout({
              title: "SO-4711",
              header: OrderHeader(),
              sections: makeSections(""),
              children: ObjectStatus({ state: "info", children: "Open" }),
            }).el,
          ),
      },
      {
        title: "2. Sub-sections",
        codeTitle: "A section can be split into labelled sub-sections",
        codeDescription:
          "Sub-sections render inside their section with their own heading and id, so they can be linked to directly. The anchor bar stays at section level — a per-section sub-menu is not implemented.",
        code: `const SECTIONS: ObjectPageSection[] = [
  {
    id: "general",
    title: "General Information",
    subSections: [
      { id: "general-basic", title: "Basic data", content: basicFields() },
      { id: "general-org", title: "Organisational data", content: orgFields() },
    ],
  },
];`,
        render: () =>
          framed(
            420,
            ObjectPageLayout({ title: "SO-4711 — details", sections: makeSubSections() }).el,
          ),
      },
      {
        title: "3. Controlled selection",
        codeTitle: "selectedSectionId is a command, not a mirror",
        codeDescription:
          "Setting it scrolls there. onSelectedSectionChange fires for both a click and a scroll, so the two stay in step without fighting.",
        code: `let section = "delivery";
const page = ObjectPageLayout({
  title: "SO-4711",
  sections: SECTIONS,
  selectedSectionId: section,
  onSelectedSectionChange: (id) => {
    section = id;
    page.update({ selectedSectionId: id });
  },
});`,
        render: () => ControlledExample(),
      },
      {
        title: "4. Without the anchor bar",
        codeTitle: "showAnchorBar: false",
        codeDescription:
          "Sections still render as labelled regions and the header still scrolls — there is just nothing to anchor to. For a short object with two sections, the bar is noise.",
        code: `ObjectPageLayout({
  title: "SO-4711",
  header: orderHeader(),
  sections: SECTIONS,
  showAnchorBar: false,
});`,
        render: () =>
          framed(
            360,
            ObjectPageLayout({
              title: "SO-4711",
              header: OrderHeader(),
              sections: makeSections("bare-"),
              showAnchorBar: false,
            }).el,
          ),
      },
    ],
  });
}
