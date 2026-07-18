import { useState } from "react";
import { Button } from "./button/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip/tooltip";
import { CodeExample } from "./demo-helpers";

/**
 * Demonstrates the Radix-backed Tooltip. The whole page is wrapped in a
 * single TooltipProvider so consumers see the typical app-wide setup.
 */
const NewTooltipDemo: React.FC = () => {
  const [controlledOpen, setControlledOpen] = useState(false);

  return (
    <TooltipProvider delayDuration={150}>
      <div className="demo-page">
        <h1>Tooltip</h1>
        <p className="lede">
          Compound API. Positioning, collision detection, dismissal, hover/focus
          triggers, and a11y (<code>aria-describedby</code>) come from{" "}
          <code>@radix-ui/react-tooltip</code>. Theming flows through{" "}
          <code>--zen-*</code> CSS variables.
        </p>

        <section className="demo-section">
          <h2>1. Basic tooltip</h2>
          <CodeExample
            title="Hover, focus, or touch a trigger to open"
            description={`Wrap your trigger in <TooltipTrigger asChild>. Hover/focus behavior is the Radix default.`}
            code={`<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button>Hover me</Button>
    </TooltipTrigger>
    <TooltipContent>This is a basic tooltip</TooltipContent>
  </Tooltip>
</TooltipProvider>`}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Button>Hover me</Button>
              </TooltipTrigger>
              <TooltipContent>This is a basic tooltip</TooltipContent>
            </Tooltip>
          </CodeExample>
        </section>

        <section className="demo-section">
          <h2>2. On links and text</h2>
          <CodeExample
            title="Any focusable element can be a trigger"
            description="Buttons rendered via asChild, plain anchors, or even non-interactive elements (the trigger gets keyboard focus automatically)."
            code={`<Tooltip>
  <TooltipTrigger asChild>
    <Button variant="link" color="success">Hover me</Button>
  </TooltipTrigger>
  <TooltipContent>Tooltip on a link-styled button</TooltipContent>
</Tooltip>

<Tooltip>
  <TooltipTrigger asChild>
    <a href="#help" style={{ color: "var(--zen-color-primary)", textDecoration: "underline" }}>
      Help link
    </a>
  </TooltipTrigger>
  <TooltipContent>Plain anchor as the trigger</TooltipContent>
</Tooltip>`}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="link" color="success">
                  Hover me
                </Button>
              </TooltipTrigger>
              <TooltipContent>Tooltip on a link-styled button</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <a
                  href="#help"
                  style={{ color: "var(--zen-color-primary)", textDecoration: "underline" }}
                >
                  Help link
                </a>
              </TooltipTrigger>
              <TooltipContent>Plain anchor as the trigger</TooltipContent>
            </Tooltip>
          </CodeExample>
        </section>

        <section className="demo-section">
          <h2>3. With arrow</h2>
          <CodeExample
            title={`<TooltipContent arrow>`}
            description="Our TooltipContent wraps Radix's Arrow primitive; the arrow color tracks the tooltip background via fill-zen-neutral."
            code={`<Tooltip>
  <TooltipTrigger asChild>
    <Button>Hover me</Button>
  </TooltipTrigger>
  <TooltipContent arrow>Tooltip with arrow indicator</TooltipContent>
</Tooltip>`}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Button>Hover me</Button>
              </TooltipTrigger>
              <TooltipContent arrow>Tooltip with arrow indicator</TooltipContent>
            </Tooltip>
          </CodeExample>
        </section>

        <section className="demo-section">
          <h2>4. Placement (side)</h2>
          <CodeExample
            title={`side="top" · "right" · "bottom" · "left"`}
            description="Radix automatically re-positions to avoid viewport overflow (collision detection). Add `sideOffset` to control distance from the trigger."
            code={`<TooltipContent side="top">Appears above</TooltipContent>
<TooltipContent side="right">Appears to the right</TooltipContent>
<TooltipContent side="bottom">Appears below</TooltipContent>
<TooltipContent side="left">Appears to the left</TooltipContent>`}
            previewStyle={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "1rem",
              padding: "2.5rem 1.25rem",
              justifyItems: "center",
            }}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline">Top</Button>
              </TooltipTrigger>
              <TooltipContent side="top">Appears above</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline">Right</Button>
              </TooltipTrigger>
              <TooltipContent side="right">Appears to the right</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline">Bottom</Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Appears below</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline">Left</Button>
              </TooltipTrigger>
              <TooltipContent side="left">Appears to the left</TooltipContent>
            </Tooltip>
          </CodeExample>
        </section>

        <section className="demo-section">
          <h2>5. Controlled open state</h2>
          <CodeExample
            title="Controlled open via open + onOpenChange"
            description="Useful when an external action (form submit, hover on another element) needs to toggle the tooltip."
            code={`const [open, setOpen] = useState(false);

<Tooltip open={open} onOpenChange={setOpen}>
  <TooltipTrigger asChild>
    <Button>{open ? "Close" : "Open"} tooltip</Button>
  </TooltipTrigger>
  <TooltipContent>Controlled by parent state</TooltipContent>
</Tooltip>

<Button variant="outline" onClick={() => setOpen((o) => !o)}>
  Toggle from outside
</Button>`}
          >
            <Tooltip open={controlledOpen} onOpenChange={setControlledOpen}>
              <TooltipTrigger asChild>
                <Button>{controlledOpen ? "Close" : "Open"} tooltip</Button>
              </TooltipTrigger>
              <TooltipContent>Controlled by parent state</TooltipContent>
            </Tooltip>
            <Button
              variant="outline"
              onClick={() => setControlledOpen((o) => !o)}
            >
              Toggle from outside
            </Button>
          </CodeExample>
        </section>

        <section className="demo-section">
          <h2>6. Custom colors</h2>
          <CodeExample
            title="Override via className on TooltipContent"
            description="className wins over CVA defaults (tailwind-merge resolves conflicts). Use this for ad-hoc theming; for app-wide overrides, set the --zen-* CSS variables in your :root."
            code={`<TooltipContent className="bg-blue-600 text-white">
  Custom background color
</TooltipContent>

<TooltipContent className="bg-pink-500 text-white" arrow>
  Pink tooltip with arrow
</TooltipContent>`}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline">Blue</Button>
              </TooltipTrigger>
              <TooltipContent className="zen-bg-blue-600 zen-text-white">
                Custom background color
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline">Pink</Button>
              </TooltipTrigger>
              <TooltipContent className="zen-bg-pink-500 zen-text-white" arrow>
                Pink tooltip with arrow
              </TooltipContent>
            </Tooltip>
          </CodeExample>
        </section>

        <section className="demo-section">
          <h2>7. Custom width</h2>
          <CodeExample
            title="max-w-* / min-w-* / w-* utility classes"
            description="Tooltip content has a default max-width of xs (~12.5rem). Override with className."
            code={`<TooltipContent className="max-w-md">
  This tooltip can grow up to roughly 17.5rem wide before wrapping. Great
  for medium-length help text or short explanations that need to breathe.
</TooltipContent>

<TooltipContent className="min-w-[200px]">
  Min-width forces a baseline tooltip size even when content is short.
</TooltipContent>`}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline">Wider</Button>
              </TooltipTrigger>
              <TooltipContent className="zen-max-w-md">
                This tooltip can grow up to roughly 17.5rem wide before wrapping.
                Great for medium-length help text or short explanations that need
                to breathe.
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline">Min-width</Button>
              </TooltipTrigger>
              <TooltipContent className="zen-min-w-[200px]">
                Min-width forces a baseline tooltip size.
              </TooltipContent>
            </Tooltip>
          </CodeExample>
        </section>

        <section className="demo-section">
          <h2>8. Delays</h2>
          <CodeExample
            title="delayDuration on Provider, skipDelayDuration for consecutive triggers"
            description="In Radix, delays are configured on TooltipProvider, not per-tooltip. Per-tooltip overrides are supported via the same prop on <Tooltip>."
            code={`{/* App-wide default: 150ms delay before opening */}
<TooltipProvider delayDuration={150}>
  {children}
</TooltipProvider>

{/* Override for one tooltip — opens after 700ms */}
<Tooltip delayDuration={700}>
  <TooltipTrigger asChild>
    <Button variant="outline">Slow tooltip (700ms)</Button>
  </TooltipTrigger>
  <TooltipContent>I take longer to appear</TooltipContent>
</Tooltip>

{/* No delay */}
<Tooltip delayDuration={0}>
  <TooltipTrigger asChild>
    <Button variant="outline">Instant tooltip</Button>
  </TooltipTrigger>
  <TooltipContent>I appear immediately</TooltipContent>
</Tooltip>`}
          >
            <Tooltip delayDuration={700}>
              <TooltipTrigger asChild>
                <Button variant="outline">Slow tooltip (700ms)</Button>
              </TooltipTrigger>
              <TooltipContent>I take longer to appear</TooltipContent>
            </Tooltip>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button variant="outline">Instant tooltip</Button>
              </TooltipTrigger>
              <TooltipContent>I appear immediately</TooltipContent>
            </Tooltip>
          </CodeExample>
        </section>

        <section className="demo-section">
          <h2>9. Disabled trigger</h2>
          <CodeExample
            title="Workaround for tooltips on disabled buttons"
            description={`Disabled <button> elements don't fire mouse events, so Radix can't show a tooltip on them. Wrap the disabled button in a <span tabIndex={0}> that owns the trigger. shadcn uses the same pattern.`}
            code={`<Tooltip>
  <TooltipTrigger asChild>
    <span tabIndex={0} aria-disabled="true" style={{ cursor: "not-allowed", display: "inline-block" }}>
      <Button disabled style={{ pointerEvents: "none" }}>Disabled action</Button>
    </span>
  </TooltipTrigger>
  <TooltipContent>You need permission to do this</TooltipContent>
</Tooltip>`}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  tabIndex={0}
                  aria-disabled="true"
                  style={{ cursor: "not-allowed", display: "inline-block" }}
                >
                  <Button disabled style={{ pointerEvents: "none" }}>
                    Disabled action
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>You need permission to do this</TooltipContent>
            </Tooltip>
          </CodeExample>
        </section>

        <section className="demo-section">
          <h2>10. Composition: triple-nested Slot</h2>
          <CodeExample
            title="Tooltip → Button asChild → <a>"
            description="Three layers of composition. Slottable inside Button makes this work — proves the new Button is Radix-Trigger-compatible."
            code={`<Tooltip>
  <TooltipTrigger asChild>
    <Button asChild variant="link" iconLeft={<ExternalLinkIcon />}>
      <a href="https://algorisys.com" target="_blank" rel="noreferrer">
        Open algorisys.com
      </a>
    </Button>
  </TooltipTrigger>
  <TooltipContent>Opens in a new tab</TooltipContent>
</Tooltip>`}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  asChild
                  variant="link"
                  iconLeft={<ExternalLinkIcon />}
                >
                  <a href="https://algorisys.com" target="_blank" rel="noreferrer">
                    Open algorisys.com
                  </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Opens in a new tab</TooltipContent>
            </Tooltip>
          </CodeExample>
        </section>

      </div>
    </TooltipProvider>
  );
};

/* ----------------------------- small inline icons (no external deps) ------ */
const ExternalLinkIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

export default NewTooltipDemo;
