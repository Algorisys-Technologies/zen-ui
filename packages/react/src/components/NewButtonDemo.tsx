import { useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { Button } from "./button/button";
import { CodeExample } from "./demo-helpers";

/**
 * Demonstrates the shadcn-style Button. Each section pairs the live
 * components with a copy-able code snippet.
 */
const NewButtonDemo: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [counter, setCounter] = useState(0);
  const focusRef = useRef<HTMLButtonElement>(null);

  const colors = [
    "primary",
    "neutral",
    "info",
    "success",
    "warning",
    "error",
  ] as const;
  const sizes = ["xs", "sm", "md", "lg", "xl"] as const;

  return (
    <div className="demo-page">
      <h1>Button</h1>
      <p className="lede">
        Forwards a ref, supports <code>asChild</code> via Radix Slot, variants
        defined with CVA, themed through <code>--zen-*</code> CSS variables.
      </p>

      <section className="demo-section">
        <h2>1. Default Button</h2>
        <CodeExample
          title="Default"
          description={`Defaults to variant="solid" color="primary" size="md".`}
          code={`<Button onClick={() => alert("Clicked")}>Click me</Button>`}
        >
          <Button onClick={() => alert("Clicked")}>Click me</Button>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>2. Sizes</h2>
        <CodeExample
          title="xs · sm · md · lg · xl"
          code={`<Button size="xs">xs</Button>
<Button size="sm">sm</Button>
<Button size="md">md</Button>
<Button size="lg">lg</Button>
<Button size="xl">xl</Button>`}
        >
          {sizes.map((s) => (
            <Button key={s} size={s}>
              {s}
            </Button>
          ))}
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>3. Colors (solid variant)</h2>
        <CodeExample
          title="All six color tokens"
          description="Solid is the default variant. Colors map to --zen-color-* tokens — override those CSS variables to retheme."
          code={`<Button color="primary">primary</Button>
<Button color="neutral">neutral</Button>
<Button color="info">info</Button>
<Button color="success">success</Button>
<Button color="warning">warning</Button>
<Button color="error">error</Button>`}
        >
          {colors.map((c) => (
            <Button key={c} color={c}>
              {c}
            </Button>
          ))}
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>4. Soft variant</h2>
        <CodeExample
          title="Muted background with matching foreground"
          code={`<Button variant="soft" color="primary">primary</Button>
<Button variant="soft" color="neutral">neutral</Button>
<Button variant="soft" color="info">info</Button>
<Button variant="soft" color="success">success</Button>
<Button variant="soft" color="warning">warning</Button>
<Button variant="soft" color="error">error</Button>`}
        >
          {colors.map((c) => (
            <Button key={c} variant="soft" color={c}>
              {c}
            </Button>
          ))}
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>5. Outline variant</h2>
        <CodeExample
          title="Transparent background with colored border"
          code={`<Button variant="outline" color="primary">primary</Button>
<Button variant="outline" color="neutral">neutral</Button>
<Button variant="outline" color="info">info</Button>
<Button variant="outline" color="success">success</Button>
<Button variant="outline" color="warning">warning</Button>
<Button variant="outline" color="error">error</Button>`}
        >
          {colors.map((c) => (
            <Button key={c} variant="outline" color={c}>
              {c}
            </Button>
          ))}
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>6. Ghost variant</h2>
        <CodeExample
          title="No background until hovered"
          description={`A dashed-border variant is not provided — outline + a dashed-border className override works.`}
          code={`<Button variant="ghost" color="primary">primary</Button>
<Button variant="ghost" color="neutral">neutral</Button>
<Button variant="ghost" color="success">success</Button>
<Button variant="ghost" color="error">error</Button>`}
        >
          {colors.map((c) => (
            <Button key={c} variant="ghost" color={c}>
              {c}
            </Button>
          ))}
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>7. Link variant</h2>
        <CodeExample
          title="Inline-text affordance"
          code={`<Button variant="link" color="primary">Primary link</Button>
<Button variant="link" color="info">Info link</Button>
<Button variant="link" color="error">Error link</Button>`}
        >
          {colors.map((c) => (
            <Button key={c} variant="link" color={c}>
              {c} link
            </Button>
          ))}
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>8. Shapes</h2>
        <CodeExample
          title="default · square · circle · block"
          description={`Use shape="block" for full-width buttons.`}
          code={`<Button shape="square" aria-label="Settings">⚙</Button>
<Button shape="circle" aria-label="Add">+</Button>
<Button shape="block">Block / full width</Button>`}
        >
          <Button shape="square" aria-label="Settings">⚙</Button>
          <Button shape="circle" aria-label="Add">+</Button>
          <Button shape="block">Block / full width</Button>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>9. With icons</h2>
        <CodeExample
          title="iconLeft and iconRight props"
          description="Icons are passed as ReactNode props rather than embedded in children, so they don't interfere with asChild composition (Slottable handles this)."
          code={`<Button iconLeft={<DownloadIcon />}>Download</Button>
<Button variant="soft" color="success" iconRight={<ArrowRightIcon />}>
  Continue
</Button>
<Button shape="circle" aria-label="Search" iconLeft={<SearchIcon />} />`}
        >
          <Button iconLeft={<DownloadIcon />}>Download</Button>
          <Button variant="soft" color="success" iconRight={<ArrowRightIcon />}>
            Continue
          </Button>
          <Button shape="circle" aria-label="Search" iconLeft={<SearchIcon />} />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>10. Loading state</h2>
        <CodeExample
          title="Spinner replaces iconLeft; button is disabled while loading"
          code={`const [loading, setLoading] = useState(false);

<Button
  loading={loading}
  onClick={() => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  }}
>
  {loading ? "Working…" : "Trigger loading"}
</Button>`}
        >
          <Button
            loading={loading}
            onClick={() => {
              setLoading(true);
              setTimeout(() => setLoading(false), 1500);
            }}
          >
            {loading ? "Working…" : "Trigger loading"}
          </Button>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>11. Disabled</h2>
        <CodeExample
          title="Across every variant"
          code={`<Button disabled>solid</Button>
<Button variant="outline" disabled>outline</Button>
<Button variant="soft" disabled>soft</Button>
<Button variant="ghost" disabled>ghost</Button>
<Button variant="link" disabled>link</Button>`}
        >
          <Button disabled>solid</Button>
          <Button variant="outline" disabled>
            outline
          </Button>
          <Button variant="soft" disabled>
            soft
          </Button>
          <Button variant="ghost" disabled>
            ghost
          </Button>
          <Button variant="link" disabled>
            link
          </Button>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>12. asChild — render as any element</h2>
        <CodeExample
          title={`Project styles onto <a>, <NavLink>, etc. via Radix Slot`}
          description={`The slotted child must be an element that can accept children — so <a>, <NavLink>, <Link>, <button>, custom components work; void elements like <input>, <img>, <br>, <hr> do not (React will throw "void element ... must neither have children").`}
          code={`{/* Plain anchor — styles render onto the <a> tag */}
<Button asChild variant="outline">
  <a href="https://algorisys.com" target="_blank" rel="noreferrer">
    Open algorisys.com
  </a>
</Button>

{/* React Router NavLink — same pattern, full client-side routing */}
<Button asChild color="success">
  <NavLink to="/tooltip-new">Go to Tooltip demo</NavLink>
</Button>`}
        >
          <Button asChild variant="outline">
            <a href="https://algorisys.com" target="_blank" rel="noreferrer">
              Open algorisys.com
            </a>
          </Button>
          <Button asChild color="success">
            <NavLink to="/tooltip-new">Go to Tooltip demo</NavLink>
          </Button>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>13. Composition: Button + asChild + iconLeft</h2>
        <CodeExample
          title="Slottable lets icons coexist with a slotted child"
          description="Hands a single slot target to Radix while still rendering the icon as a sibling. Same pattern works when the Button is wrapped by a Radix Trigger."
          code={`<Button asChild variant="soft" color="primary" iconLeft={<ArrowRightIcon />}>
  <a href="/dashboard">Go to dashboard</a>
</Button>`}
        >
          <Button
            asChild
            variant="soft"
            color="primary"
            iconLeft={<ArrowRightIcon />}
          >
            <a href="#dashboard">Go to dashboard</a>
          </Button>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>14. forwardRef</h2>
        <CodeExample
          title="Programmatic focus from a parent component"
          description="Works with react-hook-form's register({ ref }) and any third-party library that needs an element ref."
          code={`const ref = useRef<HTMLButtonElement>(null);

<Button variant="ghost" onClick={() => ref.current?.focus()}>
  Focus the next button
</Button>
<Button ref={ref} color="success">
  I receive focus
</Button>`}
        >
          <Button variant="ghost" onClick={() => focusRef.current?.focus()}>
            Focus the next button
          </Button>
          <Button ref={focusRef} color="success">
            I receive focus
          </Button>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>15. Native button attributes (spread)</h2>
        <CodeExample
          title="form, name, type=submit/reset, aria-*, data-*, onClick, ..."
          description="ButtonProps extends React.ButtonHTMLAttributes — anything valid on <button> works as a prop."
          code={`<Button onClick={() => setCount((c) => c + 1)} aria-label="Increment counter">
  Count: {count}
</Button>
<Button type="reset" variant="ghost" color="neutral">Reset</Button>`}
        >
          <Button
            onClick={() => setCounter((c) => c + 1)}
            aria-label="Increment counter"
          >
            Count: {counter}
          </Button>
          <Button type="reset" variant="ghost" color="neutral">
            Reset
          </Button>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>16. Custom colors via className override</h2>
        <CodeExample
          title="Use cn / Tailwind / UnoCSS classes to override token-driven defaults"
          description="className is merged after the CVA output (tailwind-merge resolves conflicts), so consumer values win on collision."
          code={`<Button className="bg-purple-600 hover:bg-purple-700 text-white">
  Custom purple
</Button>
<Button className="bg-pink-500 hover:bg-pink-600 text-white border-2 border-pink-700">
  Pink with thick border
</Button>`}
        >
          <Button className="zen-bg-purple-600 hover:zen-bg-purple-700 zen-text-white">
            Custom purple
          </Button>
          <Button className="zen-bg-pink-500 hover:zen-bg-pink-600 zen-text-white zen-border-2 zen-border-pink-700">
            Pink with thick border
          </Button>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>17. Login / brand examples</h2>
        <CodeExample
          title="Composing icons + colors + variants for branded buttons"
          code={`<Button color="neutral" iconLeft={<GitHubIcon />}>Sign in with GitHub</Button>
<Button variant="outline" iconLeft={<GoogleIcon />}>Sign in with Google</Button>
<Button color="info" iconLeft={<MicrosoftIcon />}>Sign in with Microsoft</Button>`}
        >
          <Button color="neutral" iconLeft={<GitHubIcon />}>
            Sign in with GitHub
          </Button>
          <Button variant="outline" iconLeft={<GoogleIcon />}>
            Sign in with Google
          </Button>
          <Button color="info" iconLeft={<MicrosoftIcon />}>
            Sign in with Microsoft
          </Button>
        </CodeExample>
      </section>
    </div>
  );
};

/* ----------------------------- small inline icons (no external deps) ------ */
const DownloadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);
const ArrowRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);
const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const GitHubIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1.1-.8.1-.8.1-.8 1.2.1 1.9 1.3 1.9 1.3 1.1 1.9 2.9 1.4 3.6 1 .1-.8.4-1.4.8-1.7-2.7-.3-5.5-1.3-5.5-6 0-1.3.4-2.4 1.2-3.2-.1-.3-.6-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.7 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.7-2.9 5.7-5.6 6 .4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3" />
  </svg>
);
const GoogleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M21.35 11.1H12v3.2h5.35c-.25 1.4-1.7 4.1-5.35 4.1-3.2 0-5.8-2.65-5.8-5.9s2.6-5.9 5.8-5.9c1.85 0 3.05.8 3.75 1.45l2.55-2.45C16.85 4.15 14.65 3 12 3 6.95 3 2.85 7.05 2.85 12s4.1 9 9.15 9c5.3 0 8.8-3.7 8.8-8.9 0-.6-.05-1.05-.15-1.55" />
  </svg>
);
const MicrosoftIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M2 3h9v9H2zM13 3h9v9h-9zM2 13h9v9H2zM13 13h9v9h-9z" />
  </svg>
);

export default NewButtonDemo;
