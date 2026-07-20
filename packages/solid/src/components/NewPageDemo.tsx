import { For, type JSX } from "solid-js";
import { Page, Bar } from "./page/page";
import { Button } from "./button/button";
import { Badge } from "./badge/badge";
import { DemoPage, DemoSection } from "./demo-helpers";

/** A fixed-height box, because Page fills its parent and needs one to fill. */
const FRAME: JSX.CSSProperties = { height: "320px", "border-radius": "8px", overflow: "hidden" };

const LINES = Array.from({ length: 8 }, (_, i) => i + 1);

const Paragraphs = () => (
  <For each={LINES}>
    {(i) => (
      <p class="zen-mt-0 zen-text-sm zen-text-zen-muted-fg">
        Line {i}. Only this pane scrolls — the header and footer stay put, which
        is the whole reason to reach for <code>Page</code> instead of a plain div.
      </p>
    )}
  </For>
);

const NewPageDemo = () => (
  <DemoPage
    title="Page and Bar"
    description={
      <>
        Two small structural pieces that everything else in the app frame
        assumes. <code>Page</code> is a whole-screen container where{" "}
        <em>only the content scrolls</em>. <code>Bar</code> is the three-slot row
        used for headers, subheaders and footers. Neither is clever; both are
        load-bearing.
      </>
    }
  >
    <DemoSection
      title="1. Page — the header and footer stay put"
      codeTitle="Only the middle scrolls"
      codeDescription="Page is h-full, not min-h-full. A min-height is a floor, not a ceiling: a page that grows to fit its content means the content area never scrolls, it just expands, and the overflow lands on whatever ancestor can take it — producing a second scrollbar and a header that scrolls away. That exact bug shipped in this repo's own demo shell, which is why the comment is in the source. Scroll the box below: the bars do not move."
      code={`<Page
  header={<Bar design="header" startContent={<strong>Orders</strong>} />}
  footer={<Bar design="footer" endContent={<Button size="sm">Save</Button>} />}
>
  …content…
</Page>`}
    >
      <div style={FRAME} class="zen-border zen-border-zen-border">
        <Page
          header={
            <Bar
              design="header"
              startContent={<strong class="zen-text-sm">Orders</strong>}
              endContent={<Badge>24 open</Badge>}
            />
          }
          footer={
            <Bar
              design="footer"
              endContent={
                <Button size="sm" variant="outline">
                  Save
                </Button>
              }
            />
          }
        >
          <Paragraphs />
        </Page>
      </div>
    </DemoSection>

    <DemoSection
      title="2. Bar — the middle is centred against the page, not the gap"
      codeTitle="Three slots, and the middle does not drift"
      codeDescription="startContent and endContent take whatever width they need; middleContent stays centred on the bar regardless. That is the point of Bar over a flex row with justify-between — with three unequal children, 'centre' in a flex row means centred in the leftover space, which moves as soon as either side changes. Here the title stays put while the buttons around it come and go."
      code={`<Bar
  design="header"
  startContent={<Button size="sm" variant="ghost">Back</Button>}
  middleContent={<strong>Order #1042</strong>}
  endContent={<Button size="sm">Edit</Button>}
/>`}
    >
      <div class="zen-flex zen-flex-col zen-gap-3">
        <Bar
          design="header"
          startContent={
            <Button size="sm" variant="ghost">
              Back
            </Button>
          }
          middleContent={<strong class="zen-text-sm">Order #1042</strong>}
          endContent={
            <Button size="sm" variant="outline">
              Edit
            </Button>
          }
        />
        <Bar
          design="subheader"
          startContent={<span class="zen-text-xs zen-text-zen-muted-fg">Filters</span>}
          middleContent={<strong class="zen-text-sm">Order #1042</strong>}
        />
        <Bar
          design="footer"
          middleContent={<strong class="zen-text-sm">Order #1042</strong>}
          endContent={
            <Button size="sm" variant="outline">
              Only an end slot
            </Button>
          }
        />
      </div>
    </DemoSection>

    <DemoSection
      title="3. flush — for a table or a map"
      codeTitle="Content padding off"
      codeDescription="Page pads its content area by default, which is right for prose and wrong for anything that should reach the edges. flush removes it. The bars are unaffected — they carry their own padding, so a flush page still has a properly inset header."
      code={`<Page flush header={<Bar design="header" startContent={<strong>Map</strong>} />}>
  <MapOrTableThatShouldTouchTheEdges />
</Page>`}
    >
      <div style={FRAME} class="zen-border zen-border-zen-border">
        <Page
          flush
          header={<Bar design="header" startContent={<strong class="zen-text-sm">Map</strong>} />}
        >
          <div class="zen-h-full zen-bg-zen-muted">
            <div class="zen-grid zen-h-full zen-place-items-center zen-text-sm zen-text-zen-muted-fg">
              Edge to edge — no content padding
            </div>
          </div>
        </Page>
      </div>
    </DemoSection>
  </DemoPage>
);

export default NewPageDemo;
