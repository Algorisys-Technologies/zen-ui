import { createSignal, Show } from "solid-js";
import {
  Alert,
  AlertIcon,
  AlertContent,
  AlertTitle,
  AlertDescription,
  AlertActions,
  AlertClose,
} from "./alert/alert";
import { Button } from "./button/button";
import { DemoPage, DemoSection } from "./demo-helpers";

const Info = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

const NewAlertDemo = () => {
  const [show, setShow] = createSignal(true);

  return (
    <DemoPage title="Alert" description="Inline message banner. Compound API.">
      <DemoSection
        title="Variants × colours"
        codeTitle="color tokens with the soft (default) and outline variants"
        code={`<Alert color="info">
  <AlertIcon><Info /></AlertIcon>
  <AlertContent>
    <AlertTitle>Heads up</AlertTitle>
    <AlertDescription>Your trial expires in 3 days.</AlertDescription>
  </AlertContent>
</Alert>

<Alert color="success">…</Alert>
<Alert color="warning">…</Alert>
<Alert color="destructive">…</Alert>

{/* outline — background surface with a coloured border */}
<Alert variant="outline" color="info">
  <AlertIcon><Info /></AlertIcon>
  <AlertContent>
    <AlertTitle>Outline variant</AlertTitle>
    <AlertDescription>White surface with coloured border.</AlertDescription>
  </AlertContent>
</Alert>`}
      >
        <div class="zen-flex zen-flex-col zen-gap-2 zen-w-full zen-max-w-2xl">
          <Alert color="info">
            <AlertIcon><Info /></AlertIcon>
            <AlertContent>
              <AlertTitle>Heads up</AlertTitle>
              <AlertDescription>Your trial expires in 3 days.</AlertDescription>
            </AlertContent>
          </Alert>
          <Alert color="success">
            <AlertIcon><Info /></AlertIcon>
            <AlertContent>
              <AlertTitle>Saved</AlertTitle>
              <AlertDescription>Your changes are live.</AlertDescription>
            </AlertContent>
          </Alert>
          <Alert color="warning">
            <AlertIcon><Info /></AlertIcon>
            <AlertContent>
              <AlertTitle>Action required</AlertTitle>
              <AlertDescription>Verify your email before continuing.</AlertDescription>
            </AlertContent>
          </Alert>
          <Alert color="destructive">
            <AlertIcon><Info /></AlertIcon>
            <AlertContent>
              <AlertTitle>Something broke</AlertTitle>
              <AlertDescription>We couldn't save your changes. Try again.</AlertDescription>
            </AlertContent>
          </Alert>
          <Alert variant="outline" color="info">
            <AlertIcon><Info /></AlertIcon>
            <AlertContent>
              <AlertTitle>Outline variant</AlertTitle>
              <AlertDescription>White surface with coloured border.</AlertDescription>
            </AlertContent>
          </Alert>
        </div>
      </DemoSection>

      <DemoSection
        title="With actions and dismissible"
        codeTitle="AlertActions + AlertClose driven by a signal"
        codeDescription="AlertClose only renders a styled ✕ button — wire its onClick to your own visibility state."
        code={`const [show, setShow] = createSignal(true);

<Show
  when={show()}
  fallback={<Button size="sm" onClick={() => setShow(true)}>Restore</Button>}
>
  <Alert color="primary">
    <AlertIcon><Info /></AlertIcon>
    <AlertContent>
      <AlertTitle>Update available</AlertTitle>
      <AlertDescription>A new version is ready to install.</AlertDescription>
    </AlertContent>
    <AlertActions>
      <Button size="sm" variant="outline" color="primary">Install</Button>
    </AlertActions>
    <AlertClose onClick={() => setShow(false)} />
  </Alert>
</Show>`}
      >
        <Show when={show()}>
          <div class="zen-w-full zen-max-w-2xl">
            <Alert color="primary">
              <AlertIcon><Info /></AlertIcon>
              <AlertContent>
                <AlertTitle>Update available</AlertTitle>
                <AlertDescription>A new version is ready to install.</AlertDescription>
              </AlertContent>
              <AlertActions>
                <Button size="sm" variant="outline" color="primary">Install</Button>
              </AlertActions>
              <AlertClose onClick={() => setShow(false)} />
            </Alert>
          </div>
        </Show>
        <Show when={!show()}>
          <Button size="sm" onClick={() => setShow(true)}>Restore</Button>
        </Show>
      </DemoSection>
    </DemoPage>
  );
};

export default NewAlertDemo;
