import { createSignal } from "solid-js";
import { TreeSelect, type TreeSelectNode } from "./tree-select/tree-select";
import { DemoPage, DemoSection } from "./demo-helpers";

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

const NewTreeSelectDemo = () => {
  const [account, setAccount] = createSignal<string | null>("hdfc");
  const [group, setGroup] = createSignal<string | null>(null);
  return (
    <DemoPage
      title="TreeSelect"
      description="Pick one node from a hierarchy: an account, an item group, a cost centre, a warehouse. Type to search: every match shows under its ancestors, so “Cash” and “Cash Credit” read as the different accounts they are."
    >
      <DemoSection
        title="1. An account, from the chart of accounts"
        codeTitle="leavesOnly and showPath"
        codeDescription="Only ledger accounts (the leaves) can be picked; the groups open and close. The closed field shows the whole path. Click it or press ↓, then use the arrows: → opens a group, ← closes it or goes up. Or type: “cash” shows both kinds of cash in their places."
        code={`<label for="account">Account</label>
<TreeSelect
  id="account"
  items={accounts}
  value={account()}
  onValueChange={(id) => setAccount(id)}
  placeholder="Pick an account"
  leavesOnly
  showPath
/>`}
      >
        <div class="zen-flex zen-w-full zen-max-w-md zen-flex-col zen-gap-1.5" data-testid="accounts">
          <label for="ts-account" class="zen-text-sm zen-font-medium">Account</label>
          <TreeSelect
            id="ts-account"
            items={ACCOUNTS}
            value={account()}
            onValueChange={(id) => setAccount(id)}
            placeholder="Pick an account"
            leavesOnly
            showPath
          />
          <p class="zen-m-0 zen-text-xs zen-text-zen-muted-fg">
            Value: <span data-testid="account-value">{account() ?? "none"}</span>
          </p>
        </div>
      </DemoSection>

      <DemoSection
        title="2. Groups can be picked too; invalid"
        codeTitle="An item group, any level"
        codeDescription="Without leavesOnly every node can be picked, a group included. invalid marks it aria-invalid with the error border."
        code={`<TreeSelect items={itemGroups} value={group()} onValueChange={setGroup}
  placeholder="Item group" aria-label="Item group" invalid={!group()} />`}
      >
        <div class="zen-w-full zen-max-w-xs" data-testid="groups">
          <TreeSelect
            items={ITEM_GROUPS}
            value={group()}
            onValueChange={(id) => setGroup(id)}
            placeholder="Item group"
            aria-label="Item group"
            defaultExpanded={["all"]}
            invalid={!group()}
          />
        </div>
      </DemoSection>
    </DemoPage>
  );
};

export default NewTreeSelectDemo;
