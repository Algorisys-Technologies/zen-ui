import { DemoPage } from "./demo-helpers";
import type {
  ViewSettingsValue,
  ViewSettingsItem,
  ViewSettingsFilterGroup,
} from "@algorisys/zen-ui-vanilla";

/**
 * Mirrors the vanilla ViewSettingsDemo, rendered through <zen-view-settings-dialog>.
 * The three data collections (sort-items / group-items / filter-groups) and `value`
 * are JS properties. The dialog handle's `open()` method is forwarded onto the
 * element, so `el.open()` shows it after seeding `el.value`. onConfirm maps to
 * zen-confirm (detail is the settled ViewSettingsValue).
 */
const SORT_ITEMS: ViewSettingsItem[] = [
  { id: "name", label: "Name" },
  { id: "created", label: "Created on" },
  { id: "amount", label: "Amount", description: "Net value in EUR" },
  { id: "status", label: "Status" },
];

const GROUP_ITEMS: ViewSettingsItem[] = [
  { id: "status", label: "Status" },
  { id: "country", label: "Country" },
];

const FILTER_GROUPS: ViewSettingsFilterGroup[] = [
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

const describe = (v: ViewSettingsValue): string => {
  const parts: string[] = [];
  if (v.sortBy) parts.push(`sort ${v.sortBy}${v.sortDescending ? " desc" : " asc"}`);
  if (v.groupBy) parts.push(`group ${v.groupBy}${v.groupDescending ? " desc" : " asc"}`);
  const f = Object.entries(v.filters ?? {}).filter(([, ids]) => ids.length);
  if (f.length) parts.push(f.map(([g, ids]) => `${g}:[${ids.join(",")}]`).join(" "));
  return parts.length ? parts.join(" · ") : "—";
};

function button(attrs: Record<string, string>, label: string): HTMLElement {
  const b = document.createElement("zen-button");
  b.setAttribute("type", "button");
  for (const [k, v] of Object.entries(attrs)) b.setAttribute(k, v);
  b.textContent = label;
  return b;
}

/** A trigger button + a live "onConfirm →" readout, wired to one dialog element. */
const trigger = (
  label: string,
  btnAttrs: Record<string, string>,
  configure: (dialog: HTMLElement) => void,
): HTMLElement => {
  let settings: ViewSettingsValue = {};

  const wrap = document.createElement("div");
  wrap.className = "zen-flex zen-flex-col zen-items-start zen-gap-2";

  const result = document.createElement("code");
  result.textContent = describe(settings);

  const dialog = document.createElement("zen-view-settings-dialog");
  configure(dialog);
  dialog.addEventListener("zen-confirm", (e) => {
    settings = (e as CustomEvent<ViewSettingsValue>).detail;
    result.textContent = describe(settings);
  });

  const open = button(btnAttrs, label);
  open.addEventListener("click", () => {
    (dialog as unknown as { value: ViewSettingsValue }).value = settings;
    (dialog as unknown as { open(): void }).open();
  });

  const line = document.createElement("p");
  line.className = "zen-m-0 zen-text-xs zen-text-zen-muted-fg";
  line.append(document.createTextNode("onConfirm → "), result);

  // The element must be connected to build its component and forward open(),
  // so it lives in the page even though it portals itself when opened.
  wrap.append(open, line, dialog);
  return wrap;
};

export default function ViewSettingsDemo(): HTMLElement {
  return DemoPage({
    title: "ViewSettingsDialog",
    description:
      "Sort / group / filter settings for a list or table. The caller owns the data; the dialog only collects intent and hands it back on OK. Nothing commits until then, so Cancel restores whatever value held when it opened. Reset clears the draft but still needs an OK — it is an edit, not a second commit path. Picking the selected sort field again clears it, because a sort you cannot turn off is a trap.",
    sections: [
      {
        title: "1. All three sections",
        codeTitle: "sortItems + groupItems + filterGroups",
        codeDescription:
          "Only the sections you pass get a tab. The Filter tab carries a count badge of everything ticked across its groups.",
        code: `const vsd = document.createElement("zen-view-settings-dialog");
vsd.setAttribute("description", "Sort, group and filter the order list.");
vsd.sortItems = SORT_ITEMS;
vsd.groupItems = GROUP_ITEMS;
vsd.filterGroups = FILTER_GROUPS;
vsd.addEventListener("zen-confirm", (e) => { settings = e.detail; });

openBtn.addEventListener("click", () => {
  vsd.value = settings;   // read on open
  vsd.open();
});`,
        render: () =>
          trigger("Open view settings", {}, (dialog) => {
            dialog.setAttribute("description", "Sort, group and filter the order list.");
            const bag = dialog as unknown as Record<string, unknown>;
            bag.sortItems = SORT_ITEMS;
            bag.groupItems = GROUP_ITEMS;
            bag.filterGroups = FILTER_GROUPS;
          }),
      },
      {
        title: "2. One section, no tab strip",
        codeTitle: "sortItems only",
        codeDescription:
          "A single tab is a label pretending to be a choice, so the strip disappears and the pane fills the dialog. The Descending switch stays disabled until a field is chosen — a direction with nothing to order is noise.",
        code: `const vsd = document.createElement("zen-view-settings-dialog");
vsd.setAttribute("title", "Sort");
vsd.sortItems = SORT_ITEMS;`,
        render: () =>
          trigger(
            "Open sort settings",
            { variant: "outline", color: "neutral" },
            (dialog) => {
              dialog.setAttribute("title", "Sort");
              (dialog as unknown as { sortItems: ViewSettingsItem[] }).sortItems = SORT_ITEMS;
            },
          ),
      },
    ],
  });
}
