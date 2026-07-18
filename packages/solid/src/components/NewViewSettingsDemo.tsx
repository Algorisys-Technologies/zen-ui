import { createSignal } from "solid-js";
import {
  ViewSettingsDialog,
  type ViewSettingsValue,
} from "./view-settings/view-settings-dialog";
import { Button } from "./button/button";
import { DemoPage, DemoSection } from "./demo-helpers";

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
  const [open, setOpen] = createSignal(false);
  const [settings, setSettings] = createSignal<ViewSettingsValue>({});

  const [sortOnlyOpen, setSortOnlyOpen] = createSignal(false);
  const [sortOnly, setSortOnly] = createSignal<ViewSettingsValue>({});

  return (
    <DemoPage
      title="ViewSettingsDialog"
      description={
        <>
          Sort / group / filter settings for a list or table. The caller owns the
          data; the dialog only collects intent and hands it back on OK. Nothing commits
          until then, so Cancel restores whatever <code>value</code> held when it opened.
          Reset clears the draft but still needs an OK — it is an edit, not a second commit
          path. Picking the selected sort field again clears it, because a sort you cannot
          turn off is a trap.
        </>
      }
    >
      <DemoSection
        title="1. All three sections"
        codeTitle="sortItems + groupItems + filterGroups"
        codeDescription="Only the sections you pass get a tab. The Filter tab carries a count badge of everything ticked across its groups."
        code={`const [settings, setSettings] = createSignal<ViewSettingsValue>({});

<ViewSettingsDialog
  open={open()}
  onOpenChange={setOpen}
  sortItems={SORT_ITEMS}
  groupItems={GROUP_ITEMS}
  filterGroups={FILTER_GROUPS}
  value={settings()}
  onConfirm={setSettings}
/>`}
      >
        <div class="zen-flex zen-flex-col zen-items-start zen-gap-2">
          <Button type="button" onClick={() => setOpen(true)}>
            Open view settings
          </Button>
          <p class="zen-m-0 zen-text-xs zen-text-zen-muted-fg">
            onConfirm → <code>{describe(settings())}</code>
          </p>
          <ViewSettingsDialog
            open={open()}
            onOpenChange={setOpen}
            description="Sort, group and filter the order list."
            sortItems={SORT_ITEMS}
            groupItems={GROUP_ITEMS}
            filterGroups={FILTER_GROUPS}
            value={settings()}
            onConfirm={setSettings}
          />
        </div>
      </DemoSection>

      <DemoSection
        title="2. One section, no tab strip"
        codeTitle="sortItems only"
        codeDescription="A single tab is a label pretending to be a choice, so the strip disappears and the pane fills the dialog. The Descending switch stays disabled until a field is chosen — a direction with nothing to order is noise."
        code={`<ViewSettingsDialog
  open={open()}
  onOpenChange={setOpen}
  title="Sort"
  sortItems={SORT_ITEMS}
  value={sortOnly()}
  onConfirm={setSortOnly}
/>`}
      >
        <div class="zen-flex zen-flex-col zen-items-start zen-gap-2">
          <Button
            type="button"
            variant="outline"
            color="neutral"
            onClick={() => setSortOnlyOpen(true)}
          >
            Open sort settings
          </Button>
          <p class="zen-m-0 zen-text-xs zen-text-zen-muted-fg">
            onConfirm → <code>{describe(sortOnly())}</code>
          </p>
          <ViewSettingsDialog
            open={sortOnlyOpen()}
            onOpenChange={setSortOnlyOpen}
            title="Sort"
            sortItems={SORT_ITEMS}
            value={sortOnly()}
            onConfirm={setSortOnly}
          />
        </div>
      </DemoSection>
    </DemoPage>
  );
};

export default NewViewSettingsDemo;
