import { useState } from "react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "./sheet/sheet";
import { Button } from "./button/button";
import { Input } from "./form/input/input";
import { Checkbox } from "./form/checkbox/checkbox";
import { CodeExample } from "./demo-helpers";

const SIDES = ["right", "left", "top", "bottom"] as const;

const NewSheetDemo: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="demo-page">
      <h1>Sheet / Drawer</h1>
      <p className="lede">
        Slide-in side panel built on Radix Dialog. Use when a Dialog is
        too modal — long-form filter panels, edit screens that want the
        underlying list visible, KYC document review, onboarding tour
        content, mobile bottom-sheets. The overlay still dims the rest
        of the page so the user knows the sheet is the focus.
      </p>

      <section className="demo-section">
        <h2>1. Default (right side)</h2>
        <CodeExample
          title='<Sheet> / <SheetTrigger asChild> / <SheetContent side="right">'
          code={`<Sheet>
  <SheetTrigger asChild><Button>Open filters</Button></SheetTrigger>
  <SheetContent side="right">
    <SheetHeader>
      <SheetTitle>Filters</SheetTitle>
      <SheetDescription>Narrow the dashboard.</SheetDescription>
    </SheetHeader>
    {/* …filter controls… */}
    <SheetFooter>
      <SheetClose asChild><Button variant="outline">Cancel</Button></SheetClose>
      <Button>Apply</Button>
    </SheetFooter>
  </SheetContent>
</Sheet>`}
        >
          <Sheet>
            <SheetTrigger asChild>
              <Button>Open filters</Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
                <SheetDescription>
                  Narrow the dashboard down to just the rows you care about.
                </SheetDescription>
              </SheetHeader>
              <div className="zen-flex zen-flex-col zen-gap-3 zen-mt-2">
                <label className="zen-text-sm">
                  <span className="zen-block zen-text-xs zen-text-zen-muted-fg zen-mb-1">
                    Search
                  </span>
                  <Input placeholder="Type to filter…" />
                </label>
                <label className="zen-flex zen-items-center zen-gap-2 zen-text-sm">
                  <Checkbox />
                  <span>Active</span>
                </label>
                <label className="zen-flex zen-items-center zen-gap-2 zen-text-sm">
                  <Checkbox />
                  <span>Suspended</span>
                </label>
                <label className="zen-flex zen-items-center zen-gap-2 zen-text-sm">
                  <Checkbox />
                  <span>Invited</span>
                </label>
              </div>
              <SheetFooter>
                <SheetClose asChild>
                  <Button variant="outline" color="neutral">
                    Cancel
                  </Button>
                </SheetClose>
                <Button>Apply</Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>2. Every side</h2>
        <CodeExample
          title='side="right" | "left" | "top" | "bottom"'
          description="Right is the desktop default; bottom is the mobile-friendly bottom-sheet pattern. Each animates from / to its edge with a matching easing curve."
          code={`<SheetContent side="bottom">…</SheetContent>`}
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {SIDES.map((side) => (
              <Sheet key={side}>
                <SheetTrigger asChild>
                  <Button variant="outline" color="neutral">
                    side="{side}"
                  </Button>
                </SheetTrigger>
                <SheetContent side={side}>
                  <SheetHeader>
                    <SheetTitle>Sliding from {side}</SheetTitle>
                    <SheetDescription>
                      This panel slid in from the {side} edge.
                    </SheetDescription>
                  </SheetHeader>
                  <p className="zen-text-sm zen-py-4 zen-m-0">
                    Click outside, press Esc, or use the ✕ to close.
                  </p>
                  <SheetFooter>
                    <SheetClose asChild>
                      <Button>Got it</Button>
                    </SheetClose>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            ))}
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>3. Controlled open state</h2>
        <CodeExample
          title="open + onOpenChange let you drive Sheet visibility externally"
          description={`Useful when something other than the trigger (a keyboard shortcut, a router event, a parent state-machine) needs to open the sheet.`}
          code={`const [open, setOpen] = useState(false);
<Sheet open={open} onOpenChange={setOpen}>
  <SheetContent>…</SheetContent>
</Sheet>`}
        >
          <div style={{ display: "flex", gap: 8 }}>
            <Button onClick={() => setOpen(true)}>Open (controlled)</Button>
            <Button
              variant="outline"
              color="neutral"
              disabled={!open}
              onClick={() => setOpen(false)}
            >
              Close
            </Button>
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Controlled sheet</SheetTitle>
                  <SheetDescription>
                    The parent component owns the open state.
                  </SheetDescription>
                </SheetHeader>
                <p className="zen-text-sm zen-py-4 zen-m-0">
                  This sheet was opened by a button outside its own
                  trigger via <code>onOpenChange</code>.
                </p>
              </SheetContent>
            </Sheet>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>4. Without the close ✕</h2>
        <CodeExample
          title="showCloseButton={false} hides the built-in ✕"
          description="Useful for sheets where the only dismissal is via an explicit action button in the footer."
          code={`<SheetContent showCloseButton={false}>…</SheetContent>`}
        >
          <Sheet>
            <SheetTrigger asChild>
              <Button color="error">Confirm destructive</Button>
            </SheetTrigger>
            <SheetContent showCloseButton={false}>
              <SheetHeader>
                <SheetTitle>Delete this workspace?</SheetTitle>
                <SheetDescription>
                  This can't be undone. All data will be permanently removed.
                </SheetDescription>
              </SheetHeader>
              <SheetFooter>
                <SheetClose asChild>
                  <Button variant="outline" color="neutral">
                    Cancel
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button color="error">Yes, delete</Button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </CodeExample>
      </section>
    </div>
  );
};

export default NewSheetDemo;
