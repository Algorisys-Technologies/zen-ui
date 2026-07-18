import { createSignal } from "solid-js";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "./dropdown-menu/dropdown-menu";
import { Button } from "./button/button";
import { DemoPage, DemoSection } from "./demo-helpers";

const NewDropdownMenuDemo = () => {
  const [bookmarks, setBookmarks] = createSignal(true);
  const [view, setView] = createSignal("comfortable");

  return (
    <DemoPage
      title="DropdownMenu"
      description="Action menu built on Kobalte. Item, CheckboxItem, RadioItem variants."
    >
      <DemoSection
        title="Basic"
        codeTitle="Trigger + content + items"
        codeDescription="Kobalte supplies positioning, keyboard navigation, focus handling, dismissal, and ARIA."
        code={`<DropdownMenu>
  <DropdownMenuTrigger as={Button} variant="outline">Options</DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuLabel>My account</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem onSelect={() => alert("Profile")}>Profile</DropdownMenuItem>
    <DropdownMenuItem onSelect={() => alert("Settings")}>Settings</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem variant="destructive" onSelect={() => alert("Sign out")}>
      Sign out
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>`}
      >
        <DropdownMenu>
          <DropdownMenuTrigger as={Button} variant="outline">Options</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>My account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => alert("Profile")}>Profile</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => alert("Settings")}>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onSelect={() => alert("Sign out")}>
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </DemoSection>

      <DemoSection
        title="Checkbox + Radio items"
        codeTitle="Boolean toggles and mutually exclusive choices"
        codeDescription="Both take onChange (not onValueChange) — CheckboxItem receives the next boolean, RadioGroup the next value."
        code={`const [bookmarks, setBookmarks] = createSignal(true);
const [view, setView] = createSignal("comfortable");

<DropdownMenu>
  <DropdownMenuTrigger as={Button} variant="outline">View</DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuLabel>Preferences</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuCheckboxItem checked={bookmarks()} onChange={setBookmarks}>
      Show bookmarks
    </DropdownMenuCheckboxItem>
    <DropdownMenuSeparator />
    <DropdownMenuLabel>Density</DropdownMenuLabel>
    <DropdownMenuRadioGroup value={view()} onChange={setView}>
      <DropdownMenuRadioItem value="comfortable">Comfortable</DropdownMenuRadioItem>
      <DropdownMenuRadioItem value="compact">Compact</DropdownMenuRadioItem>
    </DropdownMenuRadioGroup>
  </DropdownMenuContent>
</DropdownMenu>`}
      >
        <DropdownMenu>
          <DropdownMenuTrigger as={Button} variant="outline">View</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Preferences</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem checked={bookmarks()} onChange={setBookmarks}>
              Show bookmarks
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Density</DropdownMenuLabel>
            <DropdownMenuRadioGroup value={view()} onChange={setView}>
              <DropdownMenuRadioItem value="comfortable">Comfortable</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="compact">Compact</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </DemoSection>
    </DemoPage>
  );
};

export default NewDropdownMenuDemo;
