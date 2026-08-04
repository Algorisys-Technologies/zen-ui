import { createSignal, For } from "solid-js";
import {
  SortableList,
  SortableListItem,
  SortableListHandle,
} from "./sortable-list/sortable-list";
import { Badge } from "./badge/badge";
import { DemoPage, DemoSection } from "./demo-helpers";

const CHAPTERS: Record<string, string> = {
  "ch-1": "The gate at first light",
  "ch-2": "What the weighbridge knew",
  "ch-3": "A challan in three copies",
  "ch-4": "Rotterdam, in the rain",
  "ch-5": "Everything reconciles",
};

const NewSortableListDemo = () => {
  const [order, setOrder] = createSignal(Object.keys(CHAPTERS));
  const [tags, setTags] = createSignal(["draft", "review", "final"]);
  const [whole, setWhole] = createSignal(["alpha", "beta", "gamma"]);
  const [last, setLast] = createSignal("nothing yet");

  return (
    <DemoPage
      title="SortableList"
      description={
        <>
          A list whose order the user can change, by dragging or entirely by
          keyboard. The drag machinery was already in the library driving
          DataTable columns and Pivot fields — this exposes it, so an app that
          wants reorderable chapters stops rebuilding it.
        </>
      }
    >
      <DemoSection
        title="1. Drag by the handle"
        codeTitle="`items` is always controlled"
        codeDescription="You pass the ordered ids and you get the new order back. There is deliberately no uncontrolled mode: a sortable list holding its own order is one that silently disagrees with the array you rendered from, and the bug shows up as a row snapping back a second after the drop. One source of truth, and it is yours."
        code={`const [ids, setIds] = createSignal(["ch-1", "ch-2", "ch-3"]);

<SortableList items={ids()} onReorder={setIds}>
  <For each={ids()}>{(id) => (
    <SortableListItem id={id}>
      <SortableListHandle />
      <span>{titles[id]}</span>
    </SortableListItem>
  )}</For>
</SortableList>`}
      >
        <SortableList items={order()} onReorder={setOrder} class="zen-max-w-md">
          <For each={order()}>
            {(id, i) => (
              <SortableListItem id={id}>
                <SortableListHandle />
                <span class="zen-w-6 zen-shrink-0 zen-text-xs zen-tabular-nums zen-text-zen-muted-fg">
                  {i() + 1}
                </span>
                <span class="zen-min-w-0 zen-flex-1 zen-truncate zen-text-sm">{CHAPTERS[id]}</span>
              </SortableListItem>
            )}
          </For>
        </SortableList>
      </DemoSection>

      <DemoSection
        title="2. Entirely by keyboard"
        codeTitle="Tab, Space, arrows, Escape"
        codeDescription="Tab to a handle, Space or Enter to pick up, arrows to move, Space to drop, Escape to put it back exactly where it started. This layer is not the drag library's — solid-dnd ships no keyboard handling at all, so it comes from core and every binding shares it. That also means an arrow with nothing picked up, and an Escape with nothing picked up, are NOT claimed: a sortable list inside a dialog that swallows Escape is a dialog that stops closing."
        code={`Tab              focus a handle
Space / Enter    pick up, and again to drop
Arrow            move one position
Home / End       move to first / last
Escape           cancel, restoring the original order`}
      >
        <div class="zen-flex zen-flex-col zen-gap-2">
          <p class="zen-m-0 zen-text-sm zen-text-zen-muted-fg">
            last change <code class="zen-text-zen-foreground">{last()}</code>
          </p>
          <SortableList
            items={tags()}
            onReorder={(next) => {
              setTags(next);
              setLast(next.join(" → "));
            }}
            class="zen-max-w-md"
          >
            <For each={tags()}>
              {(id) => (
                <SortableListItem id={id}>
                  <SortableListHandle label={`Reorder ${id}`} />
                  <Badge variant="soft" color="neutral">
                    {id}
                  </Badge>
                </SortableListItem>
              )}
            </For>
          </SortableList>
        </div>
      </DemoSection>

      <DemoSection
        title="3. Horizontal"
        codeTitle="`orientation` picks the axis and the arrow keys"
        codeDescription="A horizontal list claims left and right and ignores up and down, so a page that scrolls vertically keeps its own keys."
        code={`<SortableList items={ids()} onReorder={setIds} orientation="horizontal">`}
      >
        <SortableList items={tags()} onReorder={setTags} orientation="horizontal">
          <For each={tags()}>
            {(id) => (
              <SortableListItem id={id}>
                <SortableListHandle label={`Reorder ${id}`} />
                <span class="zen-text-sm">{id}</span>
              </SortableListItem>
            )}
          </For>
        </SortableList>
      </DemoSection>

      <DemoSection
        title="4. Dragging the whole row"
        codeTitle="`handle={false}`, and why it is not the default"
        codeDescription="Whole-item dragging is the wrong default for a component library. Real rows hold buttons, links and text a user wants to select, and making the row a drag target breaks all three. handle={false} is there for rows that are genuinely just a label — and then the row itself takes the keyboard, so it is focusable."
        code={`<SortableList items={ids()} onReorder={setIds} handle={false}>
  <For each={ids()}>{(id) => (
    <SortableListItem id={id}>{id}</SortableListItem>
  )}</For>
</SortableList>`}
      >
        <SortableList items={whole()} onReorder={setWhole} handle={false} class="zen-max-w-md">
          <For each={whole()}>
            {(id) => <SortableListItem id={id}><span class="zen-text-sm">{id}</span></SortableListItem>}
          </For>
        </SortableList>
      </DemoSection>

      <DemoSection
        title="5. Announcements"
        codeTitle="A drag nobody announces is invisible"
        codeDescription="Every pick-up, move, drop and cancel goes to a polite live region inside the root. English defaults ship so the common case needs no configuration, and `announcements` replaces any of them for a localised app. Positions are 1-based because they are spoken to a person."
        code={`<SortableList
  items={ids()}
  onReorder={setIds}
  announcements={{
    onPickUp: (id, i, total) => \`\${titles[id]} opgepakt, \${i + 1} van \${total}.\`,
    onDrop:   (id, i)        => \`Neergezet op positie \${i + 1}.\`,
  }}
/>`}
      >
        <p class="zen-m-0 zen-text-sm zen-text-zen-muted-fg">
          Pick an item up with the keyboard in section 2 and a screen reader will
          say "Picked up item 1 of 3." The region is visually hidden; it is not a
          thing to look at here.
        </p>
      </DemoSection>

      <DemoSection
        title="6. Disabled"
        codeTitle="Handles stop responding, the order stays"
        codeDescription="The handles disable rather than disappear, so the list does not reflow into a different shape the moment it is locked."
        code={`<SortableList items={ids()} onReorder={setIds} disabled>`}
      >
        <SortableList items={whole()} onReorder={setWhole} disabled class="zen-max-w-md">
          <For each={whole()}>
            {(id) => (
              <SortableListItem id={id}>
                <SortableListHandle />
                <span class="zen-text-sm">{id}</span>
              </SortableListItem>
            )}
          </For>
        </SortableList>
      </DemoSection>
    </DemoPage>
  );
};

export default NewSortableListDemo;
