import { DemoPage } from "./demo-helpers";

/**
 * DynamicPage demo — the web-components mirror of the vanilla DynamicPageDemo.
 * <zen-dynamic-page> holds <zen-dynamic-page-title> / <zen-dynamic-page-header> /
 * <zen-dynamic-page-footer> as light-DOM children; the title's slots
 * (heading/subheading/actions/breadcrumbs/expanded/snapped) are JS properties.
 *
 * The FRAME (fixed height + border) is set on the HOST element rather than passed
 * as a `class` prop: the factory's scroll container is `h-full` and fills the host,
 * so the host supplies the scroll context.
 *
 * KNOWN LIMITATION (flagged): the title/header/footer sub-parts are wired to the
 * page's scroll state through an in-process handle brand (a Symbol) that the
 * factory reads off its children. Across the custom-element boundary the factory
 * receives the wrapper ELEMENTS, not those branded handles, so the header renders
 * but does NOT snap/pin, and the controlled toggle (section 5) updates the readout
 * without collapsing the header. The layout renders; the scroll interactions do not
 * cross the element boundary.
 */

const FRAME =
  "zen-h-[420px] zen-w-full zen-overflow-hidden zen-rounded-zen-md zen-border zen-border-zen-border";

function div(className: string, children?: Node | Node[]): HTMLElement {
  const node = document.createElement("div");
  node.className = className;
  if (children) node.append(...(Array.isArray(children) ? children : [children]));
  return node;
}

function span(className: string, text: string): HTMLElement {
  const s = document.createElement("span");
  s.className = className;
  s.textContent = text;
  return s;
}

const setProp = (node: HTMLElement, name: string, value: unknown): void => {
  (node as unknown as Record<string, unknown>)[name] = value;
};

const button = (text: string, attrs: Record<string, string> = {}): HTMLElement => {
  const b = document.createElement("zen-button");
  b.setAttribute("type", "button");
  for (const [k, v] of Object.entries(attrs)) b.setAttribute(k, v);
  b.textContent = text;
  return b;
};

const Fact = (label: string, value: string): HTMLElement =>
  div("zen-min-w-0", [
    div("zen-text-xs zen-uppercase zen-tracking-wide zen-text-zen-muted-fg", document.createTextNode(label)),
    div("zen-truncate zen-text-sm zen-font-medium", document.createTextNode(value)),
  ]);

const HeaderFacts = (): HTMLElement =>
  div("zen-grid zen-grid-cols-2 zen-gap-3 sm:zen-grid-cols-4", [
    Fact("Customer", "Acme Corporation"),
    Fact("Delivery", "14 Aug 2026"),
    Fact("Net value", "€ 48,200.00"),
    Fact("Incoterms", "DAP Hamburg"),
  ]);

const Rows = (count = 24): HTMLElement => {
  const wrap = div("zen-flex zen-flex-col zen-gap-2 zen-p-4");
  for (let i = 0; i < count; i++) {
    wrap.append(
      div(
        "zen-flex zen-items-center zen-justify-between zen-rounded-zen-md zen-border zen-border-zen-border zen-px-3 zen-py-2 zen-text-sm",
        [
          span("", `Line item ${String(i + 1).padStart(2, "0")}`),
          span("zen-text-zen-muted-fg", `€ ${(120 + i * 37).toLocaleString()}.00`),
        ],
      ),
    );
  }
  return wrap;
};

/** A <zen-dynamic-page-title> with its slot properties set. */
const title = (props: {
  heading: string;
  subheading?: string;
  actions?: Node;
  breadcrumbs?: Node;
  expandedContent?: Node;
  snappedContent?: Node;
}): HTMLElement => {
  const t = document.createElement("zen-dynamic-page-title");
  for (const [k, v] of Object.entries(props)) if (v !== undefined) setProp(t, k, v);
  return t;
};

/** A <zen-dynamic-page-header> that slots its facts and carries an accessible name. */
const header = (ariaLabel: string, content: Node): HTMLElement => {
  const h = document.createElement("zen-dynamic-page-header");
  h.setAttribute("aria-label", ariaLabel);
  h.append(content);
  return h;
};

/** A <zen-dynamic-page> host carrying the FRAME styling + slotted children. */
const page = (children: Node[]): HTMLElement => {
  const p = document.createElement("zen-dynamic-page");
  p.className = FRAME;
  p.append(...children);
  return p;
};

/** Breadcrumb trail: Sales / Orders / 4711. */
const breadcrumbs = (): HTMLElement => {
  const item = (child: Node): HTMLElement => {
    const it = document.createElement("zen-breadcrumb-item");
    it.append(child);
    return it;
  };
  const link = (text: string): HTMLElement => {
    const l = document.createElement("zen-breadcrumb-link");
    l.setAttribute("href", "#");
    l.textContent = text;
    return l;
  };
  const sep = () => document.createElement("zen-breadcrumb-separator");
  const pageCrumb = (text: string): HTMLElement => {
    const pc = document.createElement("zen-breadcrumb-page");
    pc.textContent = text;
    return pc;
  };
  const list = document.createElement("zen-breadcrumb-list");
  list.append(item(link("Sales")), sep(), item(link("Orders")), sep(), item(pageCrumb("4711")));
  const bc = document.createElement("zen-breadcrumb");
  bc.append(list);
  return bc;
};

