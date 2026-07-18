import type {
  FlexibleColumnLayoutType,
  FlexibleColumnLayoutChangeDetail,
} from "@algorisys/zen-ui-vanilla";
import { DemoPage } from "./demo-helpers";

/**
 * FlexibleColumnLayout demo — the web-components port. <zen-flexible-column-layout>
 * is controlled: `layout` is an enum attribute the app drives, the three columns
 * are `startColumn` / `midColumn` / `endColumn` JS properties (Child nodes), and
 * `zen-layout-change` reports the rendered result. Every section pins the layout
 * to a fixed-height box — its contract is to fill its parent and never grow it.
 */

type Child = string | number | Node | false | null | undefined;

const LAYOUTS: FlexibleColumnLayoutType[] = [
  "OneColumn",
  "TwoColumnsBeginExpanded",
  "TwoColumnsMidExpanded",
  "ThreeColumnsMidExpanded",
  "ThreeColumnsEndExpanded",
  "MidColumnFullScreen",
  "EndColumnFullScreen",
];

const ORDERS = [
  { id: "SO-4711", customer: "Northwind Traders", total: "12,480.00", status: "Open" },
  { id: "SO-4712", customer: "Contoso Ltd", total: "3,910.50", status: "Shipped" },
  { id: "SO-4713", customer: "Fabrikam Inc", total: "27,004.20", status: "Open" },
  { id: "SO-4714", customer: "Adventure Works", total: "880.00", status: "Blocked" },
  { id: "SO-4715", customer: "Tailspin Toys", total: "6,150.75", status: "Shipped" },
  { id: "SO-4716", customer: "Wide World Importers", total: "19,220.00", status: "Open" },
  { id: "SO-4717", customer: "Proseware GmbH", total: "45,600.00", status: "Open" },
  { id: "SO-4718", customer: "Litware Inc", total: "2,300.10", status: "Shipped" },
];

const LINE_ITEMS = [
  { id: "10", material: "Hydraulic pump HP-200", qty: 4, net: "3,200.00" },
  { id: "20", material: "Seal kit SK-14", qty: 12, net: "480.00" },
  { id: "30", material: "Control valve CV-9", qty: 2, net: "5,400.00" },
  { id: "40", material: "Pressure sensor PS-3", qty: 6, net: "1,860.00" },
  { id: "50", material: "Coupling C-77", qty: 20, net: "1,540.00" },
];

const h = <K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  ...children: Child[]
): HTMLElementTagNameMap[K] => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  for (const c of children) {
    if (c == null || c === false) continue;
    node.append(typeof c === "string" || typeof c === "number" ? String(c) : (c as Node));
  }
  return node;
};

/** A zen-button configured for the demo chrome. */
function button(opts: {
  label: string;
  size?: string;
  variant?: string;
  color?: string;
  onClick: () => void;
}): HTMLElement {
  const b = document.createElement("zen-button");
  b.setAttribute("type", "button");
  if (opts.size) b.setAttribute("size", opts.size);
  if (opts.variant) b.setAttribute("variant", opts.variant);
  if (opts.color) b.setAttribute("color", opts.color);
  b.textContent = opts.label;
  b.addEventListener("click", opts.onClick);
  return b;
}

/** Column chrome: a sticky header over a scrolling body. Returns [header, body]. */
function Panel(opts: { title: string; subtitle?: string; action?: Node; body: Node }): Node[] {
  const meta = h("div", "zen-min-w-0");
  meta.append(h("div", "zen-truncate zen-text-sm zen-font-semibold", opts.title));
  if (opts.subtitle) {
    meta.append(h("div", "zen-truncate zen-text-xs zen-text-zen-muted-fg", opts.subtitle));
  }
  const header = h(
    "header",
    "zen-sticky zen-top-0 zen-z-10 zen-flex zen-shrink-0 zen-items-center zen-justify-between zen-gap-2 zen-border-b zen-border-zen-border zen-bg-zen-background zen-px-3 zen-py-2",
    meta,
    opts.action ?? false,
  );
  const body = h("div", "zen-flex-1 zen-p-3", opts.body);
  return [header, body];
}

function listButton(title: string, sub: string, onSelect?: () => void): HTMLElement {
  const btn = h(
    "button",
    "zen-w-full zen-rounded-zen-sm zen-border zen-border-transparent zen-bg-transparent zen-px-2 zen-py-1.5 zen-text-left hover:zen-bg-zen-muted",
  );
  btn.type = "button";
  btn.append(
    h("div", "zen-truncate zen-text-sm zen-font-medium", title),
    h("div", "zen-text-xs zen-text-zen-muted-fg", sub),
  );
  if (onSelect) btn.addEventListener("click", onSelect);
  return btn;
}

