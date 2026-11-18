import { Card, CardContent } from "../components/card/card";
import { Button } from "../components/button/button";
import { StatCard } from "../components/stat-card/stat-card";
import { Badge } from "../components/badge/badge";
import { DemoPage } from "./demo-helpers";

/**
 * Customizing — the three ways to change how a zen-ui component looks, and the
 * one place that does NOT work the way people assume (spacing is not
 * tokenised). Everything claimed here is demonstrated live on the page rather
 * than described, because a customisation guide that is wrong is worse than
 * none. The vanilla mirror of the React page: `class` where React says
 * `className`.
 */

/** A wrapping row with the reference's 16px gap. */
const row = (children: Node[]): HTMLElement => {
  const d = document.createElement("div");
  d.style.display = "flex";
  d.style.flexWrap = "wrap";
  d.style.gap = "16px";
  d.style.alignItems = "flex-start";
  d.style.width = "100%";
  d.append(...children);
  return d;
};

/**
 * A Card at a fixed demo width holding one line of text. The width is written to
 * the element directly: `el` is a plain node the caller owns, and the width is
 * demo layout, not part of what the section is demonstrating.
 */
const card = (text: string, width: number, opts: { padding?: "sm" | "md" | "lg"; class?: string } = {}): HTMLElement => {
  const c = Card({
    padding: opts.padding ?? "md",
    class: opts.class,
    children: CardContent({ class: "zen-p-0", children: text }),
  });
  c.el.style.width = `${width}px`;
  return c.el;
};

const caption = (text: string): HTMLElement => {
  const s = document.createElement("span");
  s.className = "zen-text-xs zen-text-zen-muted-fg";
  s.textContent = text;
  return s;
};

/** Caption over a Button + Badge pair, optionally with token overrides on the column. */
const tokenColumn = (label: string, tokens: Record<string, string> = {}): HTMLElement => {
  const col = document.createElement("div");
  col.style.display = "flex";
  col.style.flexDirection = "column";
  col.style.gap = "8px";
  // A real override, not a screenshot: same components, different tokens.
  for (const [k, v] of Object.entries(tokens)) col.style.setProperty(k, v);
  const pair = document.createElement("div");
  pair.style.display = "flex";
  pair.style.gap = "8px";
  pair.style.alignItems = "center";
  pair.append(Button({ size: "sm", children: "Button" }).el, Badge({ children: "Badge" }).el);
  col.append(caption(label), pair);
  return col;
};

