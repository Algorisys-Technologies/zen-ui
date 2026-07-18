import { useState } from "react";
import {
  ViewSettingsDialog,
  type ViewSettingsValue,
} from "./view-settings/view-settings-dialog";
import { Button } from "./button/button";
import { CodeExample } from "./demo-helpers";

/**
 * ViewSettingsDialog demo. Every section drives real state, because the point of
 * the component is what comes back out of `onConfirm` — a dialog that opens is
 * not evidence that it settled anything.
 */

const SORT_ITEMS = [
  { id: "name", label: "Name" },
  { id: "created", label: "Created on" },
  { id: "amount", label: "Amount", description: "Net value in EUR" },
  { id: "status", label: "Status" },
];

const GROUP_ITEMS = [
  { id: "status", label: "Status" },
  { id: "country", label: "Country" },
];

const FILTER_GROUPS = [
  {
    id: "status",
    label: "Status",
    items: [
      { id: "active", label: "Active" },
      { id: "hold", label: "On hold" },
      { id: "closed", label: "Closed" },
    ],
  },
  {
    id: "country",
    label: "Country",
    items: [
      { id: "de", label: "Germany" },
      { id: "no", label: "Norway" },
      { id: "es", label: "Spain" },
    ],
  },
];

const describe = (v: ViewSettingsValue) => {
  const parts: string[] = [];
  if (v.sortBy) parts.push(`sort ${v.sortBy}${v.sortDescending ? " desc" : " asc"}`);
  if (v.groupBy) parts.push(`group ${v.groupBy}${v.groupDescending ? " desc" : " asc"}`);
  const f = Object.entries(v.filters ?? {}).filter(([, ids]) => ids.length);
  if (f.length) parts.push(f.map(([g, ids]) => `${g}:[${ids.join(",")}]`).join(" "));
  return parts.length ? parts.join(" · ") : "—";
};

const NewViewSettingsDemo = () => {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<ViewSettingsValue>({});

  const [sortOnlyOpen, setSortOnlyOpen] = useState(false);
  const [sortOnly, setSortOnly] = useState<ViewSettingsValue>({});

  return (
    <div className="demo-page">
      <h1>ViewSettingsDialog</h1>
      <p className="lede">
        Sort / group / filter settings for a list or table. The caller owns the
        data; the dialog only collects intent and hands it back on OK. Nothing commits
        until then, so Cancel restores whatever <code>value</code> held when it opened.
        Reset clears the draft but still needs an OK — it is an edit, not a second commit
        path. Picking the selected sort field again clears it, because a sort you cannot
        turn off is a trap.
      </p>

      <section className="demo-section">
        <h2>1. All three sections</h2>
        <CodeExample
          title="sortItems + groupItems + filterGroups"
          description="Only the sections you pass get a tab. The Filter tab carries a count badge of everything ticked across its groups."
          code={`const [settings, setSettings] = useState<ViewSettingsValue>({});

<ViewSettingsDialog
  open={open}
  onOpenChange={setOpen}
  sortItems={SORT_ITEMS}
  groupItems={GROUP_ITEMS}
  filterGroups={FILTER_GROUPS}
  value={settings}
  onConfirm={setSettings}
/>`}
        >
          <div className="zen-flex zen-flex-col zen-items-start zen-gap-2">
            <Button type="button" onClick={() => setOpen(true)}>
              Open view settings
            </Button>
            <p className="zen-m-0 zen-text-xs zen-text-zen-muted-fg">
              onConfirm → <code>{describe(settings)}</code>
            </p>
            <ViewSettingsDialog
              open={open}
              onOpenChange={setOpen}
              description="Sort, group and filter the order list."
              sortItems={SORT_ITEMS}
              groupItems={GROUP_ITEMS}
              filterGroups={FILTER_GROUPS}
              value={settings}
              onConfirm={setSettings}
            />
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>2. One section, no tab strip</h2>
        <CodeExample
          title="sortItems only"
          description="A single tab is a label pretending to be a choice, so the strip disappears and the pane fills the dialog. The Descending switch stays disabled until a field is chosen — a direction with nothing to order is noise."
          code={`<ViewSettingsDialog
  open={open}
  onOpenChange={setOpen}
  title="Sort"
  sortItems={SORT_ITEMS}
  value={sortOnly}
  onConfirm={setSortOnly}
/>`}
        >
          <div className="zen-flex zen-flex-col zen-items-start zen-gap-2">
            <Button type="button" variant="outline" color="neutral" onClick={() => setSortOnlyOpen(true)}>
              Open sort settings
            </Button>
            <p className="zen-m-0 zen-text-xs zen-text-zen-muted-fg">
              onConfirm → <code>{describe(sortOnly)}</code>
            </p>
            <ViewSettingsDialog
              open={sortOnlyOpen}
              onOpenChange={setSortOnlyOpen}
              title="Sort"
              sortItems={SORT_ITEMS}
              value={sortOnly}
              onConfirm={setSortOnly}
            />
          </div>
        </CodeExample>
      </section>
    </div>
  );
};

export default NewViewSettingsDemo;
