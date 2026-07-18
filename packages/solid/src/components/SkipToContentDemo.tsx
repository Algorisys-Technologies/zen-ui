import { SkipToContent } from "./skip-to-content/skip-to-content";
import { DemoPage, DemoSection } from "./demo-helpers";

const SkipToContentDemo = () => (
  <DemoPage
    title="SkipToContent"
    description="The keyboard bypass an app frame owes its users. It is the first focusable thing on the page and is visually hidden until it takes focus, so the first Tab reveals a 'Skip to main content' link and Enter jumps past the header and nav to the content (WCAG 2.4.1, Bypass Blocks)."
  >
    <DemoSection
      title="Try it"
      codeTitle="First Tab reveals the link; Enter jumps to the target"
      code={`<SkipToContent href="#main-content" />
{/* …header, nav… */}
<main id="main-content" tabindex={-1}>…</main>`}
    >
      <div style={{ position: "relative", display: "grid", gap: "12px" }}>
        <SkipToContent href="#demo-main" />
        <p class="zen-text-sm zen-text-zen-muted-fg">
          Click here, then press <kbd>Tab</kbd> — the link appears at the top-left of the viewport. Press{" "}
          <kbd>Enter</kbd> to move focus to the target below.
        </p>
        <div
          id="demo-main"
          tabindex={-1}
          class="zen-rounded-zen-lg zen-border zen-border-zen-border zen-bg-zen-muted zen-p-4"
        >
          Main content target (<code>id="demo-main"</code>, <code>tabindex=-1</code>).
        </div>
      </div>
    </DemoSection>
  </DemoPage>
);

export default SkipToContentDemo;
