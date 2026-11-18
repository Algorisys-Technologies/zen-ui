import { DemoPage } from "./demo-helpers";

const CHAPTERS: Record<string, string> = {
  "ch-1": "The gate at first light",
  "ch-2": "What the weighbridge knew",
  "ch-3": "A challan in three copies",
  "ch-4": "Rotterdam, in the rain",
  "ch-5": "Everything reconciles",
};

function list(items: unknown[], attrs: Record<string, string> = {}, viaAttribute = false): HTMLElement {
  const el = document.createElement("zen-sortable-list");
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  if (viaAttribute) el.setAttribute("items", JSON.stringify(items));
  else (el as unknown as { items: unknown[] }).items = items;
  return el;
}

export default function SortableListDemo(): HTMLElement {
  return DemoPage({
    title: "SortableList",
    description:
      "A list whose order the user can change, by dragging or entirely by keyboard. The reorder logic was already in the library driving DataTable columns and Pivot fields — this exposes it, so an app that wants reorderable chapters stops rebuilding it.",
    sections: [
      {
        title: "1. Straight from markup",
        codeTitle: "`items` is json, and `zen-reorder` gives the new order",
        codeDescription:
          "The factory requires an onReorder — the list is always controlled, because one holding its own order silently disagrees with the array you rendered from. A custom element cannot require a property to exist before it connects, so the element defaults it to a no-op and always fires zen-reorder. A purely declarative list therefore works on a page with no script at all, and a caller who wants to persist the order listens for the event.",
        code: `<zen-sortable-list items='[
  { "id": "ch-1", "content": "The gate at first light" },
  { "id": "ch-2", "content": "What the weighbridge knew" }
]'></zen-sortable-list>

el.addEventListener("zen-reorder", (e) => save(e.detail));`,
        render: () => {
          const wrap = document.createElement("div");
          wrap.style.cssText = "display:flex;flex-direction:column;gap:8px";
          const said = document.createElement("p");
          said.style.cssText = "margin:0;font-size:13px;color:var(--zen-color-muted-fg)";
          said.textContent = "zen-reorder: nothing yet";

          let order = Object.keys(CHAPTERS);
          const rows = () => order.map((id) => ({ id, content: CHAPTERS[id] }));
          const el = list(rows(), { class: "zen-max-w-md" }, true);
          el.addEventListener("zen-reorder", (e) => {
            order = (e as CustomEvent<string[]>).detail;
            said.textContent = `zen-reorder: ${order.join(" → ")}`;
            el.setAttribute("items", JSON.stringify(rows()));
          });
          wrap.append(said, el);
          return wrap;
        },
      },
      {
        title: "2. Entirely by keyboard",
        codeTitle: "Tab, Space, arrows, Escape",
        codeDescription:
          "Tab to a handle, Space or Enter to pick up, arrows to move, Space to drop, Escape to put it back exactly where it started. This layer comes from core and every binding shares it, so the announcements and the cancel semantics are identical in all four. An arrow or an Escape with NOTHING picked up is not claimed, so a sortable list inside a dialog does not stop the dialog closing.",
        code: `Tab              focus a handle
Space / Enter    pick up, and again to drop
Arrow            move one position
Home / End       move to first / last
Escape           cancel, restoring the original order`,
        render: () => {
          let tags = ["draft", "review", "final"];
          const rows = () =>
            tags.map((id) => {
              const badge = document.createElement("zen-badge");
              badge.setAttribute("variant", "soft");
              badge.setAttribute("color", "neutral");
              badge.textContent = id;
              return { id, handleLabel: `Reorder ${id}`, content: badge };
            });
          const el = list(rows(), { class: "zen-max-w-md" });
          el.addEventListener("zen-reorder", (e) => {
            tags = (e as CustomEvent<string[]>).detail;
            (el as unknown as { items: unknown[] }).items = rows();
          });
          return el;
        },
      },
      {
        title: "3. Horizontal",
        codeTitle: "`orientation` picks the axis and the arrow keys",
        codeDescription:
          "A horizontal list claims left and right and ignores up and down, so a page that scrolls vertically keeps its own keys.",
        code: `<zen-sortable-list orientation="horizontal" items='[…]'></zen-sortable-list>`,
        render: () => {
          let tags = ["draft", "review", "final"];
          const el = list(tags.map((id) => ({ id, content: id })), { orientation: "horizontal" }, true);
          el.addEventListener("zen-reorder", (e) => {
            tags = (e as CustomEvent<string[]>).detail;
            el.setAttribute("items", JSON.stringify(tags.map((id) => ({ id, content: id }))));
          });
          return el;
        },
      },
      {
        title: "4. Dragging the whole row",
        codeTitle: "`handle=\"false\"` — a json attribute, because it defaults to TRUE",
        codeDescription:
          "Whole-row dragging is the wrong default for a component library: real rows hold buttons, links and text a user wants to select, and making the row a drag target breaks all three. It is json rather than a boolean attribute for a mechanical reason worth knowing — an ABSENT boolean attribute is passed to the factory as an explicit false, which is right for a default-false prop and silently inverts a default-true one.",
        code: `<zen-sortable-list handle="false" items='[…]'></zen-sortable-list>`,
        render: () => {
          let whole = ["alpha", "beta", "gamma"];
          const el = list(whole.map((id) => ({ id, content: id })), { handle: "false", class: "zen-max-w-md" }, true);
          el.addEventListener("zen-reorder", (e) => {
            whole = (e as CustomEvent<string[]>).detail;
            el.setAttribute("items", JSON.stringify(whole.map((id) => ({ id, content: id }))));
          });
          return el;
        },
      },
      {
        title: "5. Announcements",
        codeTitle: "A drag nobody announces is invisible",
        codeDescription:
          "Every pick-up, move, drop and cancel goes to a polite live region inside the root. English defaults ship so the common case needs no configuration; `announcements` replaces any of them for a localised app, and since its values are functions it is set as a property. Positions are 1-based because they are spoken to a person.",
        code: `el.announcements = {
  onPickUp: (id, i, total) => \`\${titles[id]} picked up, \${i + 1} of \${total}.\`,
  onDrop:   (id, i)        => \`Dropped at position \${i + 1}.\`,
};`,
        render: () => {
          const p = document.createElement("p");
          p.style.cssText = "margin:0;font-size:14px;color:var(--zen-color-muted-fg)";
          p.textContent =
            'Pick an item up with the keyboard in section 2 and a screen reader says "Picked up item 1 of 3." The region is visually hidden.';
          return p;
        },
      },
      {
        title: "6. Disabled",
        codeTitle: "Handles stop responding, the order stays",
        codeDescription:
          "The handles disable rather than disappear, so the list does not reflow into a different shape the moment it is locked. It defaults to false, so it is a plain boolean attribute.",
        code: `<zen-sortable-list disabled items='[…]'></zen-sortable-list>`,
        render: () =>
          list(
            ["alpha", "beta", "gamma"].map((id) => ({ id, content: id })),
            { disabled: "", class: "zen-max-w-md" },
            true,
          ),
      },
    ],
  });
}
