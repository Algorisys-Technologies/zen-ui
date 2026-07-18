import { createSignal, Show } from "solid-js";
import {
  Banner,
  BannerIcon,
  BannerContent,
  BannerTitle,
  BannerDescription,
  BannerActions,
  BannerClose,
} from "./banner/banner";
import { Button } from "./button/button";
import { DemoPage, DemoSection } from "./demo-helpers";

const Bell = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
);

const NewBannerDemo = () => {
  const [show, setShow] = createSignal(true);
  return (
    <DemoPage
      title="Banner"
      description="Page-top persistent callout. Differs from Alert by being full-width with optional sticky."
    >
      <DemoSection
        title="Variants"
        codeTitle="color tokens, with an optional action in the trailing slot"
        codeDescription={
          <>
            Pass <code>sticky</code> to pin a banner to the top of the scroll
            viewport — useful at the layout root.
          </>
        }
        code={`<Banner color="info">
  <BannerIcon><Bell /></BannerIcon>
  <BannerContent>
    <BannerTitle>Maintenance window</BannerTitle>
    <BannerDescription>22:00–22:30 UTC tonight.</BannerDescription>
  </BannerContent>
</Banner>

{/* BannerActions holds the call to action */}
<Banner color="warning">
  <BannerIcon><Bell /></BannerIcon>
  <BannerContent>
    <BannerTitle>Verification required.</BannerTitle>
    <BannerDescription>Verify your email before continuing.</BannerDescription>
  </BannerContent>
  <BannerActions>
    <Button size="sm" variant="outline">Verify now</Button>
  </BannerActions>
</Banner>

<Banner color="success">…</Banner>
<Banner color="destructive">…</Banner>`}
      >
        <div class="zen-flex zen-flex-col zen-gap-3 zen-w-full">
          <Banner color="info">
            <BannerIcon><Bell /></BannerIcon>
            <BannerContent>
              <BannerTitle>Maintenance window</BannerTitle>
              <BannerDescription>22:00–22:30 UTC tonight.</BannerDescription>
            </BannerContent>
          </Banner>
          <Banner color="warning">
            <BannerIcon><Bell /></BannerIcon>
            <BannerContent>
              <BannerTitle>Verification required.</BannerTitle>
              <BannerDescription>Verify your email before continuing.</BannerDescription>
            </BannerContent>
            <BannerActions>
              <Button size="sm" variant="outline">Verify now</Button>
            </BannerActions>
          </Banner>
          <Banner color="success">
            <BannerIcon><Bell /></BannerIcon>
            <BannerContent>
              <BannerTitle>You're up to date.</BannerTitle>
              <BannerDescription>No further action needed.</BannerDescription>
            </BannerContent>
          </Banner>
          <Banner color="destructive">
            <BannerIcon><Bell /></BannerIcon>
            <BannerContent>
              <BannerTitle>Outage detected.</BannerTitle>
              <BannerDescription>Some services may be unavailable.</BannerDescription>
            </BannerContent>
          </Banner>
        </div>
      </DemoSection>

      <DemoSection
        title="Dismissible"
        codeTitle="BannerClose wired to caller-managed state"
        code={`const [show, setShow] = createSignal(true);

<Show
  when={show()}
  fallback={
    <Button size="sm" onClick={() => setShow(true)}>Restore banner</Button>
  }
>
  <Banner color="primary">
    <BannerIcon><Bell /></BannerIcon>
    <BannerContent>
      <BannerTitle>Welcome aboard.</BannerTitle>
      <BannerDescription>Tour the new features in your dashboard.</BannerDescription>
    </BannerContent>
    <BannerActions>
      <Button size="sm" variant="outline" color="primary">Start tour</Button>
    </BannerActions>
    <BannerClose onClick={() => setShow(false)} />
  </Banner>
</Show>`}
      >
        <Show when={show()} fallback={<Button size="sm" onClick={() => setShow(true)}>Restore banner</Button>}>
          <div class="zen-w-full">
            <Banner color="primary">
              <BannerIcon><Bell /></BannerIcon>
              <BannerContent>
                <BannerTitle>Welcome aboard.</BannerTitle>
                <BannerDescription>Tour the new features in your dashboard.</BannerDescription>
              </BannerContent>
              <BannerActions>
                <Button size="sm" variant="outline" color="primary">Start tour</Button>
              </BannerActions>
              <BannerClose onClick={() => setShow(false)} />
            </Banner>
          </div>
        </Show>
      </DemoSection>
    </DemoPage>
  );
};

export default NewBannerDemo;
