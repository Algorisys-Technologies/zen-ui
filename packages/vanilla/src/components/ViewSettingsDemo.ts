import { Button } from "./button/button";
import {
  ViewSettingsDialog,
  type ViewSettingsValue,
} from "./view-settings/view-settings-dialog";
import { DemoPage } from "./demo-helpers";

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

/** A trigger button + a live "onConfirm →" readout, wired to one dialog. */
const trigger = (
  label: string,
  btnProps: Parameters<typeof Button>[0],
  make: (onConfirm: (v: ViewSettingsValue) => void) => ReturnType<typeof ViewSettingsDialog>,
): HTMLElement => {
  let settings: ViewSettingsValue = {};
  const wrap = document.createElement("div");
  wrap.className = "zen-flex zen-flex-col zen-items-start zen-gap-2";

  const result = document.createElement("code");
  result.textContent = describe(settings);

  const dialog = make((v) => {
    settings = v;
    result.textContent = describe(v);
  });

  const open = Button({
    ...btnProps,
    children: label,
    onClick: () => {
      dialog.update({ value: settings });
      dialog.open();
    },
  });

  const line = document.createElement("p");
  line.className = "zen-m-0 zen-text-xs zen-text-zen-muted-fg";
  line.append(document.createTextNode("onConfirm → "), result);

  wrap.append(open.el, line);
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
        code: `let settings: ViewSettingsValue = {};

const vsd = ViewSettingsDialog({
  description: "Sort, group and filter the order list.",
  sortItems: SORT_ITEMS,
  groupItems: GROUP_ITEMS,
  filterGroups: FILTER_GROUPS,
  value: settings,
  onConfirm: (v) => { settings = v; },
});

openBtn.el.addEventListener("click", () => {
  vsd.update({ value: settings });
  vsd.open();
});`,
        render: () =>
          trigger(
            "Open view settings",
            { type: "button" },
            (onConfirm) =>
              ViewSettingsDialog({
                description: "Sort, group and filter the order list.",
                sortItems: SORT_ITEMS,
                groupItems: GROUP_ITEMS,
                filterGroups: FILTER_GROUPS,
                onConfirm,
              }),
          ),
      },
      {
        title: "2. One section, no tab strip",
        codeTitle: "sortItems only",
        codeDescription:
          "A single tab is a label pretending to be a choice, so the strip disappears and the pane fills the dialog. The Descending switch stays disabled until a field is chosen — a direction with nothing to order is noise.",
        code: `const vsd = ViewSettingsDialog({
  title: "Sort",
  sortItems: SORT_ITEMS,
  value: sortOnly,
  onConfirm: (v) => { sortOnly = v; },
});

openBtn.el.addEventListener("click", () => {
  vsd.update({ value: sortOnly });
  vsd.open();
});`,
        render: () =>
          trigger(
            "Open sort settings",
            { type: "button", variant: "outline", color: "neutral" },
            (onConfirm) =>
              ViewSettingsDialog({
                title: "Sort",
                sortItems: SORT_ITEMS,
                onConfirm,
              }),
          ),
      },
    ],
  });
}
