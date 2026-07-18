import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarImage,
} from "./avatar/avatar";
import { CodeExample } from "./demo-helpers";

const NewAvatarDemo: React.FC = () => (
  <div className="demo-page">
    <h1>Avatar (new — Radix-backed)</h1>
    <p className="lede">
      Image-with-fallback primitive on <code>@radix-ui/react-avatar</code>.
      Radix's <code>AvatarImage</code> exposes a loading-status data attribute,
      so the fallback shows automatically until the image loads (or on error).
    </p>

    <section className="demo-section">
      <h2>1. Basic (image + initials fallback)</h2>
      <CodeExample
        title="Compound API"
        code={`<Avatar>
  <AvatarImage src="/me.jpg" alt="Rajesh Pillai" />
  <AvatarFallback>RP</AvatarFallback>
</Avatar>`}
      >
        <Avatar>
          <AvatarImage src="https://i.pravatar.cc/96?img=12" alt="Rajesh Pillai" />
          <AvatarFallback>RP</AvatarFallback>
        </Avatar>
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>2. Fallback only</h2>
      <CodeExample
        title="When src is missing or fails to load"
        code={`<Avatar>
  <AvatarFallback>AB</AvatarFallback>
</Avatar>

<Avatar>
  <AvatarImage src="/broken.jpg" />
  <AvatarFallback>CD</AvatarFallback>
</Avatar>`}
      >
        <Avatar>
          <AvatarFallback>AB</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarImage src="/broken-link.jpg" />
          <AvatarFallback>CD</AvatarFallback>
        </Avatar>
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>3. Sizes</h2>
      <CodeExample
        title="xs · sm · md · lg · xl"
        code={`<Avatar size="xs"><AvatarFallback>XS</AvatarFallback></Avatar>
<Avatar size="sm"><AvatarFallback>SM</AvatarFallback></Avatar>
<Avatar size="md"><AvatarFallback>MD</AvatarFallback></Avatar>
<Avatar size="lg"><AvatarFallback>LG</AvatarFallback></Avatar>
<Avatar size="xl"><AvatarFallback>XL</AvatarFallback></Avatar>`}
      >
        {(["xs", "sm", "md", "lg", "xl"] as const).map((s) => (
          <Avatar key={s} size={s}>
            <AvatarFallback>{s.toUpperCase()}</AvatarFallback>
          </Avatar>
        ))}
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>4. AvatarGroup (stacked)</h2>
      <CodeExample
        title="max + spacing collapse the tail into +N"
        code={`<AvatarGroup max={3} spacing="default">
  <Avatar><AvatarFallback>RP</AvatarFallback></Avatar>
  <Avatar><AvatarImage src="…" /><AvatarFallback>AB</AvatarFallback></Avatar>
  <Avatar><AvatarFallback>CD</AvatarFallback></Avatar>
  <Avatar><AvatarFallback>EF</AvatarFallback></Avatar>
  <Avatar><AvatarFallback>GH</AvatarFallback></Avatar>
</AvatarGroup>`}
      >
        <AvatarGroup max={3} spacing="default">
          <Avatar>
            <AvatarFallback>RP</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarImage src="https://i.pravatar.cc/96?img=33" />
            <AvatarFallback>AB</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>CD</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>EF</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>GH</AvatarFallback>
          </Avatar>
        </AvatarGroup>
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>5. Custom fallback colours</h2>
      <CodeExample
        title="className override on AvatarFallback"
        code={`<AvatarFallback className="bg-zen-primary text-zen-primary-fg">RP</AvatarFallback>
<AvatarFallback className="bg-zen-success text-zen-success-fg">OK</AvatarFallback>
<AvatarFallback className="bg-zen-error text-zen-error-fg">!!</AvatarFallback>`}
      >
        <Avatar>
          <AvatarFallback className="zen-bg-zen-primary zen-text-zen-primary-fg">
            RP
          </AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarFallback className="zen-bg-zen-success zen-text-zen-success-fg">
            OK
          </AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarFallback className="zen-bg-zen-error zen-text-zen-error-fg">
            !!
          </AvatarFallback>
        </Avatar>
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>6. With status dot</h2>
      <CodeExample
        title="Position a small dot via absolute positioning"
        description={`The compound API leaves status indicators to composition — drop a styled <span> on top of the Avatar.`}
        code={`<div style={{ position: "relative", display: "inline-block" }}>
  <Avatar><AvatarFallback>RP</AvatarFallback></Avatar>
  <span style={{
    position: "absolute", right: 0, bottom: 0,
    width: 10, height: 10, borderRadius: "999px",
    background: "var(--zen-status-online)",
    border: "2px solid var(--zen-color-background)",
  }} />
</div>`}
      >
        {(["online", "away", "busy", "offline"] as const).map((status) => (
          <div key={status} style={{ position: "relative", display: "inline-block" }}>
            <Avatar size="lg">
              <AvatarFallback>{status[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <span
              style={{
                position: "absolute",
                right: 0,
                bottom: 0,
                width: 12,
                height: 12,
                borderRadius: "999px",
                background: `var(--zen-status-${status})`,
                border: "2px solid var(--zen-color-background)",
              }}
              aria-label={status}
            />
          </div>
        ))}
      </CodeExample>
    </section>
  </div>
);

export default NewAvatarDemo;
