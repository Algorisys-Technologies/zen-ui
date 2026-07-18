import { Link } from "react-router-dom";
import { NAV } from "../nav";
import { useTheme } from "../lib/theme";

/**
 * Landing page for the demo app.
 *
 * Renders its catalogue from ../nav — the same list the sidebar uses — so the
 * two cannot drift. It previously kept a hand-maintained copy and had fallen 16
 * components behind.
 *
 * Styled with zen-* utilities and --zen-* tokens only: no inline rem values.
 * The old version hard-coded sizes like `fontSize: "3.6rem"` on the assumption
 * that the app forced `html { font-size: 62.5% }` (1rem = 10px). The library no
 * longer imposes that on its consumers, so those magic numbers stopped meaning
 * what they said.
 */

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <h2 className="zen-mb-3 zen-mt-0 zen-text-xs zen-font-semibold zen-uppercase zen-tracking-wide zen-text-zen-muted-fg">
    {children}
  </h2>
);

const Welcome = () => {
  const { themes } = useTheme();
  const groups = NAV.filter((g) => g.catalogue !== false);
  const total = groups.reduce((n, g) => n + g.items.length, 0);

  return (
    <div className="zen-mx-auto zen-max-w-5xl zen-px-6 zen-py-10">
      <header className="zen-mb-10">
        <h1 className="zen-m-0 zen-text-3xl zen-font-bold zen-tracking-tight zen-text-zen-foreground">
          Zen UI Component Library
        </h1>
        <p className="zen-mb-0 zen-mt-3 zen-max-w-2xl zen-text-sm zen-leading-relaxed zen-text-zen-muted-fg">
          shadcn-style primitives on top of Radix UI, themed entirely through{" "}
          <code>--zen-*</code> custom properties. Every component forwards a ref,
          supports <code>asChild</code> where it makes sense, and exposes a flat
          React-idiomatic prop API with no JSON-config layer.
        </p>
      </header>

      <section className="zen-mb-10">
        <SectionLabel>Themes</SectionLabel>
        <div className="zen-grid zen-grid-cols-1 zen-gap-3 sm:zen-grid-cols-3">
          {themes.map((t) => (
            <div
              key={t.name}
              data-theme={t.name}
              className="zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-p-3 zen-shadow-zen-sm"
            >
              <div className="zen-text-sm zen-font-medium zen-text-zen-foreground">
                {t.label}
              </div>
              <div className="zen-my-2 zen-flex zen-gap-2">
                {t.preview.map((c) => (
                  <span
                    key={c}
                    className="zen-h-5 zen-w-5 zen-rounded-zen-full zen-border zen-border-zen-border"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <div className="zen-text-xs zen-text-zen-muted-fg">
                {t.description}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionLabel>Components ({total})</SectionLabel>
        {groups.map((group) => (
          <div key={group.title} className="zen-mb-8">
            <h3 className="zen-mb-3 zen-mt-0 zen-text-sm zen-font-semibold zen-text-zen-foreground">
              {group.title}
              <span className="zen-ml-2 zen-font-normal zen-text-zen-muted-fg">
                {group.items.length}
              </span>
            </h3>
            <div className="zen-grid zen-grid-cols-1 zen-gap-3 sm:zen-grid-cols-2 lg:zen-grid-cols-3">
              {group.items.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="zen-block zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-p-4 zen-no-underline zen-transition-colors hover:zen-border-zen-primary focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2"
                >
                  <div className="zen-text-sm zen-font-semibold zen-text-zen-foreground">
                    {item.label}
                  </div>
                  <p className="zen-mb-0 zen-mt-1 zen-text-xs zen-leading-relaxed zen-text-zen-muted-fg">
                    {item.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};

export default Welcome;
