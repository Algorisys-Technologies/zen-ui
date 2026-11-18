import { DemoPage } from "./demo-helpers";

/**
 * FilterBar demo — the web-components mirror of the vanilla FilterBarDemo. Renders
 * <zen-filter-bar>; `fields` (each carrying a `render` fn that returns a
 * <zen-input>), `variant` and `visibleIds` are JS properties. onGo / onClear /
 * onVisibleIdsChange arrive as zen-go / zen-clear / zen-visible-ids-change events.
 */

function el(tag: string, attrs: Record<string, string> = {}, text?: string): HTMLElement {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  if (text != null) n.textContent = text;
  return n;
}

const setProp = (node: HTMLElement, name: string, value: unknown): void => {
  (node as unknown as Record<string, unknown>)[name] = value;
};

/** Read the user-typed value out of a <zen-input> host (its child <input>). */
const readVal = (host: HTMLElement): string => host.querySelector("input")?.value ?? "";
/** Clear a <zen-input> by driving its controlled value back to "". */
const clearVal = (host: HTMLElement): void => host.setAttribute("value", "");

type Field = { id: string; label: string; render: () => Node; hiddenByDefault?: boolean };

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
        code: `const supplier = document.createElement("zen-input");
const order = document.createElement("zen-input");
const city = document.createElement("zen-input");

bar.fields = [
  { id: "supplier", label: "Supplier", render: () => supplier },
  { id: "order", label: "Order number", render: () => order },
  { id: "city", label: "City", render: () => city, hiddenByDefault: true },
];
bar.variant = badge;   // a <zen-badge> element
bar.addEventListener("zen-go", () => runQuery({ supplier: supplier.value, … }));`,
        render: () => {
          const supplier = el("zen-input", { placeholder: "Any" });
          const order = el("zen-input", { placeholder: "Any" });
          const city = el("zen-input", { placeholder: "Any" });

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

          const bar = el("zen-filter-bar");
          setProp(bar, "fields", [
            { id: "supplier", label: "Supplier", render: () => supplier },
            { id: "order", label: "Order number", render: () => order },
            { id: "city", label: "City", render: () => city, hiddenByDefault: true },
          ] satisfies Field[]);
          setProp(bar, "variant", el("zen-badge", {}, "Default view"));
          bar.addEventListener("zen-go", () =>
            setRan(`supplier="${readVal(supplier)}" order="${readVal(order)}" city="${readVal(city)}"`),
          );
          bar.addEventListener("zen-clear", () => {
            clearVal(supplier);
            clearVal(order);
            clearVal(city);
            setRan("—");
          });

          wrap.append(bar, out);
          return wrap;
        },
      },
      {
        title: "2. Controlled visibility",
        codeTitle: "visibleIds + zen-visible-ids-change",
        codeDescription:
          "Take over which fields are shown so the choice can be persisted — this is the seam a variant / saved-view feature would plug into later.",
        code: `bar.visibleIds = ["supplier", "order"];
bar.collapsible = false;
bar.addEventListener("zen-visible-ids-change", (e) => { bar.visibleIds = e.detail; });`,
        render: () => {
          const supplier = el("zen-input", { placeholder: "Any" });
          const order = el("zen-input", { placeholder: "Any" });
          const city = el("zen-input", { placeholder: "Any" });

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

          const bar = el("zen-filter-bar");
          setProp(bar, "fields", [
            { id: "supplier", label: "Supplier", render: () => supplier },
            { id: "order", label: "Order number", render: () => order },
            { id: "city", label: "City", render: () => city, hiddenByDefault: true },
          ] satisfies Field[]);
          setProp(bar, "visibleIds", ["supplier", "order"]);
          setProp(bar, "collapsible", false);
          bar.addEventListener("zen-visible-ids-change", (e) => {
            const ids = (e as CustomEvent<string[]>).detail;
            setProp(bar, "visibleIds", ids);
            setOut(ids);
          });
          setOut(["supplier", "order"]);

          wrap.append(bar, out);
          return wrap;
        },
      },
    ],
  });
}