function OrderList(onSelect?: (id: string) => void): Node[] {
  const ul = h("ul", "zen-m-0 zen-flex zen-list-none zen-flex-col zen-gap-1 zen-p-0");
  for (const o of ORDERS) {
    ul.append(
      h("li", undefined, listButton(o.customer, `${o.id} · ${o.status}`, () => onSelect?.(o.id))),
    );
  }
  return Panel({ title: "Orders", subtitle: `${ORDERS.length} items`, body: ul });
}

function OrderDetail(opts: { onSelect?: (id: string) => void; action?: Node } = {}): Node[] {
  const ul = h("ul", "zen-m-0 zen-flex zen-list-none zen-flex-col zen-gap-1 zen-p-0");
  for (const i of LINE_ITEMS) {
    ul.append(
      h(
        "li",
        undefined,
        listButton(i.material, `Item ${i.id} · ${i.qty} pc · ${i.net}`, () => opts.onSelect?.(i.id)),
      ),
    );
  }
  return Panel({ title: "SO-4713 — Fabrikam Inc", subtitle: "Open · 27,004.20", action: opts.action, body: ul });
}

function LineItemDetail(action?: Node): Node[] {
  const dl = h("dl", "zen-m-0 zen-grid zen-grid-cols-2 zen-gap-x-2 zen-gap-y-1 zen-text-xs");
  const pair = (k: string, v: string) => {
    dl.append(h("dt", "zen-text-zen-muted-fg", k), h("dd", "zen-m-0", v));
  };
  pair("Quantity", "2 pc");
  pair("Net value", "5,400.00");
  pair("Plant", "1010 Hamburg");
  pair("Delivery", "2026-08-03");
  return Panel({ title: "Item 30", subtitle: "Control valve CV-9", action, body: dl });
}

/** Long filler so the column has something to scroll. */
function Filler(title: string, rows: number): Node[] {
  const ul = h("ul", "zen-m-0 zen-flex zen-list-none zen-flex-col zen-gap-1 zen-p-0");
  for (let i = 0; i < rows; i++) {
    ul.append(
      h("li", "zen-rounded-zen-sm zen-bg-zen-muted zen-px-2 zen-py-1.5 zen-text-xs", `${title} row ${i + 1}`),
    );
  }
  return Panel({ title, subtitle: `${rows} rows`, body: ul });
}

function fcl(cols: { layout: FlexibleColumnLayoutType; start: Node[]; mid: Node[]; end: Node[] }): HTMLElement {
  const el = document.createElement("zen-flexible-column-layout");
  el.setAttribute("layout", cols.layout);
  const p = el as unknown as Record<string, unknown>;
  p.startColumn = cols.start;
  p.midColumn = cols.mid;
  p.endColumn = cols.end;
  return el;
}

function Frame(child: Node, height: number, width?: number): HTMLElement {
  const frame = h("div", "zen-overflow-hidden zen-rounded-zen-md zen-border zen-border-zen-border");
  frame.style.height = `${height}px`;
  frame.style.width = width != null ? `${width}px` : "100%";
  frame.append(child);
  return frame;
}

