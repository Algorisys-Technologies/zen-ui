import { DemoPage } from "./demo-helpers";

/**
 * ObjectPageLayout demo — the web-components port. `sections` is set as a JS
 * property (an array of { id, title, content } where content is a DOM node);
 * `header` / `title` / `showAnchorBar` are JS properties too. The active section
 * is the `selected-section-id` attribute (setting it scrolls there), and
 * `zen-selected-section-change` reports both clicks and scrolls.
 *
 * Every preview pins its own height with a framed wrapper, because the layout is
 * h-full — a container that grows to fit leaves the inner scroller nothing to
 * scroll. The host is set display:block; height:100% so h-full resolves.
 */

interface Section {
  id: string;
  title: string;
  content?: Node;
  subSections?: Section[];
}

function objStatus(state: string, text: string, announcement?: string): HTMLElement {
  const n = document.createElement("zen-object-status");
  n.setAttribute("state", state);
  if (announcement) n.setAttribute("state-announcement", announcement);
  n.textContent = text;
  return n;
}

function objNumber(value: string, unit: string, opts: { state?: string; emphasized?: boolean } = {}): HTMLElement {
  const n = document.createElement("zen-object-number");
  if (opts.state) n.setAttribute("state", opts.state);
  if (opts.emphasized) n.setAttribute("emphasized", "");
  (n as unknown as { value: string; unit: string }).value = value;
  (n as unknown as { value: string; unit: string }).unit = unit;
  return n;
}

function icon(name: string, size: number, className?: string): HTMLElement {
  const i = document.createElement("zen-icon");
  i.setAttribute("name", name);
  i.setAttribute("size", String(size));
  if (className) i.className = className;
  return i;
}

const Field = (label: string, value: string | Node): HTMLElement => {
  const wrap = document.createElement("div");
  wrap.className = "zen-flex zen-flex-col zen-gap-0.5";
  const l = document.createElement("span");
  l.className = "zen-text-xs zen-text-zen-muted-fg";
  l.textContent = label;
  const v = document.createElement("span");
  v.className = "zen-text-sm";
  if (typeof value === "string") v.textContent = value;
  else v.append(value);
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
  wrap.className = "zen-flex zen-flex-wrap zen-items-start zen-justify-between zen-gap-4";

  const left = document.createElement("div");
  left.className = "zen-flex zen-flex-col zen-gap-2";
  const ident = document.createElement("zen-object-identifier");
  (ident as unknown as { title: string; text: string }).title = "Titanium Bracket, 50×20mm";
  (ident as unknown as { title: string; text: string }).text = "Sold-to: Nordwind Logistik GmbH";
  left.append(ident);

  const meta = document.createElement("div");
  meta.className = "zen-flex zen-items-center zen-gap-3";
  const marker = document.createElement("zen-object-marker");
  marker.setAttribute("type", "favorite");
  marker.setAttribute("show-label", "");
  meta.append(objStatus("success", "Delivered", "Status"), marker);
  const created = document.createElement("span");
  created.className = "zen-inline-flex zen-items-center zen-gap-1 zen-text-xs zen-text-zen-muted-fg";
  created.append(icon("calendar", 12), document.createTextNode("Created 14 Jul 2026"));
  meta.append(created);
  left.append(meta);

  wrap.append(left, objNumber("128,400.00", "EUR", { state: "success", emphasized: true }));
  return wrap;
};

const Attachments = (): HTMLElement => {
  const ul = document.createElement("ul");
  ul.className = "zen-m-0 zen-flex zen-list-none zen-flex-col zen-gap-2 zen-p-0 zen-text-sm";
  for (const f of ["Purchase order.pdf", "Drawing rev-C.dwg", "Certificate of origin.pdf"]) {
    const li = document.createElement("li");
    li.className = "zen-flex zen-items-center zen-gap-2";
    li.append(icon("file", 14, "zen-text-zen-muted-fg"), document.createTextNode(f));
    ul.append(li);
  }
  return ul;
};

