import { Skeleton } from "./skeleton/skeleton";
import { DemoPage, DemoSection } from "./demo-helpers";

const NewSkeletonDemo = () => (
  <DemoPage
    title="Skeleton"
    description="Animated placeholder boxes for loading states. Size with utility classes."
  >
    <DemoSection
      title="Block shapes"
      codeTitle="class controls the dimensions"
      code={`<Skeleton class="zen-h-4 zen-w-32" />
<Skeleton class="zen-h-6 zen-w-64" />
<Skeleton class="zen-h-10 zen-w-48" />`}
    >
      <Skeleton class="zen-h-4 zen-w-32" />
      <Skeleton class="zen-h-6 zen-w-64" />
      <Skeleton class="zen-h-10 zen-w-48" />
    </DemoSection>

    <DemoSection
      title="Avatar"
      codeTitle="zen-rounded-zen-full for circular shapes"
      code={`<Skeleton class="zen-h-12 zen-w-12 zen-rounded-zen-full" />
<Skeleton class="zen-h-16 zen-w-16 zen-rounded-zen-full" />`}
    >
      <Skeleton class="zen-h-12 zen-w-12 zen-rounded-zen-full" />
      <Skeleton class="zen-h-16 zen-w-16 zen-rounded-zen-full" />
    </DemoSection>

    <DemoSection
      title="Card placeholder"
      codeTitle="Compose skeletons to mimic the final layout"
      code={`<div class="zen-flex zen-items-center zen-gap-3 zen-w-80">
  <Skeleton class="zen-h-12 zen-w-12 zen-rounded-zen-full" />
  <div class="zen-flex-1 zen-flex zen-flex-col zen-gap-2">
    <Skeleton class="zen-h-4 zen-w-3/4" />
    <Skeleton class="zen-h-3 zen-w-1/2" />
  </div>
</div>`}
    >
      <div class="zen-flex zen-items-center zen-gap-3 zen-w-80">
        <Skeleton class="zen-h-12 zen-w-12 zen-rounded-zen-full" />
        <div class="zen-flex-1 zen-flex zen-flex-col zen-gap-2">
          <Skeleton class="zen-h-4 zen-w-3/4" />
          <Skeleton class="zen-h-3 zen-w-1/2" />
        </div>
      </div>
    </DemoSection>
  </DemoPage>
);

export default NewSkeletonDemo;
