import { useState } from "react";
import { TreeSelect, type TreeSelectNode } from "./tree-select/tree-select";
import { CodeExample } from "./demo-helpers";

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

const NewTreeSelectDemo: React.FC = () => {
  const [account, setAccount] = useState<string | null>("hdfc");
  const [group, setGroup] = useState<string | null>(null);
  return (
    <div className="demo-page">
      <h1>TreeSelect</h1>
      <p className="lede">
        Pick one node from a hierarchy: an account, an item group, a cost centre, a warehouse. Type to search: every match
        shows under its ancestors, so “Cash” and “Cash Credit” read as the different accounts they are.
      </p>

      <section className="demo-section">
        <h2>1. An account, from the chart of accounts</h2>
        <CodeExample
          title="leavesOnly and showPath"
          description="Only ledger accounts (the leaves) can be picked; the groups open and close. The closed field shows the whole path. Click it or press ↓, then use the arrows: → opens a group, ← closes it or goes up. Or type: “cash” shows both kinds of cash in their places."
          code={`<label htmlFor="account">Account</label>
<TreeSelect
  id="account"
  items={accounts}
  value={account}
  onValueChange={(id) => setAccount(id)}
  placeholder="Pick an account"
  leavesOnly
  showPath
/>`}
        >
          <div className="zen-flex zen-w-full zen-max-w-md zen-flex-col zen-gap-1.5" data-testid="accounts">
            <label htmlFor="ts-account" className="zen-text-sm zen-font-medium">Account</label>
            <TreeSelect
              id="ts-account"
              items={ACCOUNTS}
              value={account}
              onValueChange={(id) => setAccount(id)}
              placeholder="Pick an account"
              leavesOnly
              showPath
            />
            <p className="zen-m-0 zen-text-xs zen-text-zen-muted-fg">
              Value: <span data-testid="account-value">{account ?? "none"}</span>
            </p>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>2. Groups can be picked too; invalid</h2>
        <CodeExample
          title="An item group, any level"
          description="Without leavesOnly every node can be picked, a group included. invalid marks it aria-invalid with the error border."
          code={`<TreeSelect items={itemGroups} value={group} onValueChange={setGroup}
  placeholder="Item group" aria-label="Item group" invalid={!group} />`}
        >
          <div className="zen-w-full zen-max-w-xs" data-testid="groups">
            <TreeSelect
              items={ITEM_GROUPS}
              value={group}
              onValueChange={(id) => setGroup(id)}
              placeholder="Item group"
              aria-label="Item group"
              defaultExpanded={["all"]}
              invalid={!group}
            />
          </div>
        </CodeExample>
      </section>
    </div>
  );
};

export default NewTreeSelectDemo;
