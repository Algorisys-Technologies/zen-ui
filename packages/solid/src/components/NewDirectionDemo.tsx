import { For, type JSX } from "solid-js";
import { DirectionProvider } from "./direction/direction";
import { Carousel } from "./carousel/carousel";
import { Rating } from "./survey/rating";
import { Card, CardContent } from "./card/card";
import { DemoPage, DemoSection } from "./demo-helpers";

const SLIDE: JSX.CSSProperties = {
  display: "grid",
  "place-items": "center",
  "min-height": "96px",
  "border-radius": "8px",
};

/**
 * A panel that reads right-to-left, whatever the page around it does.
 *
 * `dir` on the element is what CSS and zen-ui's own components read;
 * DirectionProvider is what Kobalte reads. They have to agree, which is exactly
 * the point the demo is making.
 */
const RtlPanel = (props: { children: JSX.Element }) => (
  <div dir="rtl">
    <DirectionProvider dir="rtl">{props.children}</DirectionProvider>
  </div>
);

const SLIDE_LABELS = ["١", "٢", "٣", "٤"];

const Slides = () => (
  <Carousel label="Example carousel">
    <For each={SLIDE_LABELS}>
      {(n) => (
        <div style={SLIDE} class="zen-bg-zen-muted zen-text-zen-foreground">
          <span class="zen-text-2xl">{n}</span>
        </div>
      )}
    </For>
  </Carousel>
);

const NewDirectionDemo = () => (
  <DemoPage
    title="DirectionProvider"
    description={
      <>
        CSS mirrors a right-to-left page on its own. What it cannot reach is the
        JavaScript that decides which side a submenu opens on, and what the Left
        and Right arrow keys <em>mean</em>. Kobalte keeps that in its own context
        and nothing was providing it — so without this, an RTL app looks right
        and behaves left.
      </>
    }
  >
    <DemoSection
      title="1. Render it once, near the root"
      codeTitle="With no props it follows the document"
      codeDescription="It reads dir from <html> and keeps reading it, so a language switch at runtime works without a reload — apps flip direction when the user changes locale, and a value captured once on mount would go stale. Pass dir to state it outright, which is what a subtree in the other direction needs. It renders no element, so it can never affect your layout."
      code={`import { DirectionProvider } from "@algorisys/zen-ui-solid";

<DirectionProvider>
  <App />
</DirectionProvider>

// or, for a subtree that disagrees with the page:
<div dir="rtl">
  <DirectionProvider dir="rtl">…</DirectionProvider>
</div>`}
    >
      <p class="zen-m-0 zen-text-sm zen-text-zen-muted-fg">
        The demo you are reading renders one at its root, which is why the panels
        below behave correctly when you drive them from the keyboard.
      </p>
    </DemoSection>

    <DemoSection
      title="2. The same components, both directions"
      codeTitle="Next is to the left in RTL"
      codeDescription="Focus a carousel and press the arrow keys. On the left it advances with ArrowRight; on the right it advances with ArrowLeft, because that is what 'next' means when the page reads right-to-left. Same for the rating. Neither component asks you for a direction — they resolve it from where they sit in the page, so an RTL panel inside an LTR page is correct with no configuration."
      code={`// Nothing direction-specific in the markup:
<Carousel label="Example carousel">…</Carousel>
<Rating defaultValue={3} label="Example rating" />`}
    >
      <div class="zen-grid zen-grid-cols-1 zen-gap-4 md:zen-grid-cols-2">
        <Card>
          <CardContent class="zen-p-4">
            <p class="zen-mb-2 zen-mt-0 zen-text-xs zen-font-medium zen-text-zen-muted-fg">
              ltr — ArrowRight advances
            </p>
            <Slides />
            <div class="zen-mt-3">
              <Rating defaultValue={3} label="Example rating" />
            </div>
          </CardContent>
        </Card>

        <RtlPanel>
          <Card>
            <CardContent class="zen-p-4">
              <p class="zen-mb-2 zen-mt-0 zen-text-xs zen-font-medium zen-text-zen-muted-fg">
                rtl — ArrowLeft advances
              </p>
              <Slides />
              <div class="zen-mt-3">
                <Rating defaultValue={3} label="Example rating" />
              </div>
            </CardContent>
          </Card>
        </RtlPanel>
      </div>
    </DemoSection>

    <DemoSection
      title="3. locale — the one prop React does not have"
      codeTitle="Kobalte derives direction FROM a locale"
      codeDescription="Radix takes a direction outright. Kobalte has no such input: it takes a locale and works direction out from it, so on this binding the two are tied together and cannot be set independently. Handing it a locale purely to obtain a direction would also change its collator, date and number formatting — so the locale is resolved in the order that loses the least: an explicit locale prop first, then <html lang> if its direction already matches, and only then a representative locale. Pass locale if you care about formatting. This is a real divergence between the two libraries underneath, recorded rather than papered over."
      code={`// Solid only. React has no locale prop, because Radix does not need one.
<DirectionProvider dir="rtl" locale="ar-EG">
  <App />
</DirectionProvider>`}
    >
      <p class="zen-m-0 zen-text-sm zen-text-zen-muted-fg">
        Reaching the fallback means the page claims <code>dir="rtl"</code> while{" "}
        <code>&lt;html lang&gt;</code> says something left-to-right, which is
        usually a bug in the page rather than something to solve here.
      </p>
    </DemoSection>
  </DemoPage>
);

export default NewDirectionDemo;
