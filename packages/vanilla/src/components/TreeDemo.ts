import { Tree, type TreeNode } from "./tree/tree";
import { DemoPage } from "./demo-helpers";

/** Plain folder/file hierarchy — the shape most trees have. */
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

/** The same tree, with an icon on every node. */
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

/** The React demo's `panel` inline style, verbatim. */
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
        code: `const items: TreeNode[] = [
  {
    id: "src",
    label: "src",
    children: [
      { id: "index.ts", label: "index.ts" },
    ],
  },
  { id: "package.json", label: "package.json" },
];

Tree({ items, defaultExpanded: ["src"], "aria-label": "Project files" });`,
        render: () =>
          panel(Tree({ items: FILES, defaultExpanded: ["src"], "aria-label": "Project files" }).el),
      },
      {
        title: "2. Icons",
        codeTitle: "Any IconName from the zen-ui set, per node",
        code: `const items: TreeNode[] = [
  { id: "src", label: "src", icon: "folder", children: [...] },
  { id: "cog", label: "settings.json", icon: "cog" },
];

Tree({ items, defaultExpanded: ["src"], "aria-label": "Files" });`,
        render: () =>
          panel(
            Tree({ items: ICON_FILES, defaultExpanded: ["src"], "aria-label": "Files with icons" }).el,
          ),
      },
      {
        title: "3. Controlled selection",
        codeTitle: "selected + onSelectedChange own the selection",
        codeDescription: "Pass selected + onSelectedChange to own the selection.",
        code: `let selected: string | null = "tree.tsx";

const tree = Tree({
  items,
  defaultExpanded: ["src", "components"],
  selected,
  onSelectedChange: (id) => {
    selected = id;
    tree.update({ selected });
  },
  "aria-label": "Project files",
});`,
        render: () => {
          const line = status('selected: "tree.tsx"');
          let selected: string | null = "tree.tsx";
          const tree = Tree({
            items: FILES,
            defaultExpanded: ["src", "components"],
            selected,
            onSelectedChange: (id) => {
              selected = id;
              tree.update({ selected });
              line.textContent = selected ? `selected: ${selected}` : "nothing selected";
            },
            "aria-label": "Controlled selection",
          });
          return panel(line, tree.el);
        },
      },
      {
        title: "4. Controlled expansion",
        codeTitle: "expanded + onExpandedChange own which nodes are open",
        codeDescription: "Pass expanded + onExpandedChange to own which nodes are open.",
        code: `let expanded: string[] = ["src"];

const tree = Tree({
  items,
  expanded,
  onExpandedChange: (ids) => {
    expanded = ids;
    tree.update({ expanded });
  },
  defaultSelected: "index.ts",
  "aria-label": "Project files",
});`,
        render: () => {
          let expanded: string[] = ["src"];
          const line = status('expanded: ["src"]');
          const tree = Tree({
            items: FILES,
            expanded,
            onExpandedChange: (ids) => {
              expanded = ids;
              tree.update({ expanded });
              line.textContent = `expanded: [${expanded.map((e) => `"${e}"`).join(", ")}]`;
            },
            defaultSelected: "index.ts",
            "aria-label": "Controlled expansion",
          });
          return panel(line, tree.el);
        },
      },
      {
        title: "5. Disabled nodes",
        codeTitle: "disabled: true — not selectable, still reachable by keyboard",
        codeDescription:
          "A disabled row gets aria-disabled and ignores clicks. Keyboard focus still lands on it, which is what the ARIA pattern asks for.",
        code: `const items: TreeNode[] = [
  {
    id: "reports",
    label: "Reports",
    icon: "folder",
    children: [
      { id: "q3", label: "Q3 — embargoed", icon: "lock", disabled: true },
    ],
  },
  { id: "archive", label: "Archive — no access", icon: "lock", disabled: true },
];`,
        render: () =>
          panel(Tree({ items: DISABLED, defaultExpanded: ["reports"], "aria-label": "Reports" }).el),
      },
      {
        title: "6. Deep nesting",
        codeTitle: "Indent is computed per level — depth is unbounded",
        codeDescription:
          "Each row carries aria-level / aria-posinset / aria-setsize, so the flat DOM still reads correctly to assistive tech.",
        code: `Tree({
  items: deepItems,
  defaultExpanded: ["l1", "l2", "l3", "l4", "l5"],
  "aria-label": "Deep tree",
});`,
        render: () =>
          panel(
            Tree({
              items: DEEP,
              defaultExpanded: ["l1", "l2", "l3", "l4", "l5"],
              "aria-label": "Deep tree",
            }).el,
          ),
      },
      {
        title: "7. Keyboard navigation",
        codeTitle: "Tab into the tree, then drive it from the keyboard",
        codeDescription:
          "↓/↑ move over visible rows · → expands, then descends · ← collapses, then ascends · Home/End jump to the ends · Enter/Space select.",
        code: `// No configuration — the ARIA tree pattern is built in.
Tree({ items, defaultExpanded: ["src"], "aria-label": "Project files" });

// ArrowDown  next visible row (may be a nephew several levels up)
// ArrowUp    previous visible row
// ArrowRight closed -> open; already open -> first child
// ArrowLeft  open -> close; already closed -> parent
// Home/End   first / last visible row
// Enter, Spc select`,
        render: () =>
          panel(
            Tree({
              items: ICON_FILES,
              defaultExpanded: ["src", "components"],
              "aria-label": "Keyboard demo",
            }).el,
          ),
      },
    ],
  });
}
