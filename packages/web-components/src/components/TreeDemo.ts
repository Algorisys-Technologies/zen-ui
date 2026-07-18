import { DemoPage } from "./demo-helpers";
import type { TreeNode } from "@algorisys/zen-ui-vanilla";

/**
 * Mirrors the vanilla TreeDemo, rendered through <zen-tree>. `items` is the data
 * collection (set `el.items = [...]` or author `items='[…]'`). `expanded` /
 * `selected` and their `default*` counterparts are controlled JS properties;
 * onExpandedChange/onSelectedChange map to zen-expanded-change / zen-selected-change.
 */

const FILES: TreeNode[] = [
  {
    id: "src",
    label: "src",
    children: [
      {
        id: "components",
        label: "components",
        children: [
          { id: "button.tsx", label: "button.tsx" },
          { id: "tree.tsx", label: "tree.tsx" },
        ],
      },
      { id: "index.ts", label: "index.ts" },
    ],
  },
  {
    id: "docs",
    label: "docs",
    children: [{ id: "readme.md", label: "readme.md" }],
  },
  { id: "package.json", label: "package.json" },
];

const ICON_FILES: TreeNode[] = [
  {
    id: "src",
    label: "src",
    icon: "folder",
    children: [
      {
        id: "components",
        label: "components",
        icon: "folder",
        children: [
          { id: "button.tsx", label: "button.tsx", icon: "file" },
          { id: "tree.tsx", label: "tree.tsx", icon: "file" },
        ],
      },
      { id: "index.ts", label: "index.ts", icon: "file" },
    ],
  },
  { id: "cog", label: "settings.json", icon: "cog" },
  { id: "readme", label: "README.md", icon: "draft" },
];

const DISABLED: TreeNode[] = [
  {
    id: "reports",
    label: "Reports",
    icon: "folder",
    children: [
      { id: "q1", label: "Q1 — published", icon: "file" },
      { id: "q2", label: "Q2 — published", icon: "file" },
      { id: "q3", label: "Q3 — embargoed", icon: "lock", disabled: true },
    ],
  },
  { id: "archive", label: "Archive — no access", icon: "lock", disabled: true },
];

