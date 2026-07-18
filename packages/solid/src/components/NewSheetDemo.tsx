import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "./sheet/sheet";
import { Button } from "./button/button";
import { DemoPage, DemoSection } from "./demo-helpers";

const NewSheetDemo = () => (
  <DemoPage
    title="Sheet"
    description="Slide-in side panel built on Kobalte Dialog. Use for filters, edit forms, document review."
  >
    <DemoSection
      title="Right (default)"
      codeTitle="SheetTrigger / SheetClose are polymorphic via as"
      code={`<Sheet>
  <SheetTrigger as={Button} variant="outline">Open right sheet</SheetTrigger>
  <SheetContent>
    <SheetHeader>
      <SheetTitle>Filters</SheetTitle>
      <SheetDescription>Narrow your view.</SheetDescription>
    </SheetHeader>
    <p class="zen-text-sm zen-text-zen-muted-fg">Form controls would go here.</p>
    <SheetFooter>
      <SheetClose as={Button} variant="outline">Cancel</SheetClose>
      <Button>Apply</Button>
    </SheetFooter>
  </SheetContent>
</Sheet>`}
    >
      <Sheet>
        <SheetTrigger as={Button} variant="outline">Open right sheet</SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
            <SheetDescription>Narrow your view.</SheetDescription>
          </SheetHeader>
          <p class="zen-text-sm zen-text-zen-muted-fg">Form controls would go here.</p>
          <SheetFooter>
            <SheetClose as={Button} variant="outline">Cancel</SheetClose>
            <Button>Apply</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </DemoSection>

    <DemoSection
      title="Other sides"
      codeTitle={'side="right" (default) | "left" | "top" | "bottom"'}
      code={`<Sheet>
  <SheetTrigger as={Button} variant="outline">Left</SheetTrigger>
  <SheetContent side="left">
    <SheetHeader>
      <SheetTitle>Navigation</SheetTitle>
    </SheetHeader>
  </SheetContent>
</Sheet>`}
    >
      <Sheet>
        <SheetTrigger as={Button} variant="outline">Left</SheetTrigger>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
        </SheetContent>
      </Sheet>
      <Sheet>
        <SheetTrigger as={Button} variant="outline">Top</SheetTrigger>
        <SheetContent side="top">
          <SheetHeader>
            <SheetTitle>Notice</SheetTitle>
          </SheetHeader>
        </SheetContent>
      </Sheet>
      <Sheet>
        <SheetTrigger as={Button} variant="outline">Bottom</SheetTrigger>
        <SheetContent side="bottom">
          <SheetHeader>
            <SheetTitle>Mobile sheet</SheetTitle>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </DemoSection>
  </DemoPage>
);

export default NewSheetDemo;
