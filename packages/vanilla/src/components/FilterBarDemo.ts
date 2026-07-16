import { FilterBar } from "./filter-bar/filter-bar";
import { Input } from "./form/input/input";
import { Badge } from "./badge/badge";
import { DemoPage } from "./demo-helpers";

/**
 * FilterBar demo — mirrors the React NewFilterBarDemo. The bar collects and
 * reveals; it does not filter, so the sections show what the caller gets on Go,
 * not a fake filtered table.
 */
export default function FilterBarDemo(): HTMLElement {
  return DemoPage({
    title: "FilterBar",
    description:
      "The structured filter area above a table — the gap analysis calls the List Report unbuildable without it. Fields are DATA with a render function, not children, so every binding can build the Adapt filters list from the same source. Adapt filters is a searchable multi-select over the field labels. The bar never filters anything itself: onGo is your cue to run the query.",
    sections: [
      {
        title: "1. Fields, Go, and Adapt filters",
        codeTitle: "FilterBar with a hidden-by-default field",
        codeDescription:
          "City is hiddenByDefault, so it starts off the bar — open Adapt filters and tick it to bring it in. Fields always render in the order you declared them, not the order they were ticked. Collapse the bar with the chevron.",
        code: `const supplier = Input({ placeholder: "Any" });
const order = Input({ placeholder: "Any" });
const city = Input({ placeholder: "Any" });

const fields = [
  { id: "supplier", label: "Supplier", render: () => supplier },
  { id: "order", label: "Order number", render: () => order },
  { id: "city", label: "City", render: () => city, hiddenByDefault: true },
];

FilterBar({
  fields,
  variant: Badge({ children: "Default view" }),
  onGo: () => runQuery({
    supplier: supplier.el.value,
    order: order.el.value,
    city: city.el.value,
  }),
  onClear: () => { supplier.update({ value: "" }); order.update({ value: "" }); city.update({ value: "" }); },
});`,
        render: () => {
          const supplier = Input({ placeholder: "Any" });
          const order = Input({ placeholder: "Any" });
          const city = Input({ placeholder: "Any" });

          const wrap = document.createElement("div");
          wrap.className = "zen-flex zen-w-full zen-flex-col zen-gap-2";

          const out = document.createElement("p");
          out.className = "zen-m-0 zen-text-xs zen-text-zen-muted-fg";
          const setRan = (v: string) => {
            out.replaceChildren();
            out.append("onGo → ");
            const code = document.createElement("code");
            code.textContent = v;
            out.append(code);
          };
          setRan("—");

          const bar = FilterBar({
            fields: [
              { id: "supplier", label: "Supplier", render: () => supplier },
              { id: "order", label: "Order number", render: () => order },
              { id: "city", label: "City", render: () => city, hiddenByDefault: true },
            ],
            variant: Badge({ children: "Default view" }),
            onGo: () =>
              setRan(
                `supplier="${supplier.el.value}" order="${order.el.value}" city="${city.el.value}"`,
              ),
            onClear: () => {
              supplier.update({ value: "" });
              order.update({ value: "" });
              city.update({ value: "" });
              setRan("—");
            },
          });

          wrap.append(bar.el, out);
          return wrap;
        },
      },
      {
        title: "2. Controlled visibility",
        codeTitle: "visibleIds + onVisibleIdsChange",
        codeDescription:
          "Take over which fields are shown so the choice can be persisted — this is the seam a variant / saved-view feature would plug into later.",
        code: `let visibleIds = ["supplier", "order"];

const bar = FilterBar({
  fields,
  visibleIds,
  onVisibleIdsChange: (ids) => { visibleIds = ids; bar.update({ visibleIds: ids }); },
  collapsible: false,
});`,
        render: () => {
          const supplier = Input({ placeholder: "Any" });
          const order = Input({ placeholder: "Any" });
          const city = Input({ placeholder: "Any" });

          const wrap = document.createElement("div");
          wrap.className = "zen-flex zen-w-full zen-flex-col zen-gap-2";

          const out = document.createElement("p");
          out.className = "zen-m-0 zen-text-xs zen-text-zen-muted-fg";
          const setOut = (ids: string[]) => {
            out.replaceChildren();
            out.append("visibleIds → ");
            const code = document.createElement("code");
            code.textContent = ids.join(", ") || "none";
            out.append(code);
          };

          let visibleIds = ["supplier", "order"];
          const bar = FilterBar({
            fields: [
              { id: "supplier", label: "Supplier", render: () => supplier },
              { id: "order", label: "Order number", render: () => order },
              { id: "city", label: "City", render: () => city, hiddenByDefault: true },
            ],
            visibleIds,
            onVisibleIdsChange: (ids) => {
              visibleIds = ids;
              bar.update({ visibleIds: ids });
              setOut(ids);
            },
            collapsible: false,
          });
          setOut(visibleIds);

          wrap.append(bar.el, out);
          return wrap;
        },
      },
    ],
  });
}
