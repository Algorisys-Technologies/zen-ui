import { SortableList, type SortableItemSpec } from "./sortable-list/sortable-list";
import { Badge } from "./badge/badge";
import { DemoPage } from "./demo-helpers";

const CHAPTERS: Record<string, string> = {
  "ch-1": "The gate at first light",
  "ch-2": "What the weighbridge knew",
  "ch-3": "A challan in three copies",
  "ch-4": "Rotterdam, in the rain",
  "ch-5": "Everything reconciles",
};

/** A numbered row, so a reorder is visible without reading the titles. */
const chapterRow = (id: string, index: number): HTMLElement => {
  const row = document.createElement("span");
  row.style.display = "flex";
  row.style.alignItems = "center";
  row.style.gap = "8px";
  row.style.minWidth = "0";

  const n = document.createElement("span");
  n.style.width = "24px";
  n.style.flexShrink = "0";
  n.style.fontSize = "12px";
  n.style.color = "var(--zen-color-muted-fg)";
  n.textContent = String(index + 1);

  const title = document.createElement("span");
  title.style.fontSize = "14px";
  title.textContent = CHAPTERS[id];

  row.append(n, title);
  return row;
};

export default function SortableListDemo(): HTMLElement {
  return DemoPage({
    title: "SortableList",
    description:
      "A list whose order the user can change, by dragging or entirely by keyboard. The reorder logic was already in the library driving DataTable columns and Pivot fields — this exposes it, so an app that wants reorderable chapters stops rebuilding it.",
    sections: [
      {
        title: "1. Drag by the handle",
        codeTitle: "`items` is always controlled",
        codeDescription:
          "You pass the ordered rows and you get the new order of ids back. There is deliberately no uncontrolled mode: a sortable list holding its own order is one that silently disagrees with the array you rendered from, and the bug shows up as a row snapping back a second after the drop.",
        code: `let order = ["ch-1", "ch-2", "ch-3"];

const list = SortableList({
  items: order.map((id) => ({ id, content: titles[id] })),
  onReorder: (ids) => { order = ids; list.update({ items: rows() }); },
});`,
        render: () => {
          let order = Object.keys(CHAPTERS);
          const rows = (): SortableItemSpec[] =>
            order.map((id, i) => ({ id, content: chapterRow(id, i) }));

          const list = SortableList({
            items: rows(),
            class: "zen-max-w-md",
            onReorder: (ids) => {
              order = ids;
              list.update({ items: rows() });
            },
          });
          return list.el;
        },
      },
      {
        title: "2. Entirely by keyboard",
        codeTitle: "Tab, Space, arrows, Escape",
        codeDescription:
          "Tab to a handle, Space or Enter to pick up, arrows to move, Space to drop, Escape to put it back exactly where it started. This layer is not a drag library's — it comes from core and every binding shares it, because solid-dnd ships no keyboard handling and this binding has no drag library at all. An arrow or an Escape with NOTHING picked up is not claimed, so a sortable list inside a dialog does not stop the dialog closing.",
        code: `Tab              focus a handle
Space / Enter    pick up, and again to drop
Arrow            move one position
Home / End       move to first / last
Escape           cancel, restoring the original order`,
        render: () => {
          const wrap = document.createElement("div");
          wrap.style.display = "flex";
          wrap.style.flexDirection = "column";
          wrap.style.gap = "8px";

          const last = document.createElement("p");
          last.style.margin = "0";
          last.style.fontSize = "13px";
          last.style.color = "var(--zen-color-muted-fg)";
          last.textContent = "last change: nothing yet";

          let tags = ["draft", "review", "final"];
          const rows = (): SortableItemSpec[] =>
            tags.map((id) => ({
              id,
              handleLabel: `Reorder ${id}`,
              content: Badge({ variant: "soft", color: "neutral", children: id }).el,
            }));

          const list = SortableList({
            items: rows(),
            class: "zen-max-w-md",
            onReorder: (ids) => {
              tags = ids;
              last.textContent = `last change: ${ids.join(" → ")}`;
              list.update({ items: rows() });
            },
          });

          wrap.append(last, list.el);
          return wrap;
        },
      },
      {
        title: "3. Horizontal",
        codeTitle: "`orientation` picks the axis and the arrow keys",
        codeDescription:
          "A horizontal list claims left and right and ignores up and down, so a page that scrolls vertically keeps its own keys.",
        code: `SortableList({ items, onReorder, orientation: "horizontal" }).el`,
        render: () => {
          let tags = ["draft", "review", "final"];
          const rows = (): SortableItemSpec[] =>
            tags.map((id) => {
              const label = document.createElement("span");
              label.style.fontSize = "14px";
              label.textContent = id;
              return { id, handleLabel: `Reorder ${id}`, content: label };
            });

          const list = SortableList({
            items: rows(),
            orientation: "horizontal",
            onReorder: (ids) => {
              tags = ids;
              list.update({ items: rows() });
            },
          });
          return list.el;
        },
      },
      {
        title: "4. Dragging the whole row",
        codeTitle: "`handle: false`, and why it is not the default",
        codeDescription:
          "Whole-row dragging is the wrong default for a component library. Real rows hold buttons, links and text a user wants to select, and making the row a drag target breaks all three. handle: false is there for rows that are genuinely just a label — and then the row itself takes the keyboard, so it is focusable.",
        code: `SortableList({ items, onReorder, handle: false }).el`,
        render: () => {
          let whole = ["alpha", "beta", "gamma"];
          const rows = (): SortableItemSpec[] =>
            whole.map((id) => {
              const label = document.createElement("span");
              label.style.fontSize = "14px";
              label.textContent = id;
              return { id, content: label };
            });

          const list = SortableList({
            items: rows(),
            handle: false,
            class: "zen-max-w-md",
            onReorder: (ids) => {
              whole = ids;
              list.update({ items: rows() });
            },
          });
          return list.el;
        },
      },
      {
        title: "5. Announcements",
        codeTitle: "A drag nobody announces is invisible",
        codeDescription:
          "Every pick-up, move, drop and cancel goes to a polite live region inside the root. English defaults ship so the common case needs no configuration, and `announcements` replaces any of them for a localised app. Positions are 1-based because they are spoken to a person.",
        code: `SortableList({
  items, onReorder,
  announcements: {
    onPickUp: (id, i, total) => \`\${titles[id]} picked up, \${i + 1} of \${total}.\`,
    onDrop:   (id, i)        => \`Dropped at position \${i + 1}.\`,
  },
}).el`,
        render: () => {
          const p = document.createElement("p");
          p.style.margin = "0";
          p.style.fontSize = "14px";
          p.style.color = "var(--zen-color-muted-fg)";
          p.textContent =
            'Pick an item up with the keyboard in section 2 and a screen reader says "Picked up item 1 of 3." The region is visually hidden.';
          return p;
        },
      },
      {
        title: "6. Disabled",
        codeTitle: "Handles stop responding, the order stays",
        codeDescription:
          "The handles disable rather than disappear, so the list does not reflow into a different shape the moment it is locked.",
        code: `SortableList({ items, onReorder, disabled: true }).el`,
        render: () => {
          const rows: SortableItemSpec[] = ["alpha", "beta", "gamma"].map((id) => {
            const label = document.createElement("span");
            label.style.fontSize = "14px";
            label.textContent = id;
            return { id, content: label };
          });
          return SortableList({ items: rows, disabled: true, class: "zen-max-w-md", onReorder: () => {} }).el;
        },
      },
    ],
  });
}