export default function DynamicPageDemo(): HTMLElement {
  return DemoPage({
    title: "DynamicPage",
    description:
      "A page whose header snaps — collapses — as the content scrolls, leaving the title bar sticky behind it, plus an optional floating footer. This is the frame under the List Report and Object Page. Snapping is driven by the page's own scroll container, never by window, so it works inside any container — including this demo shell, where the document itself does not scroll at all.",
    sections: [
      {
        title: "1. Snapping — scroll the content",
        codeTitle: "The header collapses; the title stays",
        codeDescription:
          "Scroll inside the page. The header content snaps away and the title bar remains fixed at the top. Scroll back to the very top and it expands again.",
        code: `<zen-dynamic-page class="zen-h-[420px] …">
  <zen-dynamic-page-title></zen-dynamic-page-title>   <!-- title.heading = "Order 4711" -->
  <zen-dynamic-page-header aria-label="Order details">…</zen-dynamic-page-header>
  <!-- content rows -->
</zen-dynamic-page>`,
        render: () =>
          page([
            title({
              heading: "Order 4711",
              subheading: "Acme Corporation",
              actions: button("Save", { size: "sm", variant: "solid", color: "primary" }),
            }),
            header("Order details", HeaderFacts()),
            Rows(),
          ]),
      },
      {
        title: "2. Pinning holds the header open",
        codeTitle: "headerPinnable (default true)",
        codeDescription:
          "Press the pin in the header's trailing edge, then scroll: the header stays expanded and rides along under the title instead of snapping away. Press it again to release.",
        code: `<zen-dynamic-page>   <!-- headerPinnable defaults true -->
  <zen-dynamic-page-title></zen-dynamic-page-title>
  <zen-dynamic-page-header aria-label="Order details">…</zen-dynamic-page-header>
</zen-dynamic-page>`,
        render: () =>
          page([
            title({ heading: "Order 4711", subheading: "Pin me, then scroll" }),
            header("Order details (pinnable)", HeaderFacts()),
            Rows(),
          ]),
      },
      {
        title: "3. Different title content when snapped",
        codeTitle: "expandedContent / snappedContent",
        codeDescription:
          "The page shows different title content once the header is gone — the facts you would otherwise lose. Scroll to swap the two.",
        code: `title.breadcrumbs = breadcrumbTrail;
title.expandedContent = createdByLine;
title.snappedContent = confirmedBadge;`,
        render: () =>
          page([
            title({
              heading: "Order 4711",
              breadcrumbs: breadcrumbs(),
              expandedContent: (() => {
                const p = document.createElement("p");
                p.className = "zen-m-0 zen-px-1 zen-text-sm zen-text-zen-muted-fg";
                p.textContent = "Created 2 Aug 2026 by R. Pillai";
                return p;
              })(),
              snappedContent: (() => {
                const badge = document.createElement("zen-badge");
                badge.setAttribute("variant", "soft");
                badge.setAttribute("color", "success");
                badge.textContent = "€ 48,200.00 · Confirmed";
                return div("zen-px-1 zen-pt-1", badge);
              })(),
            }),
            header("Order details (snapped content)", HeaderFacts()),
            Rows(),
          ]),
      },
      {
        title: "4. Floating footer",
        codeTitle: "zen-dynamic-page-footer + showFooter",
        codeDescription:
          "The footer floats above the scrolling content and stays put. showFooter toggles it without removing the page.",
        code: `<zen-dynamic-page>   <!-- showFooter defaults true -->
  …
  <zen-dynamic-page-footer>
    <zen-button size="sm" variant="ghost">Cancel</zen-button>
    <zen-button size="sm" variant="solid" color="primary">Submit</zen-button>
  </zen-dynamic-page-footer>
</zen-dynamic-page>`,
        render: () => {
          const footer = document.createElement("zen-dynamic-page-footer");
          footer.append(
            button("Cancel", { size: "sm", variant: "ghost" }),
            button("Submit", { size: "sm", variant: "solid", color: "primary" }),
          );
          return page([
            title({ heading: "Order 4711", subheading: "With a floating footer" }),
            header("Order details (footer)", HeaderFacts()),
            Rows(),
            footer,
          ]);
        },
      },
      {
        title: "5. Controlled",
        codeTitle: "headerExpanded + zen-header-expanded-change",
        codeDescription:
          "Drive the header from outside. Scrolling and clicking the title still report through zen-header-expanded-change — the page never owns the state.",
        code: `const pg = document.createElement("zen-dynamic-page");
pg.headerExpanded = true;
pg.headerPinnable = false;
pg.addEventListener("zen-header-expanded-change", (e) => { pg.headerExpanded = e.detail; });`,
        render: () => {
          const wrap = div("zen-flex zen-w-full zen-flex-col zen-gap-2");
          const bar = div("zen-flex zen-items-center zen-gap-2");
          const readout = span("zen-text-xs zen-text-zen-muted-fg", "headerExpanded = true");

          let expanded = true;
          const toggle = button("Collapse header", { size: "sm", variant: "outline" });

          const pg = page([
            title({ heading: "Order 4711", subheading: "Controlled header" }),
            header("Order details (controlled)", HeaderFacts()),
            Rows(),
          ]);
          setProp(pg, "headerExpanded", true);
          setProp(pg, "headerPinnable", false);

          const sync = () => {
            toggle.textContent = expanded ? "Collapse header" : "Expand header";
            readout.textContent = `headerExpanded = ${String(expanded)}`;
          };

          pg.addEventListener("zen-header-expanded-change", (e) => {
            expanded = (e as CustomEvent<boolean>).detail;
            setProp(pg, "headerExpanded", expanded);
            sync();
          });
          toggle.addEventListener("click", () => {
            expanded = !expanded;
            setProp(pg, "headerExpanded", expanded);
            sync();
          });

          bar.append(toggle, readout);
          wrap.append(bar, pg);
          return wrap;
        },
      },
    ],
  });
}
