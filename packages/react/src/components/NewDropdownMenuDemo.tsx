import { useState } from "react";
import { Button } from "./button/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./dropdown-menu/dropdown-menu";
import { CodeExample } from "./demo-helpers";

/**
 * NewDropdownMenuDemo — the Radix-backed action-menu primitive.
 *
 * This is intentionally NOT a form-input replacement. For form selection use
 * the Select primitive.
 */
const NewDropdownMenuDemo: React.FC = () => {
  const [showToolbar, setShowToolbar] = useState(true);
  const [showStatus, setShowStatus] = useState(false);
  const [position, setPosition] = useState("bottom");

  return (
    <div className="demo-page">
      <h1>DropdownMenu (new — Radix-backed action menu)</h1>
      <p className="lede">
        Compound API. Radix supplies positioning, collision detection, keyboard
        navigation (Arrow/Home/End/typeahead), focus trap, dismissal, and ARIA.
        Theming via <code>--zen-*</code> tokens. <strong>Note:</strong> this is
        an <em>action menu</em> (kebab / user / context menus). For form-field
        selection, use the upcoming <code>&lt;Select&gt;</code>.
      </p>

      <section className="demo-section">
        <h2>1. Basic menu</h2>
        <CodeExample
          title="Trigger + content + items"
          code={`<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline">Options</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem onSelect={() => alert("Profile")}>Profile</DropdownMenuItem>
    <DropdownMenuItem onSelect={() => alert("Settings")}>Settings</DropdownMenuItem>
    <DropdownMenuItem onSelect={() => alert("Sign out")}>Sign out</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>`}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Options</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => alert("Profile")}>
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => alert("Settings")}>
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => alert("Sign out")}>
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>2. With label, separator, and shortcut hints</h2>
        <CodeExample
          title="Typical user-menu shape"
          code={`<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="soft">My account</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuLabel>My account</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem>
      Profile <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
    </DropdownMenuItem>
    <DropdownMenuItem>
      Billing <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
    </DropdownMenuItem>
    <DropdownMenuItem>
      Settings <DropdownMenuShortcut>⌘,</DropdownMenuShortcut>
    </DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem variant="destructive">Sign out</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>`}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="soft">My account</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>My account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                Profile <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem>
                Billing <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem>
                Settings <DropdownMenuShortcut>⌘,</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive">Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>3. Checkbox items (multi-select toggles)</h2>
        <CodeExample
          title="Stateful boolean toggles inside a menu"
          code={`const [showToolbar, setShowToolbar] = useState(true);
const [showStatus, setShowStatus] = useState(false);

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline">View</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuLabel>Appearance</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuCheckboxItem checked={showToolbar} onCheckedChange={setShowToolbar}>
      Show toolbar
    </DropdownMenuCheckboxItem>
    <DropdownMenuCheckboxItem checked={showStatus} onCheckedChange={setShowStatus}>
      Show status bar
    </DropdownMenuCheckboxItem>
  </DropdownMenuContent>
</DropdownMenu>`}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">View</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Appearance</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={showToolbar}
                onCheckedChange={setShowToolbar}
              >
                Show toolbar
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={showStatus}
                onCheckedChange={setShowStatus}
              >
                Show status bar
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <span style={{ marginLeft: "1rem", fontSize: "0.8125rem", color: "var(--zen-color-muted-fg)" }}>
            toolbar: {String(showToolbar)} · status: {String(showStatus)}
          </span>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>4. Radio items (single-select inside a menu)</h2>
        <CodeExample
          title="Mutually exclusive choices via DropdownMenuRadioGroup"
          code={`const [position, setPosition] = useState("bottom");

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline">Panel position</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuLabel>Position</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuRadioGroup value={position} onValueChange={setPosition}>
      <DropdownMenuRadioItem value="top">Top</DropdownMenuRadioItem>
      <DropdownMenuRadioItem value="bottom">Bottom</DropdownMenuRadioItem>
      <DropdownMenuRadioItem value="right">Right</DropdownMenuRadioItem>
    </DropdownMenuRadioGroup>
  </DropdownMenuContent>
</DropdownMenu>`}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Panel position</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Position</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={position}
                onValueChange={setPosition}
              >
                <DropdownMenuRadioItem value="top">Top</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="bottom">Bottom</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="right">Right</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <span style={{ marginLeft: "1rem", fontSize: "0.8125rem", color: "var(--zen-color-muted-fg)" }}>
            position: {position}
          </span>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>5. Sub-menu</h2>
        <CodeExample
          title="Nested DropdownMenuSub for hierarchical actions"
          code={`<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline">File</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>New file</DropdownMenuItem>
    <DropdownMenuItem>Open</DropdownMenuItem>
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>Share</DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        <DropdownMenuItem>Email</DropdownMenuItem>
        <DropdownMenuItem>Slack</DropdownMenuItem>
        <DropdownMenuItem>Copy link</DropdownMenuItem>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
    <DropdownMenuSeparator />
    <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>`}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">File</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>New file</DropdownMenuItem>
              <DropdownMenuItem>Open</DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Share</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem>Email</DropdownMenuItem>
                  <DropdownMenuItem>Slack</DropdownMenuItem>
                  <DropdownMenuItem>Copy link</DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>6. Disabled items</h2>
        <CodeExample
          title="Per-item disabling with full keyboard awareness"
          description="Radix skips disabled items during keyboard traversal automatically."
          code={`<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline">Actions</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>Edit</DropdownMenuItem>
    <DropdownMenuItem disabled>Duplicate (no permission)</DropdownMenuItem>
    <DropdownMenuItem>Archive</DropdownMenuItem>
    <DropdownMenuItem disabled variant="destructive">Delete (read-only)</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>`}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Actions</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Edit</DropdownMenuItem>
              <DropdownMenuItem disabled>Duplicate (no permission)</DropdownMenuItem>
              <DropdownMenuItem>Archive</DropdownMenuItem>
              <DropdownMenuItem disabled variant="destructive">
                Delete (read-only)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>7. Side and alignment</h2>
        <CodeExample
          title={`side="top"|"right"|"bottom"|"left", align="start"|"center"|"end"`}
          description="Radix automatically re-positions on viewport collision."
          code={`<DropdownMenuContent side="top" align="start">...</DropdownMenuContent>
<DropdownMenuContent side="right" align="center">...</DropdownMenuContent>
<DropdownMenuContent side="bottom" align="end">...</DropdownMenuContent>`}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Top start</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start">
              <DropdownMenuItem>Item A</DropdownMenuItem>
              <DropdownMenuItem>Item B</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Right center</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="center">
              <DropdownMenuItem>Item A</DropdownMenuItem>
              <DropdownMenuItem>Item B</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Bottom end</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="bottom" align="end">
              <DropdownMenuItem>Item A</DropdownMenuItem>
              <DropdownMenuItem>Item B</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>8. Kebab menu (icon trigger)</h2>
        <CodeExample
          title="Common row-actions pattern"
          code={`<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" shape="circle" aria-label="More" iconLeft={<MoreIcon />} />
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuItem>Rename</DropdownMenuItem>
    <DropdownMenuItem>Move</DropdownMenuItem>
    <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>`}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                shape="circle"
                aria-label="More"
                iconLeft={<MoreIcon />}
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Rename</DropdownMenuItem>
              <DropdownMenuItem>Move</DropdownMenuItem>
              <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CodeExample>
      </section>
    </div>
  );
};

const MoreIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="5" cy="12" r="2" />
    <circle cx="12" cy="12" r="2" />
    <circle cx="19" cy="12" r="2" />
  </svg>
);

export default NewDropdownMenuDemo;