const DEEP: TreeNode[] = [
  {
    id: "l1",
    label: "Level 1",
    icon: "folder",
    children: [
      {
        id: "l2",
        label: "Level 2",
        icon: "folder",
        children: [
          {
            id: "l3",
            label: "Level 3",
            icon: "folder",
            children: [
              {
                id: "l4",
                label: "Level 4",
                icon: "folder",
                children: [
                  {
                    id: "l5",
                    label: "Level 5",
                    icon: "folder",
                    children: [{ id: "l6", label: "Level 6 — a leaf", icon: "file" }],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];

/** A <zen-tree> with items + optional properties set before it mounts. */
function tree(
  items: TreeNode[],
  ariaLabel: string,
  props: Record<string, unknown> = {},
): HTMLElement {
  const t = document.createElement("zen-tree");
  t.setAttribute("aria-label", ariaLabel);
  const bag = t as unknown as Record<string, unknown>;
  bag.items = items;
  for (const [k, v] of Object.entries(props)) bag[k] = v;
  return t;
}

function panel(...children: Node[]): HTMLElement {
  const div = document.createElement("div");
  div.style.minWidth = "260px";
  div.style.padding = "0.5rem";
  div.style.border = "1px solid var(--zen-color-border)";
  div.style.borderRadius = "var(--zen-radius-md)";
  div.append(...children);
  return div;
}

function status(text: string): HTMLElement {
  const p = document.createElement("p");
  p.style.margin = "0 0 0.5rem";
  p.style.fontSize = "0.8125rem";
  p.style.color = "var(--zen-color-muted-fg)";
  p.textContent = text;
  return p;
}

export default function TreeDemo(): HTMLElement {
  return DemoPage({
    title: "Tree",
    description:
      "Hierarchical, expandable list. Data-driven via items rather than compound — WAI-ARIA tree navigation is defined over the flattened visible node list, so the keyboard model needs the whole tree anyway. Implements the ARIA tree pattern: one tab stop (roving tabindex), Arrow up/down over visible rows, Right to expand-or-descend, Left to collapse-or-ascend, Home/End, Enter/Space to select.",
    sections: [
      {
        title: "1. Basic — uncontrolled",
        codeTitle: "defaultExpanded seeds the open nodes; the Tree owns the rest",
        codeDescription: "Click a parent row to expand or collapse it.",
        code: `const tree = document.createElement("zen-tree");
tree.items = [
  { id: "src", label: "src", children: [{ id: "index.ts", label: "index.ts" }] },
  { id: "package.json", label: "package.json" },
];
tree.defaultExpanded = ["src"];`,
        render: () => panel(tree(FILES, "Project files", { defaultExpanded: ["src"] })),
      },
      {
        title: "2. Icons",
        codeTitle: "Any IconName from the zen-ui set, per node",
        code: `tree.items = [
  { id: "src", label: "src", icon: "folder", children: [...] },
  { id: "cog", label: "settings.json", icon: "cog" },
];`,
        render: () =>
          panel(tree(ICON_FILES, "Files with icons", { defaultExpanded: ["src"] })),
      },
      {
        title: "3. Controlled selection",
        codeTitle: "selected + zen-selected-change own the selection",
        codeDescription: "Set `selected` and listen for zen-selected-change to own it.",
        code: `tree.selected = "tree.tsx";
tree.addEventListener("zen-selected-change", (e) => {
  tree.selected = e.detail;   // e.detail is the id or null
});`,
        render: () => {
          const line = status('selected: "tree.tsx"');
          const t = tree(FILES, "Controlled selection", {
            defaultExpanded: ["src", "components"],
            selected: "tree.tsx",
          });
          t.addEventListener("zen-selected-change", (e) => {
            const selected = (e as CustomEvent<string | null>).detail;
            (t as unknown as { selected: string | null }).selected = selected;
            line.textContent = selected ? `selected: ${selected}` : "nothing selected";
          });
          return panel(line, t);
        },
      },
      {
        title: "4. Controlled expansion",
        codeTitle: "expanded + zen-expanded-change own which nodes are open",
        codeDescription: "Set `expanded` and listen for zen-expanded-change to own it.",
        code: `tree.expanded = ["src"];
tree.defaultSelected = "index.ts";
tree.addEventListener("zen-expanded-change", (e) => {
  tree.expanded = e.detail;   // e.detail is string[]
});`,
        render: () => {
          const line = status('expanded: ["src"]');
          const t = tree(FILES, "Controlled expansion", {
            expanded: ["src"],
            defaultSelected: "index.ts",
          });
          t.addEventListener("zen-expanded-change", (e) => {
            const expanded = (e as CustomEvent<string[]>).detail;
            (t as unknown as { expanded: string[] }).expanded = expanded;
            line.textContent = `expanded: [${expanded.map((x) => `"${x}"`).join(", ")}]`;
          });
          return panel(line, t);
        },
      },
      {
        title: "5. Disabled nodes",
        codeTitle: "disabled: true — not selectable, still reachable by keyboard",
        codeDescription:
          "A disabled row gets aria-disabled and ignores clicks. Keyboard focus still lands on it, which is what the ARIA pattern asks for.",
        code: `tree.items = [
  { id: "reports", label: "Reports", icon: "folder", children: [
    { id: "q3", label: "Q3 — embargoed", icon: "lock", disabled: true },
  ]},
  { id: "archive", label: "Archive — no access", icon: "lock", disabled: true },
];`,
        render: () => panel(tree(DISABLED, "Reports", { defaultExpanded: ["reports"] })),
      },
      {
        title: "6. Deep nesting",
        codeTitle: "Indent is computed per level — depth is unbounded",
        codeDescription:
          "Each row carries aria-level / aria-posinset / aria-setsize, so the flat DOM still reads correctly to assistive tech.",
        code: `tree.items = deepItems;
tree.defaultExpanded = ["l1", "l2", "l3", "l4", "l5"];`,
        render: () =>
          panel(tree(DEEP, "Deep tree", { defaultExpanded: ["l1", "l2", "l3", "l4", "l5"] })),
      },
      {
        title: "7. Keyboard navigation",
        codeTitle: "Tab into the tree, then drive it from the keyboard",
        codeDescription:
          "↓/↑ move over visible rows · → expands, then descends · ← collapses, then ascends · Home/End jump to the ends · Enter/Space select.",
        code: `// No configuration — the ARIA tree pattern is built in.
// ArrowDown  next visible row (may be a nephew several levels up)
// ArrowUp    previous visible row
// ArrowRight closed -> open; already open -> first child
// ArrowLeft  open -> close; already closed -> parent
// Home/End   first / last visible row
// Enter, Spc select`,
        render: () =>
          panel(tree(ICON_FILES, "Keyboard demo", { defaultExpanded: ["src", "components"] })),
      },
    ],
  });
}
