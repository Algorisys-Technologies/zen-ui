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
    <DemoSection title="5,000 items, 280 px viewport">
      <div class="w-72 rounded-zen-md border border-zen-border">
        <VirtualizedItems items={ITEMS} estimateSize={36}>
          {({ item }) => (
            <div class="px-3 py-2 text-sm border-b border-zen-border last:border-b-0">
              {item.label}
            </div>
          )}
        </VirtualizedItems>
      </div>
    </DemoSection>
  </DemoPage>
);

export default NewLazyOptionsDemo;
