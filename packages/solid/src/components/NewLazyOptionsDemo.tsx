import { VirtualizedItems } from "./listbox/virtualized-items";
import { DemoPage, DemoSection } from "./demo-helpers";

const ITEMS = Array.from({ length: 5000 }, (_, i) => ({
  id: i,
  label: `Option #${i + 1}`,
}));

const NewLazyOptionsDemo = () => (
  <DemoPage
    title="VirtualizedItems"
    description="Drop-in scrolling viewport that renders only the visible window. Use inside large lists where mounting every row would blow up the DOM."
  >
    <DemoSection
      title="5,000 items, 280 px viewport"
      codeTitle="Only the visible window is mounted"
      codeDescription="The children callback receives { item, index }. maxHeight defaults to 280 px and estimateSize to 36 px. VirtualizedItems doesn't filter — for search across a large set, use Combobox, which filters before rendering."
      code={`const ITEMS = Array.from({ length: 5000 }, (_, i) => ({
  id: i,
  label: \`Option #\${i + 1}\`,
}));

<VirtualizedItems items={ITEMS} estimateSize={36}>
  {({ item }) => (
    <div class="zen-px-3 zen-py-2 zen-text-sm">{item.label}</div>
  )}
</VirtualizedItems>`}
    >
      <div class="zen-w-72 zen-rounded-zen-md zen-border zen-border-zen-border">
        <VirtualizedItems items={ITEMS} estimateSize={36}>
          {({ item }) => (
            <div class="zen-px-3 zen-py-2 zen-text-sm zen-border-b zen-border-zen-border last:zen-border-b-0">
              {item.label}
            </div>
          )}
        </VirtualizedItems>
      </div>
    </DemoSection>
  </DemoPage>
);

export default NewLazyOptionsDemo;
