import type { TreeSelectNode } from "@algorisys/zen-ui-vanilla";
import { DemoPage } from "./demo-helpers";

/**
 * TreeSelect demo — the web-components port. `items` is a JS property; a pick
 * arrives as `zen-value-change` with `[id, node]`, and the page answers by
 * setting `value`. `input-id` puts the id on the inner input, so
 * <zen-label for> names the field.
 */

const n = (id: string, label: string, children?: TreeSelectNode[]): TreeSelectNode => ({ id, label, ...(children ? { children } : {}) });

/** A small chart of accounts. "Cash" sits under two parents, as it does in a real one. */
const ACCOUNTS: TreeSelectNode[] = [
  n("assets", "Assets", [
    n("current", "Current Assets", [
      n("cash", "Cash"),
      n("bank", "Bank Accounts", [n("hdfc", "HDFC Current A/c"), n("sbi", "SBI Savings A/c")]),
      n("debtors", "Sundry Debtors"),
      n("stock", "Stock in Hand"),
    ]),
    n("fixed", "Fixed Assets", [n("plant", "Plant & Machinery"), n("furniture", "Furniture & Fixtures"), n("vehicles", "Vehicles")]),
  ]),
  n("liabilities", "Liabilities", [
    n("current-l", "Current Liabilities", [n("creditors", "Sundry Creditors"), n("gst", "GST Payable"), n("tds", "TDS Payable")]),
    n("loans", "Loans", [n("cc", "Cash Credit"), n("term", "Term Loan")]),
  ]),
  n("income", "Income", [n("sales", "Sales"), n("interest", "Interest Received")]),
  n("expenses", "Expenses", [n("rent", "Rent"), n("salaries", "Salaries"), n("power", "Power & Fuel")]),
];

const ITEM_GROUPS: TreeSelectNode[] = [
  n("all", "All Item Groups", [
    n("raw", "Raw Material", [n("steel", "Steel"), n("polymers", "Polymers")]),
    n("fg", "Finished Goods", [n("pumps", "Pumps"), n("valves", "Valves")]),
    n("consumables", "Consumables"),
  ]),
];

type TreeSelectEl = HTMLElement & { items: TreeSelectNode[] };

function treeSelect(attrs: Record<string, string>, items: TreeSelectNode[]): TreeSelectEl {
  const el = document.createElement("zen-tree-select") as TreeSelectEl;
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  el.items = items;
  return el;
}

const div = (className: string, ...kids: Node[]) => {
  const d = document.createElement("div");
  d.className = className;
  d.append(...kids);
  return d;
};

const picked = (e: Event) => ((e as CustomEvent).detail as [string, TreeSelectNode])[0];

export default function TreeSelectDemo(): HTMLElement {
  return DemoPage({
    title: "TreeSelect",
    description:
      "Pick one node from a hierarchy: an account, an item group, a cost centre, a warehouse. Type to search: every match shows under its ancestors, so “Cash” and “Cash Credit” read as the different accounts they are.",
    sections: [
      {
        title: "1. An account, from the chart of accounts",
        codeTitle: "leaves-only and show-path",
        codeDescription:
          "Only ledger accounts (the leaves) can be picked; the groups open and close. The closed field shows the whole path. Click it or press ↓, then use the arrows: → opens a group, ← closes it or goes up. Or type: “cash” shows both kinds of cash in their places.",
        code: `<zen-label for="account">Account</zen-label>
<zen-tree-select input-id="account" value="hdfc" placeholder="Pick an account"
  leaves-only show-path></zen-tree-select>

field.items = accounts;
field.addEventListener("zen-value-change", (e) => {
  const [id] = e.detail;
  field.setAttribute("value", id);
});`,
        render: () => {
          const label = document.createElement("zen-label");
          label.setAttribute("for", "ts-account");
          label.textContent = "Account";
          const shown = document.createElement("span");
          shown.dataset.testid = "account-value";
          shown.textContent = "hdfc";
          const readout = document.createElement("p");
          readout.className = "zen-m-0 zen-text-xs zen-text-zen-muted-fg";
          readout.append("Value: ", shown);
          const field = treeSelect(
            { "input-id": "ts-account", value: "hdfc", placeholder: "Pick an account", "leaves-only": "", "show-path": "" },
            ACCOUNTS,
          );
          field.addEventListener("zen-value-change", (e) => {
            const id = picked(e);
            field.setAttribute("value", id);
            shown.textContent = id;
          });
          const wrap = div("zen-flex zen-w-full zen-max-w-md zen-flex-col zen-gap-1.5", label, field, readout);
          wrap.dataset.testid = "accounts";
          return wrap;
        },
      },
      {
        title: "2. Groups can be picked too; invalid",
        codeTitle: "An item group, any level",
        codeDescription:
          "Without leaves-only every node can be picked, a group included. invalid marks it aria-invalid with the error border.",
        code: `<zen-tree-select placeholder="Item group" aria-label="Item group" invalid></zen-tree-select>

field.items = itemGroups;
field.addEventListener("zen-value-change", (e) => {
  const [id] = e.detail;
  field.setAttribute("value", id);
  field.toggleAttribute("invalid", !id);
});`,
        render: () => {
          const field = treeSelect(
            { placeholder: "Item group", "aria-label": "Item group", "default-expanded": '["all"]', invalid: "" },
            ITEM_GROUPS,
          );
          field.addEventListener("zen-value-change", (e) => {
            const id = picked(e);
            field.setAttribute("value", id);
            field.toggleAttribute("invalid", !id);
          });
          const wrap = div("zen-w-full zen-max-w-xs", field);
          wrap.dataset.testid = "groups";
          return wrap;
        },
      },
    ],
  });
}
