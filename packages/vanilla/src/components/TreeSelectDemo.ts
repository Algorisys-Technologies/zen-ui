import { TreeSelect, type TreeSelectNode } from "./tree-select/tree-select";
import { DemoPage } from "./demo-helpers";

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

const div = (className: string, ...kids: Node[]) => {
  const d = document.createElement("div");
  d.className = className;
  d.append(...kids);
  return d;
};

export default function TreeSelectDemo(): HTMLElement {
  return DemoPage({
    title: "TreeSelect",
    description:
      "Pick one node from a hierarchy: an account, an item group, a cost centre, a warehouse. Type to search: every match shows under its ancestors, so “Cash” and “Cash Credit” read as the different accounts they are.",
    sections: [
      {
        title: "1. An account, from the chart of accounts",
        codeTitle: "leavesOnly and showPath",
        codeDescription:
          "Only ledger accounts (the leaves) can be picked; the groups open and close. The closed field shows the whole path. Click it or press ↓, then use the arrows: → opens a group, ← closes it or goes up. Or type: “cash” shows both kinds of cash in their places.",
        code: `const label = document.createElement("label");
label.htmlFor = "account";
label.textContent = "Account";

let account = "hdfc";
const field = TreeSelect({
  id: "account",
  items: accounts,
  value: account,
  onValueChange: (id) => field.update({ value: (account = id) }),
  placeholder: "Pick an account",
  leavesOnly: true,
  showPath: true,
});
form.append(label, field.el);`,
        render: () => {
          let account: string | null = "hdfc";
          const label = document.createElement("label");
          label.htmlFor = "ts-account";
          label.className = "zen-text-sm zen-font-medium";
          label.textContent = "Account";
          const shown = document.createElement("span");
          shown.dataset.testid = "account-value";
          shown.textContent = account;
          const readout = document.createElement("p");
          readout.className = "zen-m-0 zen-text-xs zen-text-zen-muted-fg";
          readout.append("Value: ", shown);
          const field = TreeSelect({
            id: "ts-account",
            items: ACCOUNTS,
            value: account,
            onValueChange: (id) => {
              account = id;
              field.update({ value: id });
              shown.textContent = id;
            },
            placeholder: "Pick an account",
            leavesOnly: true,
            showPath: true,
          });
          const wrap = div("zen-flex zen-w-full zen-max-w-md zen-flex-col zen-gap-1.5", label, field.el, readout);
          wrap.dataset.testid = "accounts";
          return wrap;
        },
      },
      {
        title: "2. Groups can be picked too; invalid",
        codeTitle: "An item group, any level",
        codeDescription:
          "Without leavesOnly every node can be picked, a group included. invalid marks it aria-invalid with the error border.",
        code: `let group = null;
const field = TreeSelect({
  items: itemGroups,
  value: group,
  onValueChange: (id) => field.update({ value: (group = id), invalid: !group }),
  placeholder: "Item group",
  "aria-label": "Item group",
  invalid: !group,
});`,
        render: () => {
          let group: string | null = null;
          const field = TreeSelect({
            items: ITEM_GROUPS,
            value: group,
            onValueChange: (id) => {
              group = id;
              field.update({ value: id, invalid: !group });
            },
            placeholder: "Item group",
            "aria-label": "Item group",
            defaultExpanded: ["all"],
            invalid: !group,
          });
          const wrap = div("zen-w-full zen-max-w-xs", field.el);
          wrap.dataset.testid = "groups";
          return wrap;
        },
      },
    ],
  });
}