export default function CustomizingDemo(): HTMLElement {
  return DemoPage({
    title: "Customizing",
    description:
      "Three ways to change how a component looks, in the order you should reach for them: a prop if one exists, a class for this one instance, a token to move the whole system. The first two are local, the third is global — most mistakes are reaching for the wrong one.",
    sections: [
      {
        title: "1. Props first",
        codeTitle: "If a prop exists, it is the answer",
        codeDescription:
          "Padding, size and colour are props on the components that have them. Reach for a class only when no prop covers what you need — a prop is API and will keep working; a class is a wager on internals.",
        code: `Card({ padding: "sm", children: … });
Card({ padding: "lg", children: … });

Button({ size: "sm", children: "Small" });
StatCard({ label: "Churn", value: "3.1%", color: "error" });`,
        render: () =>
          row([
            card('padding="sm"', 150, { padding: "sm" }),
            card('padding="lg"', 150, { padding: "lg" }),
            Button({ size: "sm", children: 'size="sm"' }).el,
            Button({ size: "lg", children: 'size="lg"' }).el,
          ]),
      },
      {
        title: "2. Classes, for one instance",
        codeTitle: "class replaces our utility — it does not fight it",
        codeDescription:
          "Every component merges your class through cn(), which is tailwind-merge taught about the zen- prefix. Passing zen-p-8 to a component whose padding is zen-p-5 REPLACES it: only one padding class survives, so there is no specificity race and no !important. Your own unprefixed classes win too.",
        code: `// the component's own padding is replaced, not appended
Card({ class: "zen-p-8" });

// works for anything: spacing, radius, colour, shadow, type
Card({ class: "zen-rounded-zen-full zen-bg-zen-primary-soft" });

// cn("zen-p-5", "zen-p-8")  ->  "zen-p-8"
// cn("zen-p-5", "p-8")      ->  "p-8"      (your own class wins)`,
        render: () =>
          row([
            card("default", 150),
            card("zen-p-8", 150, { class: "zen-p-8" }),
            card("rounded-full + soft", 190, {
              class: "zen-rounded-zen-full zen-bg-zen-primary-soft zen-border-zen-primary",
            }),
          ]),
      },
      {
        title: "3. Tokens, for the whole system",
        codeTitle: "Override --zen-* and every component follows",
        codeDescription:
          "Colour, radius and shadow utilities compile to var(--zen-*), so setting a token retints everything under that scope — no props, no classes, no rebuild. Set them on :root for the app, or on any element to re-theme one subtree, which is exactly what the panel on the right does.",
        code: `/* app-wide */
:root {
  --zen-color-primary: #7c3aed;
  --zen-radius-md: 2px;
}

// or scoped to a subtree
const scope = document.createElement("div");
scope.style.setProperty("--zen-color-primary", "#7c3aed");
scope.style.setProperty("--zen-radius-md", "2px");
scope.append(Button({ children: "Inherits the override" }).el);`,
        render: () =>
          row([
            tokenColumn("default tokens"),
            tokenColumn("--zen-color-primary + --zen-radius-*", {
              "--zen-color-primary": "#7c3aed",
              "--zen-radius-md": "2px",
              "--zen-radius-full": "2px",
            }),
          ]),
      },
      {
        title: "4. What tokens do NOT cover",
        codeTitle: "Spacing is per-instance, not global",
        codeDescription:
          "--zen-space-* exists in tokens.css, but the utilities do not use it: zen-p-4 compiles to padding:1rem, a literal, while zen-rounded-zen-md compiles to var(--zen-radius-md). So overriding --zen-space-4 changes nothing. To change spacing, use a prop or a class. This is the one place the token story does not go — worth knowing before you spend an afternoon on it.",
        code: `/* compiled output — the difference that matters */
.zen-p-4              { padding: 1rem }                       /* literal   */
.zen-rounded-zen-md   { border-radius: var(--zen-radius-md) } /* token     */
.zen-bg-zen-primary   { background: var(--zen-color-primary) }/* token     */

/* so this does nothing: */
:root { --zen-space-4: 3rem; }

// do this instead:
Card({ class: "zen-p-8" });`,
        render: () => {
          const scope = document.createElement("div");
          scope.style.setProperty("--zen-space-4", "3rem");
          scope.append(card("--zen-space-4: 3rem — unchanged", 210, { class: "zen-p-4" }));
          return row([scope, card("zen-p-8 — changed", 210, { class: "zen-p-8" })]);
        },
      },
      {
        title: "5. Writing zen- classes",
        codeTitle: "The prefix sits on the utility, variants sit outside it",
        codeDescription:
          "Utilities are prefixed zen-. Variants, negation and important are NOT part of the prefix — they wrap it. Getting this wrong produces a class that matches nothing, generates no CSS, and fails silently: the build stays green and the style is simply absent.",
        code: `hover:zen-bg-zen-primary     ✓   variant outside the prefix
-zen-mt-2                    ✓   negation outside
!zen-p-4                     ✓   important outside
data-[state=open]:zen-p-4    ✓   data variant outside
zen-[grid-template-columns:1fr_2fr]  ✓  prefix before the bracket

zen-hover:bg-zen-primary     ✗   generates nothing, silently
zen--mt-2                    ✗   same`,
        render: () =>
          row([
            Button({
              size: "sm",
              class: "hover:zen-bg-zen-error hover:zen-text-zen-error-fg",
              children: "Hover me",
            }).el,
            StatCard({
              label: "With a class override",
              value: "42",
              class: "zen-max-w-56 zen-rounded-zen-full zen-border-zen-primary",
            }).el,
          ]),
      },
    ],
  });
}
