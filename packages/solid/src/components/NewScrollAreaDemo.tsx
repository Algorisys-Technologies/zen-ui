import { For } from "solid-js";
import { ScrollArea } from "./scroll-area/scroll-area";
import { DemoPage, DemoSection } from "./demo-helpers";

const NewScrollAreaDemo = () => (
  <DemoPage
    title="ScrollArea"
    description="Native-scroll wrapper with styled thin scrollbar. Lighter than the Radix/React version (no custom rendered thumb) — pulls in zero JS for scroll handling."
  >
    <DemoSection
      title="Tag list"
      codeTitle="Constrain the box with classes — overflow scrolls natively"
      code={`const tags = Array.from({ length: 40 }, (_, i) => \`Tag #\${i + 1}\`);

<ScrollArea class="zen-h-72 zen-w-48 zen-rounded-zen-md zen-border zen-border-zen-border zen-p-3">
  <div class="zen-space-y-2">
    <For each={tags}>
      {(label) => (
        <div class="zen-text-sm zen-rounded-zen-sm zen-px-2 zen-py-1 zen-bg-zen-muted">
          {label}
        </div>
      )}
    </For>
  </div>
</ScrollArea>`}
    >
      <ScrollArea class="zen-h-72 zen-w-48 zen-rounded-zen-md zen-border zen-border-zen-border zen-p-3">
        <div class="zen-space-y-2">
          <For each={Array.from({ length: 40 }, (_, i) => `Tag #${i + 1}`)}>
            {(label) => (
              <div class="zen-text-sm zen-rounded-zen-sm zen-px-2 zen-py-1 zen-bg-zen-muted">
                {label}
              </div>
            )}
          </For>
        </div>
      </ScrollArea>
    </DemoSection>
  </DemoPage>
);

export default NewScrollAreaDemo;
