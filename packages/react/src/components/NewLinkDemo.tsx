import { Link } from "./link/link";
import { CodeExample } from "./demo-helpers";

const ROW: React.CSSProperties = { display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center" };

const NewLinkDemo: React.FC = () => (
  <div className="demo-page">
    <h1>Link</h1>
    <p className="lede">
      A styled anchor. The most surprising thing this library was missing: every
      app that used it hand-rolled <code>&lt;a className="text-blue-600
      underline"&gt;</code>, which is how a design system ends up with nine
      shades of link.
    </p>

    <section className="demo-section">
      <h2>1. Standalone and inline</h2>
      <CodeExample
        title="Two jobs, and they do not look the same"
        description="A standalone link is coloured and underlines on hover. A link inside a sentence is underlined always and takes the sentence's colour and size — colour alone is not an accessible way to say 'link' when the link sits inside text, because it fails for anyone who cannot see the colour."
        code={`<Link href="/pricing">Pricing</Link>

<p>Read the <Link href="/docs" inline>documentation</Link> first.</p>`}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={ROW}>
            <Link href="#link-demo">Pricing</Link>
            <Link href="#link-demo" size="sm">size="sm"</Link>
            <Link href="#link-demo" size="lg">size="lg"</Link>
          </div>
          <p className="zen-m-0 zen-text-sm zen-text-zen-foreground">
            Read the{" "}
            <Link href="#link-demo" inline>
              documentation
            </Link>{" "}
            first — an inline link inherits this sentence's size and colour, so it
            cannot drift away from the prose around it.
          </p>
        </div>
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>2. Leaving the page</h2>
      <CodeExample
        title="external says so, in the markup and out loud"
        description="external sets target=_blank and rel='noopener noreferrer' — noopener closes the window.opener hole, noreferrer stops the referrer leaking — and renders the mark that means it. The icon is decorative, so the fact it opens a new tab is also said in words for anyone who cannot see it. Pass your own target or rel and yours wins."
        code={`<Link href="https://www.algorisys.com" external>Algorisys</Link>

// renders: target="_blank" rel="noopener noreferrer"
//          + an icon, + a visually-hidden "(opens in a new tab)"`}
      >
        <div style={ROW}>
          <Link href="https://www.algorisys.com" external>
            Algorisys
          </Link>
          <Link href="https://www.youtube.com/@tekacademylabs" external size="sm">
            Tek Academy Labs
          </Link>
          <p className="zen-m-0 zen-text-sm">
            Or{" "}
            <Link href="https://www.algorisys.com" external inline>
              inline and external
            </Link>{" "}
            together.
          </p>
        </div>
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>3. Disabled</h2>
      <CodeExample
        title="A disabled link is not a link"
        description="An anchor cannot be disabled — the attribute does not exist, and dropping pointer-events still leaves it in the tab order for keyboard users. So a disabled Link renders a <span>: nothing to click, nothing to focus, and aria-disabled to say why."
        code={`<Link href="/admin" disabled>Admin (needs permission)</Link>
// -> <span aria-disabled="true"> — no href, not focusable`}
      >
        <div style={ROW}>
          <Link href="#link-demo" disabled>
            Admin (needs permission)
          </Link>
          <Link href="#link-demo">…next to a live one</Link>
        </div>
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>4. Your router's link</h2>
      <CodeExample
        title="asChild — keep the navigation, take the styling"
        description="A router's Link does client-side navigation; ours does colour, focus and underline. asChild merges the two rather than making you choose, so an app never has to reimplement one to get the other. The Solid binding does the same job with as={A}, which is the one deliberate divergence between the bindings."
        code={`import { Link as RouterLink } from "react-router-dom";

<Link asChild>
  <RouterLink to="/pricing">Pricing</RouterLink>
</Link>`}
      >
        <div style={ROW}>
          <Link asChild>
            {/* Any element works — the styling is handed to the child. */}
            <a href="#link-demo" data-demo="as-child">
              Rendered through asChild
            </a>
          </Link>
        </div>
      </CodeExample>
    </section>
  </div>
);

export default NewLinkDemo;
