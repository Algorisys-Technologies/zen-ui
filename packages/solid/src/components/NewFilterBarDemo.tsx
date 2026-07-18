import { createSignal } from "solid-js";
import { FilterBar } from "./filter-bar/filter-bar";
import { Input } from "./form/input/input";
import { Badge } from "./badge/badge";
import { DemoPage, DemoSection } from "./demo-helpers";

/**
 * FilterBar demo. The bar collects and reveals; it does not filter — so the
 * sections show what the caller gets on Go, not a fake filtered table.
 */

const NewFilterBarDemo = () => {
  const [supplier, setSupplier] = createSignal("");
  const [order, setOrder] = createSignal("");
  const [city, setCity] = createSignal("");
  const [ran, setRan] = createSignal("—");

  const [visibleIds, setVisibleIds] = createSignal<string[]>(["supplier", "order"]);

  const fields = [
    {
      id: "supplier",
      label: "Supplier",
      render: () => (
        <Input value={supplier()} onInput={(e) => setSupplier(e.currentTarget.value)} placeholder="Any" />
      ),
    },
    {
      id: "order",
      label: "Order number",
      render: () => (
        <Input value={order()} onInput={(e) => setOrder(e.currentTarget.value)} placeholder="Any" />
      ),
    },
    {
      id: "city",
      label: "City",
      render: () => (
        <Input value={city()} onInput={(e) => setCity(e.currentTarget.value)} placeholder="Any" />
      ),
      hiddenByDefault: true,
    },
  ];

  return (
    <DemoPage
      title="FilterBar"
      description={
        <>
          The structured filter area above a table — the gap analysis calls the List
          Report unbuildable without it. Fields are <em>data</em> with a{" "}
          <code>render</code> function, not children, so both bindings can build the Adapt
          filters list from the same source. <strong>Adapt filters</strong> is a{" "}
          <code>SelectDialog</code> over the field labels, because picking which filters are
          visible is exactly a searchable multi-select. The bar never filters anything
          itself: <code>onGo</code> is your cue to run the query.
        </>
      }
    >
      <DemoSection
        title="1. Fields, Go, and Adapt filters"
        codeTitle="FilterBar with a hidden-by-default field"
        codeDescription="City is hiddenByDefault, so it starts off the bar — open Adapt filters and tick it to bring it in. Fields always render in the order you declared them, not the order they were ticked. Collapse the bar with the chevron."
        code={`const fields = [
  { id: "supplier", label: "Supplier", render: () => <Input … /> },
  { id: "order", label: "Order number", render: () => <Input … /> },
  { id: "city", label: "City", render: () => <Input … />, hiddenByDefault: true },
];

<FilterBar
  fields={fields}
  variant={<Badge>Default view</Badge>}
  onGo={() => runQuery({ supplier: supplier(), order: order(), city: city() })}
  onClear={() => { setSupplier(""); setOrder(""); setCity(""); }}
/>`}
      >
        <div class="zen-flex zen-w-full zen-flex-col zen-gap-2">
          <FilterBar
            fields={fields}
            variant={<Badge>Default view</Badge>}
            onGo={() => setRan(`supplier="${supplier()}" order="${order()}" city="${city()}"`)}
            onClear={() => {
              setSupplier("");
              setOrder("");
              setCity("");
              setRan("—");
            }}
          />
          <p class="zen-m-0 zen-text-xs zen-text-zen-muted-fg">
            onGo → <code>{ran()}</code>
          </p>
        </div>
      </DemoSection>

      <DemoSection
        title="2. Controlled visibility"
        codeTitle="visibleIds + onVisibleIdsChange"
        codeDescription="Take over which fields are shown so the choice can be persisted — this is the seam a variant / saved-view feature would plug into later."
        code={`const [visibleIds, setVisibleIds] = createSignal(["supplier", "order"]);

<FilterBar
  fields={fields}
  visibleIds={visibleIds()}
  onVisibleIdsChange={setVisibleIds}
  collapsible={false}
/>`}
      >
        <div class="zen-flex zen-w-full zen-flex-col zen-gap-2">
          <FilterBar
            fields={fields}
            visibleIds={visibleIds()}
            onVisibleIdsChange={setVisibleIds}
            collapsible={false}
          />
          <p class="zen-m-0 zen-text-xs zen-text-zen-muted-fg">
            visibleIds → <code>{visibleIds().join(", ") || "none"}</code>
          </p>
        </div>
      </DemoSection>
    </DemoPage>
  );
};

export default NewFilterBarDemo;
