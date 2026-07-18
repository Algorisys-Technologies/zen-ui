import { type JSX, For, createSignal } from "solid-js";
import {
  ToggleButton,
  SegmentedButton,
  SegmentedButtonItem,
  SplitButton,
} from "./button/button-family";
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "./dropdown-menu/dropdown-menu";
import { Icon } from "./icon/icon";
import { DemoPage, DemoSection } from "./demo-helpers";

const row: JSX.CSSProperties = {
  display: "flex",
  gap: "0.5rem",
  "flex-wrap": "wrap",
  "align-items": "center",
};

const muted: JSX.CSSProperties = {
  "font-size": "0.875rem",
  color: "var(--zen-color-muted-fg)",
};

const NewButtonFamilyDemo = () => {
  const [bold, setBold] = createSignal(true);
  const [view, setView] = createSignal("list");
  const [lastAction, setLastAction] = createSignal("—");

  return (
    <DemoPage
      title="Button family"
      description="Three button forms built on the existing Button, so variant / color / size stay consistent: ToggleButton (a button with a pressed state), SegmentedButton (mutually exclusive choice as one joined control) and SplitButton (a default action plus a dropdown of related ones)."
    >
      <DemoSection
        title="1. ToggleButton — uncontrolled"
        codeTitle="defaultPressed seeds it; the button owns the state"
        codeDescription="Renders aria-pressed, so it announces as a toggle."
        code={`<ToggleButton defaultPressed>Bold</ToggleButton>
<ToggleButton>Italic</ToggleButton>`}
      >
        <div style={row}>
          <ToggleButton defaultPressed>Bold</ToggleButton>
          <ToggleButton>Italic</ToggleButton>
          <ToggleButton>Underline</ToggleButton>
        </div>
      </DemoSection>

      <DemoSection
        title="2. ToggleButton — controlled"
        codeTitle={`pressed: ${bold()}`}
        codeDescription="Pass pressed + onPressedChange to own the state."
        code={`const [bold, setBold] = createSignal(true);

<ToggleButton pressed={bold()} onPressedChange={setBold}>
  Bold
</ToggleButton>`}
      >
        <div style={row}>
          <ToggleButton pressed={bold()} onPressedChange={setBold}>
            Bold
          </ToggleButton>
          <span style={muted}>pressed = {String(bold())}</span>
        </div>
      </DemoSection>

      <DemoSection
        title="3. ToggleButton — variants, colors, sizes"
        codeTitle="Every Button prop still works — it is a Button"
        code={`<ToggleButton variant="soft" color="success" defaultPressed>Soft</ToggleButton>
<ToggleButton variant="ghost">Ghost</ToggleButton>
<ToggleButton size="xs">xs</ToggleButton>
<ToggleButton shape="square" aria-label="Star">
  <Icon name="star" size={16} />
</ToggleButton>`}
      >
        <div style={{ display: "flex", "flex-direction": "column", gap: "0.5rem" }}>
          <div style={row}>
            <ToggleButton variant="outline" defaultPressed>
              Outline
            </ToggleButton>
            <ToggleButton variant="soft" color="success" defaultPressed>
              Soft
            </ToggleButton>
            <ToggleButton variant="ghost">Ghost</ToggleButton>
          </div>
          <div style={row}>
            <ToggleButton size="xs">xs</ToggleButton>
            <ToggleButton size="sm">sm</ToggleButton>
            <ToggleButton size="md" defaultPressed>
              md
            </ToggleButton>
            <ToggleButton size="lg">lg</ToggleButton>
          </div>
          <div style={row}>
            <ToggleButton shape="square" aria-label="Favourite" defaultPressed>
              <Icon name="star" size={16} />
            </ToggleButton>
            <ToggleButton shape="square" aria-label="Flag">
              <Icon name="flag" size={16} />
            </ToggleButton>
            <ToggleButton disabled>Disabled</ToggleButton>
            <ToggleButton disabled defaultPressed>
              Disabled + pressed
            </ToggleButton>
          </div>
        </div>
      </DemoSection>

      <DemoSection
        title="4. SegmentedButton — uncontrolled"
        codeTitle="defaultValue picks the initial segment"
        codeDescription="The group is a radiogroup and each item a radio, so it needs an aria-label."
        code={`<SegmentedButton defaultValue="day" aria-label="Range">
  <SegmentedButtonItem value="day">Day</SegmentedButtonItem>
  <SegmentedButtonItem value="week">Week</SegmentedButtonItem>
  <SegmentedButtonItem value="month">Month</SegmentedButtonItem>
</SegmentedButton>`}
      >
        <SegmentedButton defaultValue="day" aria-label="Range">
          <SegmentedButtonItem value="day">Day</SegmentedButtonItem>
          <SegmentedButtonItem value="week">Week</SegmentedButtonItem>
          <SegmentedButtonItem value="month">Month</SegmentedButtonItem>
        </SegmentedButton>
      </DemoSection>

      <DemoSection
        title="5. SegmentedButton — controlled"
        codeTitle={`value: "${view()}"`}
        codeDescription="Pass value + onValueChange to own the selection."
        code={`const [view, setView] = createSignal("list");

<SegmentedButton value={view()} onValueChange={setView} aria-label="View">
  <SegmentedButtonItem value="list">List</SegmentedButtonItem>
  <SegmentedButtonItem value="grid">Grid</SegmentedButtonItem>
</SegmentedButton>`}
      >
        <div style={row}>
          <SegmentedButton value={view()} onValueChange={setView} aria-label="View">
            <SegmentedButtonItem value="list">List</SegmentedButtonItem>
            <SegmentedButtonItem value="grid">Grid</SegmentedButtonItem>
            <SegmentedButtonItem value="map">Map</SegmentedButtonItem>
          </SegmentedButton>
          <span style={muted}>value = {view()}</span>
        </div>
      </DemoSection>

      <DemoSection
        title="6. SegmentedButton — sizes and icons"
        codeTitle="size on the group cascades to every item"
        code={`<SegmentedButton defaultValue="a" size="lg" aria-label="Size">
  <SegmentedButtonItem value="a">Large</SegmentedButtonItem>
  <SegmentedButtonItem value="b">Segments</SegmentedButtonItem>
</SegmentedButton>

<SegmentedButton defaultValue="asc" aria-label="Sort">
  <SegmentedButtonItem value="asc">
    <Icon name="sort-asc" size={14} /> Asc
  </SegmentedButtonItem>
</SegmentedButton>`}
      >
        <div
          style={{
            display: "flex",
            "flex-direction": "column",
            gap: "0.5rem",
            "align-items": "flex-start",
          }}
        >
          <For each={["xs", "sm", "md", "lg"] as const}>
            {(s) => (
              <SegmentedButton defaultValue="a" size={s} aria-label={`Size ${s}`}>
                <SegmentedButtonItem value="a">{s}</SegmentedButtonItem>
                <SegmentedButtonItem value="b">Segments</SegmentedButtonItem>
                <SegmentedButtonItem value="c">Here</SegmentedButtonItem>
              </SegmentedButton>
            )}
          </For>
          <SegmentedButton defaultValue="asc" aria-label="Sort direction">
            <SegmentedButtonItem value="asc">
              <Icon name="sort-asc" size={14} /> Asc
            </SegmentedButtonItem>
            <SegmentedButtonItem value="desc">
              <Icon name="sort-desc" size={14} /> Desc
            </SegmentedButtonItem>
          </SegmentedButton>
        </div>
      </DemoSection>

      <DemoSection
        title="7. SplitButton — default action plus a menu"
        codeTitle={`last action: ${lastAction()}`}
        codeDescription="Two real buttons, not one with a nested trigger — a <button> inside a <button> is invalid HTML."
        code={`<SplitButton
  onClick={() => save()}
  menu={
    <>
      <DropdownMenuItem onSelect={() => saveAs()}>Save as…</DropdownMenuItem>
      <DropdownMenuItem onSelect={() => saveAll()}>Save all</DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem variant="destructive" onSelect={() => discard()}>
        Discard
      </DropdownMenuItem>
    </>
  }
>
  Save
</SplitButton>`}
      >
        <div style={row}>
          <SplitButton
            onClick={() => setLastAction("Save")}
            menu={
              <>
                <DropdownMenuLabel>Save options</DropdownMenuLabel>
                <DropdownMenuItem onSelect={() => setLastAction("Save as…")}>
                  Save as…
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setLastAction("Save all")}>
                  Save all
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={() => setLastAction("Discard")}
                >
                  Discard
                </DropdownMenuItem>
              </>
            }
          >
            Save
          </SplitButton>
          <span style={muted}>last action = {lastAction()}</span>
        </div>
      </DemoSection>

      <DemoSection
        title="8. SplitButton — variants, colors, sizes"
        codeTitle="Both halves take the same Button styling"
        code={`<SplitButton variant="outline" color="neutral" menu={items}>Export</SplitButton>
<SplitButton variant="soft" color="success" size="sm" menu={items}>Approve</SplitButton>`}
      >
        <div style={row}>
          <SplitButton menu={<DropdownMenuItem>Solid / primary</DropdownMenuItem>}>
            Solid
          </SplitButton>
          <SplitButton
            variant="outline"
            color="neutral"
            menu={<DropdownMenuItem>Outline / neutral</DropdownMenuItem>}
          >
            Export
          </SplitButton>
          <SplitButton
            variant="soft"
            color="success"
            size="sm"
            menu={<DropdownMenuItem>Soft / success</DropdownMenuItem>}
          >
            Approve
          </SplitButton>
          <SplitButton
            color="error"
            size="lg"
            menu={<DropdownMenuItem>Solid / error</DropdownMenuItem>}
          >
            Delete
          </SplitButton>
        </div>
      </DemoSection>

      <DemoSection
        title="9. SplitButton — menuLabel, menuAlign, disabled"
        codeTitle="menuLabel names the arrow half; menuAlign places the panel"
        codeDescription="disabled disables both halves."
        code={`<SplitButton
  menuLabel="More export options"
  menuAlign="start"
  menu={<DropdownMenuItem>Export as CSV</DropdownMenuItem>}
>
  Export
</SplitButton>

<SplitButton disabled menu={<DropdownMenuItem>Unreachable</DropdownMenuItem>}>
  Disabled
</SplitButton>`}
      >
        <div style={row}>
          <SplitButton
            menuLabel="More export options"
            menuAlign="start"
            menu={
              <>
                <DropdownMenuItem>Export as CSV</DropdownMenuItem>
                <DropdownMenuItem>Export as XLSX</DropdownMenuItem>
              </>
            }
          >
            Export (align start)
          </SplitButton>
          <SplitButton disabled menu={<DropdownMenuItem>Unreachable</DropdownMenuItem>}>
            Disabled
          </SplitButton>
        </div>
      </DemoSection>

      <DemoSection
        title="10. In context — a toolbar"
        codeTitle="All three together"
        code={`<ToggleButton size="sm" shape="square" aria-label="Bold"><Icon name="edit" /></ToggleButton>
<SegmentedButton defaultValue="list" aria-label="View">…</SegmentedButton>
<SplitButton size="sm" menu={items}>Save</SplitButton>`}
      >
        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            "flex-wrap": "wrap",
            "align-items": "center",
            width: "100%",
            padding: "0.625rem 0.75rem",
            border: "1px solid var(--zen-color-border)",
            "border-radius": "var(--zen-radius-md)",
          }}
        >
          <div style={row}>
            <ToggleButton size="sm" shape="square" aria-label="Filter">
              <Icon name="filter" size={14} />
            </ToggleButton>
            <ToggleButton size="sm" shape="square" aria-label="Favourites only" defaultPressed>
              <Icon name="star" size={14} />
            </ToggleButton>
          </div>
          <SegmentedButton defaultValue="list" aria-label="Toolbar view">
            <SegmentedButtonItem value="list">List</SegmentedButtonItem>
            <SegmentedButtonItem value="grid">Grid</SegmentedButtonItem>
          </SegmentedButton>
          <div style={{ "margin-left": "auto" }}>
            <SplitButton
              size="sm"
              menu={
                <>
                  <DropdownMenuItem>Save as…</DropdownMenuItem>
                  <DropdownMenuItem>Save all</DropdownMenuItem>
                </>
              }
            >
              Save
            </SplitButton>
          </div>
        </div>
      </DemoSection>
    </DemoPage>
  );
};

export default NewButtonFamilyDemo;
