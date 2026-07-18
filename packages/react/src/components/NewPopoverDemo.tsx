import { Popover, PopoverTrigger, PopoverContent, PopoverAnchor } from "./popover/popover";
import { Button } from "./button/button";
import { Input } from "./form/input/input";
import { CodeExample } from "./demo-helpers";

/**
 * Popover demo. The React binding exported Popover from the start but never
 * demoed it — the Solid side did. Mirrors that page and adds the anchor, which
 * only the React binding exposes.
 */
const NewPopoverDemo: React.FC = () => (
  <div className="demo-page">
    <h1>Popover</h1>
    <p className="lede">
      Anchored panel on Radix Popover. Radix supplies the positioning, the
      collision handling, focus management and dismissal — click outside or
      press Escape. <code>PopoverTrigger</code> takes <code>asChild</code> so
      the trigger is whatever you already have.
    </p>

    <section className="demo-section">
      <h2>1. Basic</h2>
      <CodeExample
        title="asChild — render the trigger as a Button"
        description="Without asChild the trigger renders its own button and you get a button inside a button. Radix's Slot merges the trigger's behaviour onto the child instead."
        code={`<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline" color="neutral">Open popover</Button>
  </PopoverTrigger>
  <PopoverContent>
    <h4>Profile</h4>
    <p>Sign in to see your account details.</p>
    <Button size="sm">Sign in</Button>
  </PopoverContent>
</Popover>`}
      >
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" color="neutral">
              Open popover
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <div className="zen-flex zen-flex-col zen-gap-2">
              <h4 className="zen-m-0 zen-text-sm zen-font-semibold">Profile</h4>
              <p className="zen-m-0 zen-text-sm zen-text-zen-muted-fg">
                Sign in to see your account details.
              </p>
              <Button size="sm">Sign in</Button>
            </div>
          </PopoverContent>
        </Popover>
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>2. Side and alignment</h2>
      <CodeExample
        title="side + align, with collision handling for free"
        description="Radix flips the panel when it would leave the viewport, so a preferred side is a preference and not a promise. That is the point of the primitive."
        code={`<PopoverContent side="right" align="start">…</PopoverContent>`}
      >
        <div className="zen-flex zen-flex-wrap zen-gap-2">
          {(["top", "right", "bottom", "left"] as const).map((side) => (
            <Popover key={side}>
              <PopoverTrigger asChild>
                <Button variant="outline" color="neutral" size="sm">
                  {side}
                </Button>
              </PopoverTrigger>
              <PopoverContent side={side} className="zen-w-auto">
                <p className="zen-m-0 zen-text-sm">side="{side}"</p>
              </PopoverContent>
            </Popover>
          ))}
        </div>
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>3. A separate anchor</h2>
      <CodeExample
        title="PopoverAnchor — position against something other than the trigger"
        description="The panel normally hangs off whatever opened it. PopoverAnchor decouples the two, so a button can open a panel that positions against the field it belongs to. Solid's Kobalte binding has no equivalent, so this section is React-only."
        code={`<Popover>
  <PopoverAnchor asChild>
    <Input placeholder="the panel anchors here" />
  </PopoverAnchor>
  <PopoverTrigger asChild>
    <Button>…but this opens it</Button>
  </PopoverTrigger>
  <PopoverContent align="start">…</PopoverContent>
</Popover>`}
      >
        <Popover>
          <div className="zen-flex zen-items-center zen-gap-2">
            <PopoverAnchor asChild>
              <Input placeholder="the panel anchors here" style={{ maxWidth: 240 }} />
            </PopoverAnchor>
            <PopoverTrigger asChild>
              <Button variant="outline" color="neutral" size="sm">
                …but this opens it
              </Button>
            </PopoverTrigger>
          </div>
          <PopoverContent align="start">
            <p className="zen-m-0 zen-text-sm">
              Anchored to the input, opened by the button.
            </p>
          </PopoverContent>
        </Popover>
      </CodeExample>
    </section>
  </div>
);

export default NewPopoverDemo;
