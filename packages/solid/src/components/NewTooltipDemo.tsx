import { Tooltip, TooltipTrigger, TooltipContent } from "./tooltip/tooltip";
import { Button } from "./button/button";
import { DemoPage, DemoSection } from "./demo-helpers";

const NewTooltipDemo = () => (
  <DemoPage
    title="Tooltip"
    description={
      <>
        Hover / focus hint built on Kobalte Tooltip. No{" "}
        <code>&lt;TooltipProvider&gt;</code> needed — Kobalte uses per-instance
        roots.
      </>
    }
  >
    <DemoSection
      title="Default"
      codeTitle="as={Button} renders the trigger as your own component"
      codeDescription={
        <>
          Kobalte's polymorphic <code>as</code> replaces Radix's asChild. No{" "}
          <code>&lt;TooltipProvider&gt;</code> wrapper is needed.
        </>
      }
      code={`<Tooltip>
  <TooltipTrigger as={Button} variant="outline">Hover me</TooltipTrigger>
  <TooltipContent>This is a tooltip.</TooltipContent>
</Tooltip>`}
    >
      <Tooltip>
        <TooltipTrigger as={Button} variant="outline">Hover me</TooltipTrigger>
        <TooltipContent>This is a tooltip.</TooltipContent>
      </Tooltip>
    </DemoSection>

    <DemoSection
      title="With arrow"
      codeTitle="<TooltipContent arrow>"
      code={`<Tooltip>
  <TooltipTrigger as={Button} variant="outline">Arrow tooltip</TooltipTrigger>
  <TooltipContent arrow>Pointed at the trigger.</TooltipContent>
</Tooltip>`}
    >
      <Tooltip>
        <TooltipTrigger as={Button} variant="outline">Arrow tooltip</TooltipTrigger>
        <TooltipContent arrow>Pointed at the trigger.</TooltipContent>
      </Tooltip>
    </DemoSection>

    <DemoSection
      title="With delay"
      codeTitle="openDelay is set per-tooltip"
      codeDescription="Radix configures delays on a shared TooltipProvider; Kobalte takes openDelay (and closeDelay) on each Tooltip root instead."
      code={`<Tooltip openDelay={700}>
  <TooltipTrigger as={Button} variant="outline">700 ms open delay</TooltipTrigger>
  <TooltipContent>Took a moment to show.</TooltipContent>
</Tooltip>`}
    >
      <Tooltip openDelay={700}>
        <TooltipTrigger as={Button} variant="outline">700 ms open delay</TooltipTrigger>
        <TooltipContent>Took a moment to show.</TooltipContent>
      </Tooltip>
    </DemoSection>
  </DemoPage>
);

export default NewTooltipDemo;