const makeSections = (p: string): Section[] => [
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
      Field("Delivery block", objStatus("none", "None")),
    ]),
  },
  {
    id: p + "billing",
    title: "Billing",
    content: Grid([
      Field("Billing block", objStatus("warning", "Price review")),
      Field("Invoice", "90012345"),
      Field("Net value", objNumber("128,400.00", "EUR")),
      Field("Tax", objNumber("24,396.00", "EUR")),
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

const makeSubSections = (): Section[] => [
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

interface LayoutOpts {
  title: string;
  sections: Section[];
  header?: Node;
  children?: Node;
  showAnchorBar?: boolean;
  selectedSectionId?: string;
  onChange?: (id: string) => void;
}

function objectPage(opts: LayoutOpts): HTMLElement {
  const host = document.createElement("zen-object-page-layout");
  const set = host as unknown as Record<string, unknown>;
  set.title = opts.title;
  set.sections = opts.sections;
  if (opts.header) set.header = opts.header;
  if (opts.showAnchorBar === false) set.showAnchorBar = false;
  if (opts.selectedSectionId) host.setAttribute("selected-section-id", opts.selectedSectionId);
  if (opts.onChange) {
    host.addEventListener("zen-selected-section-change", (e) =>
      opts.onChange!((e as CustomEvent).detail as string),
    );
  }
  if (opts.children) host.append(opts.children);
  host.style.display = "block";
  host.style.height = "100%";
  return host;
}

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

  const page = objectPage({
    title: "SO-4711",
    sections: CONTROLLED_SECTIONS,
    selectedSectionId: section,
    onChange: (id) => {
      section = id;
      page.setAttribute("selected-section-id", id);
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
    b.textContent = s.title;
    b.addEventListener("click", () => {
      section = s.id;
      page.setAttribute("selected-section-id", s.id);
      renderState();
    });
    controls.append(b);
  }
  controls.append(state);

  wrap.append(controls, framed(420, page));
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
        code: `const layout = document.createElement("zen-object-page-layout");
layout.title = "SO-4711";
layout.header = orderHeader();
layout.sections = [
  { id: "general", title: "General Information", content: generalFields() },
  { id: "items", title: "Line Items", content: itemTable() },
  { id: "delivery", title: "Delivery", content: deliveryFields() },
];
layout.addEventListener("zen-selected-section-change", (e) => console.log(e.detail));

// The height must come from the container: the layout is h-full.
const box = document.createElement("div");
box.style.height = "520px";
box.append(layout);`,
        render: () =>
          framed(
            520,
            objectPage({
              title: "SO-4711",
              header: OrderHeader(),
              sections: makeSections(""),
              children: objStatus("info", "Open"),
            }),
          ),
      },
      {
        title: "2. Sub-sections",
        codeTitle: "A section can be split into labelled sub-sections",
        codeDescription:
          "Sub-sections render inside their section with their own heading and id, so they can be linked to directly. The anchor bar stays at section level — a per-section sub-menu is not implemented.",
        code: `layout.sections = [
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
          framed(420, objectPage({ title: "SO-4711 — details", sections: makeSubSections() })),
      },
      {
        title: "3. Controlled selection",
        codeTitle: "selected-section-id is a command, not a mirror",
        codeDescription:
          "Setting it scrolls there. zen-selected-section-change fires for both a click and a scroll, so the two stay in step without fighting.",
        code: `let section = "delivery";
const layout = document.createElement("zen-object-page-layout");
layout.sections = SECTIONS;
layout.setAttribute("selected-section-id", section);
layout.addEventListener("zen-selected-section-change", (e) => {
  section = e.detail;
  layout.setAttribute("selected-section-id", section);
});`,
        render: () => ControlledExample(),
      },
      {
        title: "4. Without the anchor bar",
        codeTitle: "showAnchorBar = false",
        codeDescription:
          "Sections still render as labelled regions and the header still scrolls — there is just nothing to anchor to. For a short object with two sections, the bar is noise.",
        code: `const layout = document.createElement("zen-object-page-layout");
layout.title = "SO-4711";
layout.header = orderHeader();
layout.sections = SECTIONS;
layout.showAnchorBar = false;`,
        render: () =>
          framed(
            360,
            objectPage({
              title: "SO-4711",
              header: OrderHeader(),
              sections: makeSections("bare-"),
              showAnchorBar: false,
            }),
          ),
      },
    ],
  });
}
