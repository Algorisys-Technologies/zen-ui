import { useState } from "react";
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
import { CodeExample } from "./demo-helpers";

const row: React.CSSProperties = { display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" };

const NewButtonFamilyDemo: React.FC = () => {
  const [bold, setBold] = useState(true);
  const [view, setView] = useState("list");
  const [lastAction, setLastAction] = useState("—");

  return (
    <div className="demo-page">
      <h1>Button family</h1>
      <p className="lede">
        Three button forms built on the existing <code>Button</code>, so{" "}
        <code>variant</code> / <code>color</code> / <code>size</code> stay
        consistent: <code>ToggleButton</code> (a button with a pressed state),{" "}
        <code>SegmentedButton</code> (mutually exclusive choice as one joined
        control) and <code>SplitButton</code> (a default action plus a dropdown
        of related ones).
      </p>

      <section className="demo-section">
        <h2>1. ToggleButton — uncontrolled</h2>
        <CodeExample
          title="defaultPressed seeds it; the button owns the state"
          description="Renders aria-pressed, so it announces as a toggle."
          code={`<ToggleButton defaultPressed>Bold</ToggleButton>
<ToggleButton>Italic</ToggleButton>`}
        >
          <div style={row}>
            <ToggleButton defaultPressed>Bold</ToggleButton>
            <ToggleButton>Italic</ToggleButton>
            <ToggleButton>Underline</ToggleButton>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>2. ToggleButton — controlled</h2>
        <CodeExample
          title={`pressed: ${bold}`}
          description="Pass pressed + onPressedChange to own the state."
          code={`const [bold, setBold] = useState(true);

<ToggleButton pressed={bold} onPressedChange={setBold}>
  Bold
</ToggleButton>`}
        >
          <div style={row}>
            <ToggleButton pressed={bold} onPressedChange={setBold}>
              Bold
            </ToggleButton>
            <span style={{ fontSize: "0.875rem", color: "var(--zen-color-muted-fg)" }}>
              pressed = {String(bold)}
            </span>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>3. ToggleButton — variants, colors, sizes</h2>
        <CodeExample
          title="Every Button prop still works — it is a Button"
          code={`<ToggleButton variant="soft" color="success" defaultPressed>Soft</ToggleButton>
<ToggleButton variant="ghost">Ghost</ToggleButton>
<ToggleButton size="xs">xs</ToggleButton>
<ToggleButton shape="square" aria-label="Star">
  <Icon name="star" size={16} />
</ToggleButton>`}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
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
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>4. SegmentedButton — uncontrolled</h2>
        <CodeExample
          title="defaultValue picks the initial segment"
          description="The group is a radiogroup and each item a radio, so it needs an aria-label."
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
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>5. SegmentedButton — controlled</h2>
        <CodeExample
          title={`value: "${view}"`}
          description="Pass value + onValueChange to own the selection."
          code={`const [view, setView] = useState("list");

<SegmentedButton value={view} onValueChange={setView} aria-label="View">
  <SegmentedButtonItem value="list">List</SegmentedButtonItem>
  <SegmentedButtonItem value="grid">Grid</SegmentedButtonItem>
</SegmentedButton>`}
        >
          <div style={row}>
            <SegmentedButton value={view} onValueChange={setView} aria-label="View">
              <SegmentedButtonItem value="list">List</SegmentedButtonItem>
              <SegmentedButtonItem value="grid">Grid</SegmentedButtonItem>
              <SegmentedButtonItem value="map">Map</SegmentedButtonItem>
            </SegmentedButton>
            <span style={{ fontSize: "0.875rem", color: "var(--zen-color-muted-fg)" }}>
              value = {view}
            </span>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>6. SegmentedButton — sizes and icons</h2>
        <CodeExample
          title="size on the group cascades to every item"
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
          <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-start" }}>
            {(["xs", "sm", "md", "lg"] as const).map((s) => (
              <SegmentedButton key={s} defaultValue="a" size={s} aria-label={`Size ${s}`}>
                <SegmentedButtonItem value="a">{s}</SegmentedButtonItem>
                <SegmentedButtonItem value="b">Segments</SegmentedButtonItem>
                <SegmentedButtonItem value="c">Here</SegmentedButtonItem>
              </SegmentedButton>
            ))}
            <SegmentedButton defaultValue="asc" aria-label="Sort direction">
              <SegmentedButtonItem value="asc">
                <Icon name="sort-asc" size={14} /> Asc
              </SegmentedButtonItem>
              <SegmentedButtonItem value="desc">
                <Icon name="sort-desc" size={14} /> Desc
              </SegmentedButtonItem>
            </SegmentedButton>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>7. SplitButton — default action plus a menu</h2>
        <CodeExample
          title={`last action: ${lastAction}`}
          description="Two real buttons, not one with a nested trigger — a <button> inside a <button> is invalid HTML."
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
            <span style={{ fontSize: "0.875rem", color: "var(--zen-color-muted-fg)" }}>
              last action = {lastAction}
            </span>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>8. SplitButton — variants, colors, sizes</h2>
        <CodeExample
          title="Both halves take the same Button styling"
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
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>9. SplitButton — menuLabel, menuAlign, disabled</h2>
        <CodeExample
          title="menuLabel names the arrow half; menuAlign places the panel"
          description="disabled disables both halves."
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
            <SplitButton
              disabled
              menu={<DropdownMenuItem>Unreachable</DropdownMenuItem>}
            >
              Disabled
            </SplitButton>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>10. In context — a toolbar</h2>
        <CodeExample
          title="All three together"
          code={`<ToggleButton size="sm" shape="square" aria-label="Bold"><Icon name="edit" /></ToggleButton>
<SegmentedButton defaultValue="list" aria-label="View">…</SegmentedButton>
<SplitButton size="sm" menu={items}>Save</SplitButton>`}
        >
          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              alignItems: "center",
              width: "100%",
              padding: "0.625rem 0.75rem",
              border: "1px solid var(--zen-color-border)",
              borderRadius: "var(--zen-radius-md)",
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
            <div style={{ marginLeft: "auto" }}>
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
        </CodeExample>
      </section>
    </div>
  );
};

export default NewButtonFamilyDemo;
