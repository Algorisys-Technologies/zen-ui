import { useState } from "react";
import {
  Alert,
  AlertActions,
  AlertClose,
  AlertContent,
  AlertDescription,
  AlertIcon,
  AlertTitle,
} from "../components/alert/alert";
import { Button } from "../components/button/button";
import { CodeExample } from "./demo-helpers";

const COLORS = ["neutral", "primary", "info", "success", "warning", "destructive"] as const;

const NewAlertDemo: React.FC = () => {
  const [visible, setVisible] = useState(true);
  return (
    <div className="demo-page">
      <h1>Alert (Zen theme spec)</h1>
      <p className="lede">
        Banner / inline feedback. Compound API — all parts (icon, title,
        description, actions, close) are opt-in. Soft and outline visual
        styles per the Zen theme alert artifact.
      </p>

      <section className="demo-section">
        <h2>1. Default</h2>
        <CodeExample
          title="Soft + info — title + description + close"
          code={`<Alert>
  <AlertIcon><InfoIcon /></AlertIcon>
  <AlertContent>
    <AlertTitle>Heads up</AlertTitle>
    <AlertDescription>Your trial expires in 3 days.</AlertDescription>
  </AlertContent>
  <AlertClose onClick={dismiss} />
</Alert>`}
        >
          <Alert>
            <AlertIcon><InfoIcon /></AlertIcon>
            <AlertContent>
              <AlertTitle>Heads up</AlertTitle>
              <AlertDescription>Your trial expires in 3 days.</AlertDescription>
            </AlertContent>
            <AlertClose />
          </Alert>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>2. Colors × soft variant</h2>
        <CodeExample
          title="All six color tokens"
          code={`<Alert color="success">…</Alert>
<Alert color="destructive">…</Alert>
<Alert color="warning">…</Alert>`}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }}>
            {COLORS.map((c) => (
              <Alert key={c} color={c}>
                <AlertIcon><DotIcon /></AlertIcon>
                <AlertContent>
                  <AlertTitle>{titleFor(c)}</AlertTitle>
                  <AlertDescription>
                    Alert with color={c}. Body text demonstrates contrast.
                  </AlertDescription>
                </AlertContent>
              </Alert>
            ))}
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>3. Outline variant</h2>
        <CodeExample
          title="White surface with a colored left border"
          description={`The Zen theme "Opaque Bg" style — neutral text on background, ring color via border.`}
          code={`<Alert variant="outline" color="warning">
  <AlertIcon><WarnIcon /></AlertIcon>
  <AlertContent>
    <AlertTitle>Watch out</AlertTitle>
    <AlertDescription>Disk usage above 80%.</AlertDescription>
  </AlertContent>
</Alert>`}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }}>
            {COLORS.map((c) => (
              <Alert key={c} variant="outline" color={c}>
                <AlertIcon><DotIcon /></AlertIcon>
                <AlertContent>
                  <AlertTitle>{titleFor(c)}</AlertTitle>
                  <AlertDescription>variant="outline" color={`"${c}"`}</AlertDescription>
                </AlertContent>
              </Alert>
            ))}
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>4. With actions + close</h2>
        <CodeExample
          title="Action 1 + Action 2 + dismiss button"
          code={`<Alert color="primary">
  <AlertIcon><InfoIcon /></AlertIcon>
  <AlertContent>
    <AlertTitle>Update available</AlertTitle>
    <AlertDescription>v3.0.0 includes breaking changes — read the migration guide.</AlertDescription>
  </AlertContent>
  <AlertActions>
    <Button variant="ghost" size="sm">Skip</Button>
    <Button size="sm">Read guide</Button>
  </AlertActions>
  <AlertClose onClick={dismiss} />
</Alert>`}
        >
          <Alert color="primary">
            <AlertIcon><InfoIcon /></AlertIcon>
            <AlertContent>
              <AlertTitle>Update available</AlertTitle>
              <AlertDescription>
                v3.0.0 includes breaking changes — read the migration guide.
              </AlertDescription>
            </AlertContent>
            <AlertActions>
              <Button variant="ghost" size="sm" color="primary">Skip</Button>
              <Button size="sm">Read guide</Button>
            </AlertActions>
            <AlertClose />
          </Alert>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>5. Title only / body only</h2>
        <CodeExample
          title="Every part is opt-in — render whatever you need"
          code={`<Alert>
  <AlertIcon><CheckIcon /></AlertIcon>
  <AlertContent><AlertTitle>Saved</AlertTitle></AlertContent>
</Alert>

<Alert color="neutral">
  <AlertContent>
    <AlertDescription>System maintenance window: 22:00–23:00 IST.</AlertDescription>
  </AlertContent>
</Alert>`}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }}>
            <Alert color="success">
              <AlertIcon><CheckIcon /></AlertIcon>
              <AlertContent>
                <AlertTitle>Saved</AlertTitle>
              </AlertContent>
            </Alert>
            <Alert color="neutral">
              <AlertContent>
                <AlertDescription>
                  System maintenance window: 22:00–23:00 IST.
                </AlertDescription>
              </AlertContent>
            </Alert>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>6. Dismissible</h2>
        <CodeExample
          title="Hide on AlertClose"
          code={`const [visible, setVisible] = useState(true);

{visible && (
  <Alert color="warning">
    <AlertIcon><WarnIcon /></AlertIcon>
    <AlertContent>
      <AlertTitle>Almost out of seats</AlertTitle>
      <AlertDescription>You have 1 seat remaining.</AlertDescription>
    </AlertContent>
    <AlertClose onClick={() => setVisible(false)} />
  </Alert>
)}`}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }}>
            {visible ? (
              <Alert color="warning">
                <AlertIcon><WarnIcon /></AlertIcon>
                <AlertContent>
                  <AlertTitle>Almost out of seats</AlertTitle>
                  <AlertDescription>You have 1 seat remaining.</AlertDescription>
                </AlertContent>
                <AlertClose onClick={() => setVisible(false)} />
              </Alert>
            ) : (
              <Button size="sm" variant="outline" color="neutral" onClick={() => setVisible(true)}>
                Show alert again
              </Button>
            )}
          </div>
        </CodeExample>
      </section>
    </div>
  );
};

const titleFor = (c: (typeof COLORS)[number]) =>
  ({
    neutral: "Heads up",
    primary: "New release",
    info: "FYI",
    success: "All good",
    warning: "Be careful",
    destructive: "Something went wrong",
  })[c];

const InfoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12" y2="8" />
  </svg>
);
const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const WarnIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12" y2="17" />
  </svg>
);
const DotIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <circle cx="12" cy="12" r="6" />
  </svg>
);

export default NewAlertDemo;
