import { type JSX, For, Show, createSignal } from "solid-js";
import {
  FlexibleColumnLayout,
  type FlexibleColumnLayoutType,
  type FlexibleColumnLayoutChangeDetail,
} from "./flexible-column-layout/flexible-column-layout";
import { Button } from "./button/button";
import { DemoPage, DemoSection } from "./demo-helpers";

/**
 * FlexibleColumnLayout demo — mirrors the React binding's sections. Every
 * section pins the layout to a fixed-height box, because that is the
 * component's contract: it fills its parent and never grows it — the columns
 * are what scroll.
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

/** Column chrome: a sticky header over a scrolling body. */
const Panel = (props: {
  title: string;
  subtitle?: string;
  action?: JSX.Element;
  children: JSX.Element;
}) => (
  <>
    <header class="zen-sticky zen-top-0 zen-z-10 zen-flex zen-shrink-0 zen-items-center zen-justify-between zen-gap-2 zen-border-b zen-border-zen-border zen-bg-zen-background zen-px-3 zen-py-2">
      <div class="zen-min-w-0">
        <div class="zen-truncate zen-text-sm zen-font-semibold">{props.title}</div>
        <Show when={props.subtitle}>
          <div class="zen-truncate zen-text-xs zen-text-zen-muted-fg">{props.subtitle}</div>
        </Show>
      </div>
      {props.action}
    </header>
    <div class="zen-flex-1 zen-p-3">{props.children}</div>
  </>
);

const OrderList = (props: { onSelect?: (id: string) => void }) => (
  <Panel title="Orders" subtitle={`${ORDERS.length} items`}>
    <ul class="zen-m-0 zen-flex zen-list-none zen-flex-col zen-gap-1 zen-p-0">
      <For each={ORDERS}>
        {(o) => (
          <li>
            <button
              type="button"
              onClick={() => props.onSelect?.(o.id)}
              class="zen-w-full zen-rounded-zen-sm zen-border zen-border-transparent zen-bg-transparent zen-px-2 zen-py-1.5 zen-text-left hover:zen-bg-zen-muted"
            >
              <div class="zen-truncate zen-text-sm zen-font-medium">{o.customer}</div>
              <div class="zen-text-xs zen-text-zen-muted-fg">
                {o.id} · {o.status}
              </div>
            </button>
          </li>
        )}
      </For>
    </ul>
  </Panel>
);

const OrderDetail = (props: { onSelect?: (id: string) => void; action?: JSX.Element }) => (
  <Panel title="SO-4713 — Fabrikam Inc" subtitle="Open · 27,004.20" action={props.action}>
    <ul class="zen-m-0 zen-flex zen-list-none zen-flex-col zen-gap-1 zen-p-0">
      <For each={LINE_ITEMS}>
        {(i) => (
          <li>
            <button
              type="button"
              onClick={() => props.onSelect?.(i.id)}
              class="zen-w-full zen-rounded-zen-sm zen-border zen-border-transparent zen-bg-transparent zen-px-2 zen-py-1.5 zen-text-left hover:zen-bg-zen-muted"
            >
              <div class="zen-truncate zen-text-sm zen-font-medium">{i.material}</div>
              <div class="zen-text-xs zen-text-zen-muted-fg">
                Item {i.id} · {i.qty} pc · {i.net}
              </div>
            </button>
          </li>
        )}
      </For>
    </ul>
  </Panel>
);

const LineItemDetail = (props: { action?: JSX.Element }) => (
  <Panel title="Item 30" subtitle="Control valve CV-9" action={props.action}>
    <dl class="zen-m-0 zen-grid zen-grid-cols-2 zen-gap-x-2 zen-gap-y-1 zen-text-xs">
      <dt class="zen-text-zen-muted-fg">Quantity</dt>
      <dd class="zen-m-0">2 pc</dd>
      <dt class="zen-text-zen-muted-fg">Net value</dt>
      <dd class="zen-m-0">5,400.00</dd>
      <dt class="zen-text-zen-muted-fg">Plant</dt>
      <dd class="zen-m-0">1010 Hamburg</dd>
      <dt class="zen-text-zen-muted-fg">Delivery</dt>
      <dd class="zen-m-0">2026-08-03</dd>
    </dl>
  </Panel>
);

/** Long filler so the column has something to scroll. */
const Filler = (props: { title: string; rows: number }) => (
  <Panel title={props.title} subtitle={`${props.rows} rows`}>
    <ul class="zen-m-0 zen-flex zen-list-none zen-flex-col zen-gap-1 zen-p-0">
      <For each={Array.from({ length: props.rows }, (_, i) => i)}>
        {(i) => (
          <li class="zen-rounded-zen-sm zen-bg-zen-muted zen-px-2 zen-py-1.5 zen-text-xs">
            {props.title} row {i + 1}
          </li>
        )}
      </For>
    </ul>
  </Panel>
);

const Frame = (props: { children: JSX.Element; height: number; width?: number }) => (
  <div
    class="zen-overflow-hidden zen-rounded-zen-md zen-border zen-border-zen-border"
    style={{ height: `${props.height}px`, width: props.width ? `${props.width}px` : "100%" }}
  >
    {props.children}
  </div>
);

