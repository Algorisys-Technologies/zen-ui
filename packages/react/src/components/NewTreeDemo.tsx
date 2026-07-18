import { useState } from "react";
import { Tree, type TreeNode } from "./tree/tree";
import { CodeExample } from "./demo-helpers";

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

const panel: React.CSSProperties = {
  minWidth: 260,
  padding: "0.5rem",
  border: "1px solid var(--zen-color-border)",
  borderRadius: "var(--zen-radius-md)",
};

const NewTreeDemo: React.FC = () => {
  const [selected, setSelected] = useState<string | null>("tree.tsx");
  const [expanded, setExpanded] = useState<string[]>(["src"]);

  return (
    <div className="demo-page">
      <h1>Tree</h1>
      <p className="lede">
        Hierarchical, expandable list. Data-driven via <code>items</code> rather
        than compound — WAI-ARIA tree navigation is defined over the flattened{" "}
        <em>visible</em> node list, so the keyboard model needs the whole tree
        anyway. Implements the ARIA tree pattern: one tab stop (roving tabindex),
        Arrow up/down over visible rows, Right to expand-or-descend, Left to
        collapse-or-ascend, Home/End, Enter/Space to select.
      </p>

      <section className="demo-section">
        <h2>1. Basic — uncontrolled</h2>
        <CodeExample
          title="defaultExpanded seeds the open nodes; the Tree owns the rest"
          description="Click a parent row to expand or collapse it."
          code={`const items: TreeNode[] = [
  {
    id: "src",
    label: "src",
    children: [
      { id: "index.ts", label: "index.ts" },
    ],
  },
  { id: "package.json", label: "package.json" },
];

<Tree items={items} defaultExpanded={["src"]} aria-label="Project files" />`}
        >
          <div style={panel}>
            <Tree items={FILES} defaultExpanded={["src"]} aria-label="Project files" />
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>2. Icons</h2>
        <CodeExample
          title="Any IconName from the zen-ui set, per node"
          code={`const items: TreeNode[] = [
  { id: "src", label: "src", icon: "folder", children: [...] },
  { id: "cog", label: "settings.json", icon: "cog" },
];

<Tree items={items} defaultExpanded={["src"]} aria-label="Files" />`}
        >
          <div style={panel}>
            <Tree items={ICON_FILES} defaultExpanded={["src"]} aria-label="Files with icons" />
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>3. Controlled selection</h2>
        <CodeExample
          title={selected ? `selected: ${selected}` : "nothing selected"}
          description="Pass selected + onSelectedChange to own the selection."
          code={`const [selected, setSelected] = useState<string | null>("tree.tsx");

<Tree
  items={items}
  defaultExpanded={["src", "components"]}
  selected={selected}
  onSelectedChange={setSelected}
  aria-label="Project files"
/>`}
        >
          <div style={panel}>
            <Tree
              items={FILES}
              defaultExpanded={["src", "components"]}
              selected={selected}
              onSelectedChange={setSelected}
              aria-label="Controlled selection"
            />
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>4. Controlled expansion</h2>
        <CodeExample
          title={`expanded: [${expanded.map((e) => `"${e}"`).join(", ")}]`}
          description="Pass expanded + onExpandedChange to own which nodes are open."
          code={`const [expanded, setExpanded] = useState<string[]>(["src"]);

<Tree
  items={items}
  expanded={expanded}
  onExpandedChange={setExpanded}
  defaultSelected="index.ts"
  aria-label="Project files"
/>`}
        >
          <div style={panel}>
            <Tree
              items={FILES}
              expanded={expanded}
              onExpandedChange={setExpanded}
              defaultSelected="index.ts"
              aria-label="Controlled expansion"
            />
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>5. Disabled nodes</h2>
        <CodeExample
          title="disabled: true — not selectable, still reachable by keyboard"
          description="A disabled row gets aria-disabled and ignores clicks. Keyboard focus still lands on it, which is what the ARIA pattern asks for."
          code={`const items: TreeNode[] = [
  {
    id: "reports",
    label: "Reports",
    icon: "folder",
    children: [
      { id: "q3", label: "Q3 — embargoed", icon: "lock", disabled: true },
    ],
  },
  { id: "archive", label: "Archive — no access", icon: "lock", disabled: true },
];`}
        >
          <div style={panel}>
            <Tree items={DISABLED} defaultExpanded={["reports"]} aria-label="Reports" />
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>6. Deep nesting</h2>
        <CodeExample
          title="Indent is computed per level — depth is unbounded"
          description="Each row carries aria-level / aria-posinset / aria-setsize, so the flat DOM still reads correctly to assistive tech."
          code={`<Tree
  items={deepItems}
  defaultExpanded={["l1", "l2", "l3", "l4", "l5"]}
  aria-label="Deep tree"
/>`}
        >
          <div style={panel}>
            <Tree
              items={DEEP}
              defaultExpanded={["l1", "l2", "l3", "l4", "l5"]}
              aria-label="Deep tree"
            />
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>7. Keyboard navigation</h2>
        <CodeExample
          title="Tab into the tree, then drive it from the keyboard"
          description="↓/↑ move over visible rows · → expands, then descends · ← collapses, then ascends · Home/End jump to the ends · Enter/Space select."
          code={`// No configuration — the ARIA tree pattern is built in.
<Tree items={items} defaultExpanded={["src"]} aria-label="Project files" />

// ArrowDown  next visible row (may be a nephew several levels up)
// ArrowUp    previous visible row
// ArrowRight closed -> open; already open -> first child
// ArrowLeft  open -> close; already closed -> parent
// Home/End   first / last visible row
// Enter, Spc select`}
        >
          <div style={panel}>
            <Tree items={ICON_FILES} defaultExpanded={["src", "components"]} aria-label="Keyboard demo" />
          </div>
        </CodeExample>
      </section>
    </div>
  );
};

export default NewTreeDemo;
