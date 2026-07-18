import { Popover, PopoverTrigger, PopoverContent } from "./popover/popover";
import { Button } from "./button/button";
import { DemoPage, DemoSection } from "./demo-helpers";

const NewPopoverDemo = () => (
  <DemoPage title="Popover" description="Anchored panel built on Kobalte Popover.">
    <DemoSection
      title="Basic"
      codeTitle="PopoverTrigger is polymorphic via as — render it as a Button"
      code={`<Popover>
  <PopoverTrigger as={Button} variant="outline">Open popover</PopoverTrigger>
  <PopoverContent>
    <div class="zen-space-y-2">
      <h4 class="zen-font-semibold zen-text-sm zen-m-0">Profile</h4>
      <p class="zen-text-sm zen-text-zen-muted-fg zen-m-0">
        Sign in to see your account details.
      </p>
      <Button size="sm">Sign in</Button>
    </div>
  </PopoverContent>
</Popover>`}
    >
      <Popover>
        <PopoverTrigger as={Button} variant="outline">Open popover</PopoverTrigger>
        <PopoverContent>
          <div class="zen-space-y-2">
            <h4 class="zen-font-semibold zen-text-sm zen-m-0">Profile</h4>
            <p class="zen-text-sm zen-text-zen-muted-fg zen-m-0">
              Sign in to see your account details.
            </p>
            <Button size="sm">Sign in</Button>
          </div>
        </PopoverContent>
      </Popover>
    </DemoSection>
  </DemoPage>
);

export default NewPopoverDemo;
