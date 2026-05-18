import { useState } from "react";
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
import { CodeExample } from "./demo-helpers";

const COLORS = [
  "info",
  "success",
  "warning",
  "destructive",
  "primary",
  "neutral",
] as const;

const InfoIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12" y2="8" />
  </svg>
);
const WarnIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12" y2="17" />
  </svg>
);

const NewBannerDemo: React.FC = () => {
  const [show, setShow] = useState(true);
  return (
    <div className="demo-page">
      <h1>Banner</h1>
      <p className="lede">
        Page-top persistent callout for app-wide context — onboarding
        reminders, maintenance windows, role impersonation, missing
        verification. Compound API mirrors{" "}
        <code>&lt;Alert&gt;</code> but the banner spans its container's
        full width and can <code>sticky</code> to the viewport top.
      </p>

      <section className="demo-section">
        <h2>1. Default</h2>
        <CodeExample
          title="Title + description + close"
          code={`<Banner>
  <BannerIcon><InfoIcon /></BannerIcon>
  <BannerContent>
    <BannerTitle>New feature.</BannerTitle>
    <BannerDescription>
      You can now schedule reports from the dashboard.
    </BannerDescription>
  </BannerContent>
  <BannerClose />
</Banner>`}
        >
          <Banner>
            <BannerIcon>
              <InfoIcon />
            </BannerIcon>
            <BannerContent>
              <BannerTitle>New feature.</BannerTitle>
              <BannerDescription>
                You can now schedule reports from the dashboard.
              </BannerDescription>
            </BannerContent>
            <BannerClose />
          </Banner>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>2. Colors</h2>
        <CodeExample
          title="All six color tokens"
          code={`<Banner color="warning">…</Banner>
<Banner color="destructive">…</Banner>`}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
            {COLORS.map((c) => (
              <Banner key={c} color={c}>
                <BannerIcon><InfoIcon /></BannerIcon>
                <BannerContent>
                  <BannerTitle>{c}.</BannerTitle>
                  <BannerDescription>
                    Banner with color={c}.
                  </BannerDescription>
                </BannerContent>
              </Banner>
            ))}
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>3. With action</h2>
        <CodeExample
          title="Call-to-action button in the trailing slot"
          code={`<Banner color="warning">
  <BannerIcon><WarnIcon /></BannerIcon>
  <BannerContent>
    <BannerTitle>Verification required.</BannerTitle>
    <BannerDescription>
      Verify your email before continuing.
    </BannerDescription>
  </BannerContent>
  <BannerActions>
    <Button size="sm" variant="outline" color="warning">Verify now</Button>
  </BannerActions>
  <BannerClose />
</Banner>`}
        >
          <Banner color="warning">
            <BannerIcon>
              <WarnIcon />
            </BannerIcon>
            <BannerContent>
              <BannerTitle>Verification required.</BannerTitle>
              <BannerDescription>
                Verify your email before continuing.
              </BannerDescription>
            </BannerContent>
            <BannerActions>
              <Button size="sm" variant="outline" color="warning">
                Verify now
              </Button>
            </BannerActions>
            <BannerClose />
          </Banner>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>4. Dismissible</h2>
        <CodeExample
          title="Hide the banner from caller-managed state"
          description="BannerClose just renders a styled ✕ button — wire its onClick to your own visibility state."
          code={`const [show, setShow] = useState(true);
{show ? (
  <Banner color="info">
    <BannerContent>
      <BannerTitle>Reminder.</BannerTitle>
      <BannerDescription>Click ✕ to dismiss this.</BannerDescription>
    </BannerContent>
    <BannerClose onClick={() => setShow(false)} />
  </Banner>
) : (
  <Button onClick={() => setShow(true)}>Show banner again</Button>
)}`}
        >
          {show ? (
            <Banner color="info">
              <BannerContent>
                <BannerTitle>Reminder.</BannerTitle>
                <BannerDescription>
                  Click ✕ on the right to dismiss this banner.
                </BannerDescription>
              </BannerContent>
              <BannerClose onClick={() => setShow(false)} />
            </Banner>
          ) : (
            <Button size="sm" onClick={() => setShow(true)}>
              Show banner again
            </Button>
          )}
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>5. Sticky to viewport top</h2>
        <CodeExample
          title="sticky pins the banner to the top of the scroll viewport"
          description="Use for app-wide context that should remain in view as the user scrolls. Pair with a tall page below to feel the effect."
          code={`<Banner color="destructive" sticky>
  <BannerIcon><WarnIcon /></BannerIcon>
  <BannerContent>
    <BannerTitle>Impersonating ada@algorisys.com.</BannerTitle>
  </BannerContent>
  <BannerActions>
    <Button size="sm" variant="outline">Stop</Button>
  </BannerActions>
</Banner>`}
        >
          <p className="text-xs text-zen-muted-fg">
            (Scroll the demo page to see the example sticky at top of
            this section's preview area — wired in the page chrome of
            real apps via{" "}
            <code>{`<Banner sticky />`}</code> at the layout root.)
          </p>
        </CodeExample>
      </section>
    </div>
  );
};

export default NewBannerDemo;
