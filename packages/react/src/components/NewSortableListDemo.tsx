import { useState } from "react";
import { SortableList, SortableListItem, SortableListHandle } from "./sortable-list/sortable-list";
import { Badge } from "./badge/badge";
import { CodeExample } from "./demo-helpers";

const CHAPTERS: Record<string, string> = {
  "ch-1": "The gate at first light",
  "ch-2": "What the weighbridge knew",
  "ch-3": "A challan in three copies",
  "ch-4": "Rotterdam, in the rain",
  "ch-5": "Everything reconciles",
};

const NewSortableListDemo: React.FC = () => {
  const [order, setOrder] = useState(Object.keys(CHAPTERS));
  const [tags, setTags] = useState(["draft", "review", "final"]);
  const [whole, setWhole] = useState(["alpha", "beta", "gamma"]);
  const [last, setLast] = useState("nothing yet");

  return (
    <div className="demo-page">
      <h1>SortableList</h1>
      <p className="lede">
        A list whose order the user can change, by dragging or entirely by
        keyboard. The drag machinery was already in the library driving DataTable
        columns and Pivot fields — this exposes it, so an app that wants
        reorderable chapters stops rebuilding it.
      </p>

      <section className="demo-section">
        <h2>1. Drag by the handle</h2>
        <CodeExample
          title="`items` is always controlled"
          description="You pass the ordered ids and you get the new order back. There is deliberately no uncontrolled mode: a sortable list holding its own order is one that silently disagrees with the array you rendered from, and the bug shows up as a row snapping back a second after the drop."
          code={`const [ids, setIds] = useState(["ch-1", "ch-2", "ch-3"]);

<SortableList items={ids} onReorder={setIds}>
  {ids.map((id) => (
    <SortableListItem key={id} id={id}>
      <SortableListHandle />
      <span>{titles[id]}</span>
    </SortableListItem>
  ))}
</SortableList>`}
        >
          <SortableList items={order} onReorder={setOrder} className="zen-max-w-md">
            {order.map((id, i) => (
              <SortableListItem key={id} id={id}>
                <SortableListHandle />
                <span style={{ width: 24, flexShrink: 0, fontSize: 12, color: "var(--zen-color-muted-fg)" }}>
                  {i + 1}
                </span>
                <span style={{ minWidth: 0, flex: 1, fontSize: 14 }}>{CHAPTERS[id]}</span>
              </SortableListItem>
            ))}
          </SortableList>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>2. Entirely by keyboard</h2>
        <CodeExample
          title="Tab, Space, arrows, Escape"
          description="Tab to a handle, Space or Enter to pick up, arrows to move, Space to drop, Escape to put it back exactly where it started. This layer is not dnd-kit's — it comes from core and every binding shares it, because solid-dnd ships no keyboard handling and vanilla has no drag library, so three of four need one written by hand anyway. Taking dnd-kit's KeyboardSensor here would give React different cancel semantics from the other three. An arrow or an Escape with nothing picked up is NOT claimed, so a sortable list inside a dialog does not stop the dialog closing."
          code={`Tab              focus a handle
Space / Enter    pick up, and again to drop
Arrow            move one position
Home / End       move to first / last
Escape           cancel, restoring the original order`}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <p style={{ margin: 0, fontSize: 13, color: "var(--zen-color-muted-fg)" }}>
              last change <code>{last}</code>
            </p>
            <SortableList
              items={tags}
              onReorder={(next) => {
                setTags(next);
                setLast(next.join(" → "));
              }}
              className="zen-max-w-md"
            >
              {tags.map((id) => (
                <SortableListItem key={id} id={id}>
                  <SortableListHandle label={`Reorder ${id}`} />
                  <Badge variant="soft" color="neutral">{id}</Badge>
                </SortableListItem>
              ))}
            </SortableList>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>3. Horizontal</h2>
        <CodeExample
          title="`orientation` picks the axis and the arrow keys"
          description="A horizontal list claims left and right and ignores up and down, so a page that scrolls vertically keeps its own keys."
          code={`<SortableList items={ids} onReorder={setIds} orientation="horizontal">`}
        >
          <SortableList items={tags} onReorder={setTags} orientation="horizontal">
            {tags.map((id) => (
              <SortableListItem key={id} id={id}>
                <SortableListHandle label={`Reorder ${id}`} />
                <span style={{ fontSize: 14 }}>{id}</span>
              </SortableListItem>
            ))}
          </SortableList>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>4. Dragging the whole row</h2>
        <CodeExample
          title="`handle={false}`, and why it is not the default"
          description="Whole-item dragging is the wrong default for a component library. Real rows hold buttons, links and text a user wants to select, and making the row a drag target breaks all three. handle={false} is there for rows that are genuinely just a label — and then the row itself takes the keyboard, so it is focusable."
          code={`<SortableList items={ids} onReorder={setIds} handle={false}>
  {ids.map((id) => <SortableListItem key={id} id={id}>{id}</SortableListItem>)}
</SortableList>`}
        >
          <SortableList items={whole} onReorder={setWhole} handle={false} className="zen-max-w-md">
            {whole.map((id) => (
              <SortableListItem key={id} id={id}>
                <span style={{ fontSize: 14 }}>{id}</span>
              </SortableListItem>
            ))}
          </SortableList>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>5. Announcements</h2>
        <CodeExample
          title="A drag nobody announces is invisible"
          description="Every pick-up, move, drop and cancel goes to a polite live region inside the root. English defaults ship so the common case needs no configuration, and `announcements` replaces any of them for a localised app. Positions are 1-based because they are spoken to a person."
          code={`<SortableList
  items={ids}
  onReorder={setIds}
  announcements={{
    onPickUp: (id, i, total) => \`\${titles[id]} picked up, \${i + 1} of \${total}.\`,
    onDrop:   (id, i)        => \`Dropped at position \${i + 1}.\`,
  }}
/>`}
        >
          <p style={{ margin: 0, fontSize: 14, color: "var(--zen-color-muted-fg)" }}>
            Pick an item up with the keyboard in section 2 and a screen reader says
            "Picked up item 1 of 3." The region is visually hidden.
          </p>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>6. Disabled</h2>
        <CodeExample
          title="Handles stop responding, the order stays"
          description="The handles disable rather than disappear, so the list does not reflow into a different shape the moment it is locked."
          code={`<SortableList items={ids} onReorder={setIds} disabled>`}
        >
          <SortableList items={whole} onReorder={setWhole} disabled className="zen-max-w-md">
            {whole.map((id) => (
              <SortableListItem key={id} id={id}>
                <SortableListHandle />
                <span style={{ fontSize: 14 }}>{id}</span>
              </SortableListItem>
            ))}
          </SortableList>
        </CodeExample>
      </section>
    </div>
  );
};

export default NewSortableListDemo;
