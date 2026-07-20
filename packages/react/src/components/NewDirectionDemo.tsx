import { DirectionProvider } from "./direction/direction";
import { Carousel } from "./carousel/carousel";
import { Rating } from "./survey/rating";
import { Card, CardContent } from "./card/card";
import { CodeExample } from "./demo-helpers";

const SLIDE: React.CSSProperties = {
  display: "grid",
  placeItems: "center",
  minHeight: 96,
  borderRadius: 8,
};

/**
 * A panel that reads right-to-left, whatever the page around it does.
 *
 * `dir` on the element is what CSS and zen-ui's own components read;
 * DirectionProvider is what Radix reads. They have to agree, which is exactly
 * the point the demo is making.
 */
const RtlPanel = ({ children }: { children: React.ReactNode }) => (
  <div dir="rtl">
    <DirectionProvider dir="rtl">{children}</DirectionProvider>
  </div>
);

const Slides = () => (
  <Carousel label="Example carousel">
    {["١", "٢", "٣", "٤"].map((n) => (
      <div key={n} style={SLIDE} className="zen-bg-zen-muted zen-text-zen-foreground">
        <span className="zen-text-2xl">{n}</span>
      </div>
    ))}
  </Carousel>
);

const NewDirectionDemo: React.FC = () => (
  <div className="demo-page">
    <h1>DirectionProvider</h1>
    <p className="lede">
      CSS mirrors a right-to-left page on its own. What it cannot reach is the
      JavaScript that decides which side a submenu opens on, and what the Left
      and Right arrow keys <em>mean</em>. Radix keeps that in its own context and
      defaults to left-to-right whatever <code>dir</code> says — so without this,
      an RTL app looks right and behaves left.
    </p>

    <section className="demo-section">
      <h2>1. Render it once, near the root</h2>
      <CodeExample
        title="With no props it follows the document"
        description="It reads dir from <html> and keeps reading it, so a language switch at runtime works without a reload — apps flip direction when the user changes locale, and a value captured once on mount would go stale. Pass dir to state it outright, which is what a subtree in the other direction needs. It renders no element, so it can never affect your layout."
        code={`import { DirectionProvider } from "@algorisys/zen-ui-react";

<DirectionProvider>
  <App />
</DirectionProvider>

// or, for a subtree that disagrees with the page:
<div dir="rtl">
  <DirectionProvider dir="rtl">…</DirectionProvider>
</div>`}
      >
        <p className="zen-m-0 zen-text-sm zen-text-zen-muted-fg">
          The demo you are reading renders one at its root, which is why the
          panels below behave correctly when you drive them from the keyboard.
        </p>
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>2. The same components, both directions</h2>
      <CodeExample
        title="Next is to the left in RTL"
        description="Focus a carousel and press the arrow keys. On the left it advances with ArrowRight; on the right it advances with ArrowLeft, because that is what 'next' means when the page reads right-to-left. Same for the rating. Neither component asks you for a direction — they resolve it from where they sit in the page, so an RTL panel inside an LTR page is correct with no configuration."
        code={`// Nothing direction-specific in the markup:
<Carousel label="Example carousel">…</Carousel>
<Rating defaultValue={3} label="Example rating" />`}
      >
        <div className="zen-grid zen-grid-cols-1 zen-gap-4 md:zen-grid-cols-2">
          <Card>
            <CardContent className="zen-p-4">
              <p className="zen-mb-2 zen-mt-0 zen-text-xs zen-font-medium zen-text-zen-muted-fg">
                ltr — ArrowRight advances
              </p>
              <Slides />
              <div className="zen-mt-3">
                <Rating defaultValue={3} label="Example rating" />
              </div>
            </CardContent>
          </Card>

          <RtlPanel>
            <Card>
              <CardContent className="zen-p-4">
                <p className="zen-mb-2 zen-mt-0 zen-text-xs zen-font-medium zen-text-zen-muted-fg">
                  rtl — ArrowLeft advances
                </p>
                <Slides />
                <div className="zen-mt-3">
                  <Rating defaultValue={3} label="Example rating" />
                </div>
              </CardContent>
            </Card>
          </RtlPanel>
        </div>
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>3. What reads what</h2>
      <CodeExample
        title="Two mechanisms, because there are two problems"
        description="zen-ui's own components (Carousel, Rating, Tree, OTP, Likert, NPS, ColorPalette, the ObjectPage anchors) work direction out from the DOM, so they need no provider at all and cannot go stale. The primitives underneath — menus, tabs, sliders, select, combobox — keep direction in a JS context that CSS cannot reach, and that is the only thing DirectionProvider exists for. The TimePicker is the deliberate exception: clock notation is left-to-right in every locale, so its segments stay in order while the page mirrors."
        code={`// zen-ui's own components — no provider needed:
import { arrowStep } from "@algorisys/zen-ui-core";
const step = arrowStep(e.key, e.currentTarget); // -1 back, +1 forward, 0 not horizontal

// Radix-backed components — provider required:
<DirectionProvider>…</DirectionProvider>`}
      >
        <p className="zen-m-0 zen-text-sm zen-text-zen-muted-fg">
          If you only ever set <code>dir</code> on <code>&lt;html&gt;</code> and
          render the provider at the root, you never have to think about this
          split — it is here so the behaviour is explainable, not so you have to
          manage it.
        </p>
      </CodeExample>
    </section>
  </div>
);

export default NewDirectionDemo;