export default function FlexibleColumnLayoutDemo(): HTMLElement {
  return DemoPage({
    title: "FlexibleColumnLayout",
    description:
      "The master-detail frame: one to three columns for list → detail → detail, each independently scrollable, collapsing as room runs out. The layout names are SAP's verbatim — the layout state machine is what apps drive, so ThreeColumnsMidExpanded means here exactly what it means there. Collapse is measured on the container, not the window, so the component behaves the same inside a split pane or a builder canvas.",
    sections: [
      {
        title: "1. The layout state machine",
        codeTitle: "Seven named layouts",
        codeDescription:
          "The component is controlled: it never changes `layout` itself. zen-layout-change reports what was actually rendered — including the responsive tier.",
        code: `<zen-flexible-column-layout layout="ThreeColumnsMidExpanded"></zen-flexible-column-layout>

const fcl = document.querySelector("zen-flexible-column-layout");
fcl.startColumn = orderList;
fcl.midColumn = orderDetail;
fcl.endColumn = lineItemDetail;
fcl.addEventListener("zen-layout-change", (e) =>
  console.log(e.detail.layout, e.detail.maxColumnsCount, e.detail.visibleColumns));
// switch layouts imperatively:
fcl.setAttribute("layout", "TwoColumnsMidExpanded");`,
        render: () => {
          let layout: FlexibleColumnLayoutType = "ThreeColumnsMidExpanded";

          const wrap = h("div", "zen-flex zen-w-full zen-flex-col zen-gap-2");
          const buttonRow = h("div", "zen-flex zen-flex-wrap zen-gap-1");
          const readout = h("p", "zen-m-0 zen-text-xs zen-text-zen-muted-fg");

          const paintReadout = (d: FlexibleColumnLayoutChangeDetail | null) => {
            readout.replaceChildren(
              document.createTextNode("zen-layout-change → layout: "),
              h("code", undefined, d?.layout ?? "—"),
              document.createTextNode(" · maxColumnsCount: "),
              h("code", undefined, d ? String(d.maxColumnsCount) : "—"),
              document.createTextNode(" · visibleColumns: "),
              h("code", undefined, d?.visibleColumns.join(", ") || "—"),
            );
          };
          paintReadout(null);

          const el = fcl({
            layout,
            start: OrderList(),
            mid: OrderDetail(),
            end: LineItemDetail(),
          });
          el.addEventListener("zen-layout-change", (e) =>
            paintReadout((e as CustomEvent).detail as FlexibleColumnLayoutChangeDetail),
          );

          const buttons = LAYOUTS.map((l) => {
            const b = button({
              label: l,
              size: "sm",
              variant: l === layout ? "solid" : "outline",
              color: l === layout ? "primary" : "neutral",
              onClick: () => {
                layout = l;
                el.setAttribute("layout", l);
                for (const [bl, bh] of buttons) {
                  bh.setAttribute("variant", bl === l ? "solid" : "outline");
                  bh.setAttribute("color", bl === l ? "primary" : "neutral");
                }
              },
            });
            return [l, b] as const;
          });
          buttonRow.append(...buttons.map(([, b]) => b));

          wrap.append(buttonRow, Frame(el, 360), readout);
          return wrap;
        },
      },
      {
        title: "2. Master-detail navigation",
        codeTitle: "A router drives the layout",
        codeDescription:
          "Pick an order to open the detail, pick a line item to open the third column. Back walks the state machine down again.",
        code: `const fcl = document.querySelector("zen-flexible-column-layout");
fcl.startColumn = orderList(() => fcl.setAttribute("layout", "TwoColumnsMidExpanded"));
fcl.midColumn = orderDetail(() => fcl.setAttribute("layout", "ThreeColumnsEndExpanded"));
fcl.endColumn = lineItemDetail;`,
        render: () => {
          const set = (l: FlexibleColumnLayoutType) => el.setAttribute("layout", l);

          const back = button({ label: "Back", size: "sm", variant: "ghost", onClick: () => set("OneColumn") });
          const close = button({ label: "Close", size: "sm", variant: "ghost", onClick: () => set("TwoColumnsMidExpanded") });

          const el = fcl({
            layout: "OneColumn",
            start: OrderList(() => set("TwoColumnsMidExpanded")),
            mid: OrderDetail({ onSelect: () => set("ThreeColumnsEndExpanded"), action: back }),
            end: LineItemDetail(close),
          });

          return Frame(el, 360);
        },
      },
      {
        title: "3. Responsive collapse — measured on the container",
        codeTitle: "Same layout, three container widths",
        codeDescription:
          "A column needs ~300px, so the container takes as many as it can afford: under 900px the start column drops, under 600px only the most-recently-navigated column survives. No media query is involved — a ResizeObserver watches the layout's own box.",
        code: `// identical props, different parents
const frame = document.createElement("div");
frame.style.width = "420px";
frame.append(fcl);   // <zen-flexible-column-layout layout="ThreeColumnsMidExpanded">`,
        render: () => {
          const col = h("div", "zen-flex zen-w-full zen-flex-col zen-gap-3");

          const wide = h("div");
          wide.append(
            h("p", "zen-mb-1 zen-mt-0 zen-text-xs zen-text-zen-muted-fg", "720px — two columns, start dropped"),
            Frame(
              fcl({ layout: "ThreeColumnsMidExpanded", start: OrderList(), mid: OrderDetail(), end: LineItemDetail() }),
              260,
              720,
            ),
          );

          const narrow = h("div");
          narrow.append(
            h("p", "zen-mb-1 zen-mt-0 zen-text-xs zen-text-zen-muted-fg", "420px — one column, the end column wins"),
            Frame(
              fcl({ layout: "ThreeColumnsMidExpanded", start: OrderList(), mid: OrderDetail(), end: LineItemDetail() }),
              260,
              420,
            ),
          );

          col.append(wide, narrow);
          return col;
        },
      },
      {
        title: "4. The columns scroll — the page does not",
        codeTitle: "Pinned height, three independent scrollers",
        codeDescription:
          "The root is h-full + overflow-hidden, never min-h-*: min-height is a floor, not a ceiling, and a root that can grow means the inner scrollers never scroll and the page sprouts a second scrollbar.",
        code: `const frame = document.createElement("div");
frame.style.height = "300px";
frame.append(fcl);   // <zen-flexible-column-layout layout="ThreeColumnsMidExpanded">`,
        render: () =>
          Frame(
            fcl({
              layout: "ThreeColumnsMidExpanded",
              start: Filler("Start", 40),
              mid: Filler("Mid", 40),
              end: Filler("End", 40),
            }),
            300,
          ),
      },
    ],
  });
}
