import { type JSX } from "solid-js";
import { A } from "@solidjs/router";
import { Link } from "./link/link";
import { DemoPage, DemoSection } from "./demo-helpers";

const ROW: JSX.CSSProperties = {
  display: "flex",
  "flex-wrap": "wrap",
  gap: "16px",
  "align-items": "center",
};

const NewLinkDemo = () => (
  <DemoPage
    title="Link"
    description={
      <>
        A styled anchor. The most surprising thing this library was missing: every
        app that used it hand-rolled <code>&lt;a class="text-blue-600
        underline"&gt;</code>, which is how a design system ends up with nine
        shades of link.
      </>
    }
  >
    <DemoSection
      title="1. Standalone and inline"
      codeTitle="Two jobs, and they do not look the same"
      codeDescription="A standalone link is coloured and underlines on hover. A link inside a sentence is underlined always and takes the sentence's colour and size — colour alone is not an accessible way to say 'link' when the link sits inside text, because it fails for anyone who cannot see the colour."
      code={`<Link href="/pricing">Pricing</Link>

<p>Read the <Link href="/docs" inline>documentation</Link> first.</p>`}
    >
      <div style={{ display: "flex", "flex-direction": "column", gap: "12px" }}>
        <div style={ROW}>
          <Link href="#link-demo">Pricing</Link>
          <Link href="#link-demo" size="sm">size="sm"</Link>
          <Link href="#link-demo" size="lg">size="lg"</Link>
        </div>
        <p class="zen-m-0 zen-text-sm zen-text-zen-foreground">
          Read the{" "}
          <Link href="#link-demo" inline>
            documentation
          </Link>{" "}
          first — an inline link inherits this sentence's size and colour, so it
          cannot drift away from the prose around it.
        </p>
      </div>
    </DemoSection>

    <DemoSection
      title="2. Leaving the page"
      codeTitle="external says so, in the markup and out loud"
      codeDescription="external sets target=_blank and rel='noopener noreferrer' — noopener closes the window.opener hole, noreferrer stops the referrer leaking — and renders the mark that means it. The icon is decorative, so the fact it opens a new tab is also said in words for anyone who cannot see it. Pass your own target or rel and yours wins."
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
        <p class="zen-m-0 zen-text-sm">
          Or{" "}
          <Link href="https://www.algorisys.com" external inline>
            inline and external
          </Link>{" "}
          together.
        </p>
      </div>
    </DemoSection>

    <DemoSection
      title="3. Disabled"
      codeTitle="A disabled link is not a link"
      codeDescription="An anchor cannot be disabled — the attribute does not exist, and dropping pointer-events still leaves it in the tab order for keyboard users. So a disabled Link renders a <span>: nothing to click, nothing to focus, and aria-disabled to say why."
      code={`<Link href="/admin" disabled>Admin (needs permission)</Link>
// -> <span aria-disabled="true"> — no href, not focusable`}
    >
      <div style={ROW}>
        <Link href="#link-demo" disabled>
          Admin (needs permission)
        </Link>
        <Link href="#link-demo">…next to a live one</Link>
      </div>
    </DemoSection>

    <DemoSection
      title="4. Your router's link"
      codeTitle="as — keep the navigation, take the styling"
      codeDescription="A router's link does client-side navigation; ours does colour, focus and underline. Polymorphic `as` merges the two rather than making you choose. React's binding does the same job with asChild, which is the one deliberate divergence between the bindings — Kobalte and Radix disagree here, and this component follows its own binding rather than inventing a third way."
      code={`import { A } from "@solidjs/router";

<Link as={A} href="/pricing">Pricing</Link>`}
    >
      <div style={ROW}>
        <Link as={A} href="/link">
          Rendered through as={"{A}"} — a real router link
        </Link>
      </div>
    </DemoSection>
  </DemoPage>
);

export default NewLinkDemo;
