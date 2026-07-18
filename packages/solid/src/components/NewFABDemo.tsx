import { FAB } from "./fab/fab";
import { DemoPage } from "./demo-helpers";

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" class="zen-h-5 zen-w-5" aria-hidden="true">
    <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
  </svg>
);

const NewFABDemo = () => (
  <DemoPage
    title="FAB"
    description="Floating action button — fixed position, circle shape, composes Button. This page renders one in the bottom-right corner."
  >
    <p class="zen-text-sm zen-text-zen-muted-fg">
      Look at the bottom-right of the viewport for the primary FAB.
    </p>
    <FAB iconLeft={<PlusIcon />} aria-label="New item" />
  </DemoPage>
);

export default NewFABDemo;