const NewFlexibleColumnLayoutDemo = () => {
  const [layout, setLayout] = createSignal<FlexibleColumnLayoutType>("ThreeColumnsMidExpanded");
  const [detail, setDetail] = createSignal<FlexibleColumnLayoutChangeDetail | null>(null);
  const [navLayout, setNavLayout] = createSignal<FlexibleColumnLayoutType>("OneColumn");

  return (
    <DemoPage
      title="FlexibleColumnLayout"
      description="The master-detail frame: one to three columns for list → detail → detail, each independently scrollable, collapsing as room runs out. The layout names are SAP's verbatim — the layout state machine is what apps drive, so ThreeColumnsMidExpanded means here exactly what it means there. Collapse is measured on the container, not the window, so the component behaves the same inside a split pane or a builder canvas."
    >
      <DemoSection
        title="1. The layout state machine"
        codeTitle="Seven named layouts"
        codeDescription={
          <>
            The component is controlled: it never changes <code>layout</code>{" "}
            itself. onLayoutChange reports what was actually rendered — including
            the responsive tier.
          </>
        }
        code={`const [layout, setLayout] = createSignal<FlexibleColumnLayoutType>("ThreeColumnsMidExpanded");

<FlexibleColumnLayout
  layout={layout()}
  onLayoutChange={(d) => console.log(d.layout, d.maxColumnsCount, d.visibleColumns)}
  startColumn={<OrderList />}
  midColumn={<OrderDetail />}
  endColumn={<LineItemDetail />}
/>`}
      >
        <div class="zen-flex zen-w-full zen-flex-col zen-gap-2">
          <div class="zen-flex zen-flex-wrap zen-gap-1">
            <For each={LAYOUTS}>
              {(l) => (
                <Button
                  type="button"
                  size="sm"
                  variant={l === layout() ? "solid" : "outline"}
                  color={l === layout() ? "primary" : "neutral"}
                  onClick={() => setLayout(l)}
                >
                  {l}
                </Button>
              )}
            </For>
          </div>
          <Frame height={360}>
            <FlexibleColumnLayout
              layout={layout()}
              onLayoutChange={setDetail}
              startColumn={<OrderList />}
              midColumn={<OrderDetail />}
              endColumn={<LineItemDetail />}
            />
          </Frame>
          <p class="zen-m-0 zen-text-xs zen-text-zen-muted-fg">
            onLayoutChange → layout: <code>{detail()?.layout ?? "—"}</code> ·
            maxColumnsCount: <code>{detail()?.maxColumnsCount ?? "—"}</code> ·
            visibleColumns: <code>{detail()?.visibleColumns.join(", ") || "—"}</code>
          </p>
        </div>
      </DemoSection>

      <DemoSection
        title="2. Master-detail navigation"
        codeTitle="A router drives the layout"
        codeDescription="Pick an order to open the detail, pick a line item to open the third column. Back walks the state machine down again."
        code={`<FlexibleColumnLayout
  layout={navLayout()}
  startColumn={<OrderList onSelect={() => setNavLayout("TwoColumnsMidExpanded")} />}
  midColumn={<OrderDetail onSelect={() => setNavLayout("ThreeColumnsEndExpanded")} />}
  endColumn={<LineItemDetail />}
/>`}
      >
        <Frame height={360}>
          <FlexibleColumnLayout
            layout={navLayout()}
            startColumn={<OrderList onSelect={() => setNavLayout("TwoColumnsMidExpanded")} />}
            midColumn={
              <OrderDetail
                onSelect={() => setNavLayout("ThreeColumnsEndExpanded")}
                action={
                  <Button type="button" size="sm" variant="ghost" onClick={() => setNavLayout("OneColumn")}>
                    Back
                  </Button>
                }
              />
            }
            endColumn={
              <LineItemDetail
                action={
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setNavLayout("TwoColumnsMidExpanded")}
                  >
                    Close
                  </Button>
                }
              />
            }
          />
        </Frame>
      </DemoSection>

      <DemoSection
        title="3. Responsive collapse — measured on the container"
        codeTitle="Same layout, three container widths"
        codeDescription="A column needs ~300px, so the container takes as many as it can afford: under 900px the start column drops, under 600px only the most-recently-navigated column survives. No media query is involved — a ResizeObserver watches the layout's own box."
        code={`// identical props, different parents
<div style={{ width: "420px" }}>
  <FlexibleColumnLayout layout="ThreeColumnsMidExpanded" … />
</div>`}
      >
        <div class="zen-flex zen-w-full zen-flex-col zen-gap-3">
          <div>
            <p class="zen-mb-1 zen-mt-0 zen-text-xs zen-text-zen-muted-fg">
              720px — two columns, start dropped
            </p>
            <Frame height={260} width={720}>
              <FlexibleColumnLayout
                layout="ThreeColumnsMidExpanded"
                startColumn={<OrderList />}
                midColumn={<OrderDetail />}
                endColumn={<LineItemDetail />}
              />
            </Frame>
          </div>
          <div>
            <p class="zen-mb-1 zen-mt-0 zen-text-xs zen-text-zen-muted-fg">
              420px — one column, the end column wins
            </p>
            <Frame height={260} width={420}>
              <FlexibleColumnLayout
                layout="ThreeColumnsMidExpanded"
                startColumn={<OrderList />}
                midColumn={<OrderDetail />}
                endColumn={<LineItemDetail />}
              />
            </Frame>
          </div>
        </div>
      </DemoSection>

      <DemoSection
        title="4. The columns scroll — the page does not"
        codeTitle="Pinned height, three independent scrollers"
        codeDescription="The root is h-full + overflow-hidden, never min-h-*: min-height is a floor, not a ceiling, and a root that can grow means the inner scrollers never scroll and the page sprouts a second scrollbar."
        code={`<div style={{ height: "300px" }}>
  <FlexibleColumnLayout layout="ThreeColumnsMidExpanded" … />
</div>`}
      >
        <Frame height={300}>
          <FlexibleColumnLayout
            layout="ThreeColumnsMidExpanded"
            startColumn={<Filler title="Start" rows={40} />}
            midColumn={<Filler title="Mid" rows={40} />}
            endColumn={<Filler title="End" rows={40} />}
          />
        </Frame>
      </DemoSection>
    </DemoPage>
  );
};

export default NewFlexibleColumnLayoutDemo;
