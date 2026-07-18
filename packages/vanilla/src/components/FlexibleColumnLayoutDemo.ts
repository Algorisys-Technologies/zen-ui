import {
  FlexibleColumnLayout,
  type FlexibleColumnLayoutType,
  type FlexibleColumnLayoutChangeDetail,
} from "./flexible-column-layout/flexible-column-layout";
import { Button } from "./button/button";
import { DemoPage } from "./demo-helpers";
import type { Child } from "../lib/component";

/**
 * FlexibleColumnLayout demo. Every section pins the layout to a fixed-height box,
 * because that is the component's contract: it fills its parent and never grows it —
 * the columns are what scroll. Mirrors the React demo's four sections.
 */

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
  const btn = h("button", "zen-w-full zen-rounded-zen-sm zen-border zen-border-transparent zen-bg-transparent zen-px-2 zen-py-1.5 zen-text-left hover:zen-bg-zen-muted");
  (btn as HTMLButtonElement).type = "button";
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
    ul.append(h("li", undefined, listButton(o.customer, `${o.id} · ${o.status}`, () => onSelect?.(o.id))));
  }
  return Panel({ title: "Orders", subtitle: `${ORDERS.length} items`, body: ul });
}

function OrderDetail(opts: { onSelect?: (id: string) => void; action?: Node } = {}): Node[] {
  const ul = h("ul", "zen-m-0 zen-flex zen-list-none zen-flex-col zen-gap-1 zen-p-0");
  for (const i of LINE_ITEMS) {
    ul.append(
      h("li", undefined, listButton(i.material, `Item ${i.id} · ${i.qty} pc · ${i.net}`, () => opts.onSelect?.(i.id))),
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
    ul.append(h("li", "zen-rounded-zen-sm zen-bg-zen-muted zen-px-2 zen-py-1.5 zen-text-xs", `${title} row ${i + 1}`));
  }
  return Panel({ title, subtitle: `${rows} rows`, body: ul });
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
          "The component is controlled: it never changes `layout` itself. onLayoutChange reports what was actually rendered — including the responsive tier.",
        code: `let layout: FlexibleColumnLayoutType = "ThreeColumnsMidExpanded";

const fcl = FlexibleColumnLayout({
  layout,
  onLayoutChange: (d) => console.log(d.layout, d.maxColumnsCount, d.visibleColumns),
  startColumn: OrderList(),
  midColumn: OrderDetail(),
  endColumn: LineItemDetail(),
});
// switch layouts imperatively:
fcl.update({ layout: "TwoColumnsMidExpanded" });`,
        render: () => {
          let layout: FlexibleColumnLayoutType = "ThreeColumnsMidExpanded";

          const wrap = h("div", "zen-flex zen-w-full zen-flex-col zen-gap-2");
          const buttonRow = h("div", "zen-flex zen-flex-wrap zen-gap-1");
          const readout = h("p", "zen-m-0 zen-text-xs zen-text-zen-muted-fg");

          const paintReadout = (d: FlexibleColumnLayoutChangeDetail | null) => {
            readout.replaceChildren(
              document.createTextNode("onLayoutChange → layout: "),
              h("code", undefined, d?.layout ?? "—"),
              document.createTextNode(" · maxColumnsCount: "),
              h("code", undefined, d ? String(d.maxColumnsCount) : "—"),
              document.createTextNode(" · visibleColumns: "),
              h("code", undefined, d?.visibleColumns.join(", ") || "—"),
            );
          };
          paintReadout(null);

          const fcl = FlexibleColumnLayout({
            layout,
            onLayoutChange: paintReadout,
            startColumn: OrderList(),
            midColumn: OrderDetail(),
            endColumn: LineItemDetail(),
          });

          const buttons = LAYOUTS.map((l) => {
            const b = Button({
              type: "button",
              size: "sm",
              variant: l === layout ? "solid" : "outline",
              color: l === layout ? "primary" : "neutral",
              children: l,
              onClick: () => {
                layout = l;
                fcl.update({ layout: l });
                for (const [bl, bh] of buttons) {
                  bh.update({
                    variant: bl === l ? "solid" : "outline",
                    color: bl === l ? "primary" : "neutral",
                  });
                }
              },
            });
            return [l, b] as const;
          });
          buttonRow.append(...buttons.map(([, b]) => b.el));

          wrap.append(buttonRow, Frame(fcl.el, 360), readout);
          return wrap;
        },
      },
      {
        title: "2. Master-detail navigation",
        codeTitle: "A router drives the layout",
        codeDescription:
          "Pick an order to open the detail, pick a line item to open the third column. Back walks the state machine down again.",
        code: `let navLayout: FlexibleColumnLayoutType = "OneColumn";

const fcl = FlexibleColumnLayout({
  layout: navLayout,
  startColumn: OrderList((/* id */) => fcl.update({ layout: "TwoColumnsMidExpanded" })),
  midColumn: OrderDetail({ onSelect: () => fcl.update({ layout: "ThreeColumnsEndExpanded" }) }),
  endColumn: LineItemDetail(),
});`,
        render: () => {
          const set = (l: FlexibleColumnLayoutType) => fcl.update({ layout: l });

          const back = Button({ type: "button", size: "sm", variant: "ghost", children: "Back", onClick: () => set("OneColumn") });
          const close = Button({ type: "button", size: "sm", variant: "ghost", children: "Close", onClick: () => set("TwoColumnsMidExpanded") });

          const fcl = FlexibleColumnLayout({
            layout: "OneColumn",
            startColumn: OrderList(() => set("TwoColumnsMidExpanded")),
            midColumn: OrderDetail({ onSelect: () => set("ThreeColumnsEndExpanded"), action: back.el }),
            endColumn: LineItemDetail(close.el),
          });

          return Frame(fcl.el, 360);
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
frame.append(
  FlexibleColumnLayout({ layout: "ThreeColumnsMidExpanded", startColumn, midColumn, endColumn }).el,
);`,
        render: () => {
          const col = h("div", "zen-flex zen-w-full zen-flex-col zen-gap-3");

          const wide = h("div");
          wide.append(
            h("p", "zen-mb-1 zen-mt-0 zen-text-xs zen-text-zen-muted-fg", "720px — two columns, start dropped"),
            Frame(
              FlexibleColumnLayout({
                layout: "ThreeColumnsMidExpanded",
                startColumn: OrderList(),
                midColumn: OrderDetail(),
                endColumn: LineItemDetail(),
              }).el,
              260,
              720,
            ),
          );

          const narrow = h("div");
          narrow.append(
            h("p", "zen-mb-1 zen-mt-0 zen-text-xs zen-text-zen-muted-fg", "420px — one column, the end column wins"),
            Frame(
              FlexibleColumnLayout({
                layout: "ThreeColumnsMidExpanded",
                startColumn: OrderList(),
                midColumn: OrderDetail(),
                endColumn: LineItemDetail(),
              }).el,
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
frame.append(
  FlexibleColumnLayout({ layout: "ThreeColumnsMidExpanded", startColumn, midColumn, endColumn }).el,
);`,
        render: () =>
          Frame(
            FlexibleColumnLayout({
              layout: "ThreeColumnsMidExpanded",
              startColumn: Filler("Start", 40),
              midColumn: Filler("Mid", 40),
              endColumn: Filler("End", 40),
            }).el,
            300,
          ),
      },
    ],
  });
}
