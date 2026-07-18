import { Separator } from "./divider/divider";
import { DemoPage, DemoSection } from "./demo-helpers";

const NewSeparatorDemo = () => (
  <DemoPage
    title="Separator"
    description="Horizontal or vertical divider. Decorative by default; pass decorative={false} when the separation is semantically meaningful."
  >
    <DemoSection
      title="Horizontal"
      codeTitle="Default orientation — spans the full width of its parent"
      code={`<div class="zen-w-80">
  <div class="zen-text-sm">Profile</div>
  <Separator class="zen-my-3" />
  <div class="zen-text-sm">Billing</div>
  <Separator class="zen-my-3" />
  <div class="zen-text-sm">Notifications</div>
</div>`}
    >
      <div class="zen-w-80">
        <div class="zen-text-sm">Profile</div>
        <Separator class="zen-my-3" />
        <div class="zen-text-sm">Billing</div>
        <Separator class="zen-my-3" />
        <div class="zen-text-sm">Notifications</div>
      </div>
    </DemoSection>

    <DemoSection
      title="Vertical"
      codeTitle={'orientation="vertical" — the parent needs an explicit height'}
      code={`<div class="zen-flex zen-items-center zen-gap-3 zen-h-8 zen-text-sm">
  <span>Edit</span>
  <Separator orientation="vertical" />
  <span>Duplicate</span>
  <Separator orientation="vertical" />
  <span>Delete</span>
</div>`}
    >
      <div class="zen-flex zen-items-center zen-gap-3 zen-h-8 zen-text-sm">
        <span>Edit</span>
        <Separator orientation="vertical" />
        <span>Duplicate</span>
        <Separator orientation="vertical" />
        <span>Delete</span>
      </div>
    </DemoSection>
  </DemoPage>
);

export default NewSeparatorDemo;
