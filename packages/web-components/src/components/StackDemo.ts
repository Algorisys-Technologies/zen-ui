import { DemoPage } from "./demo-helpers";

/**
 * Stack demo — the web-components port. <zen-stack> lays its slotted children out
 * in a row or column. `gap`/`padding` are CSS-length attributes (write "8px", not
 * a bare number). The host is set to display:grid so the inner flex row/column
 * fills the frame; where alignment needs vertical room, the host is given a height.
 */

interface StackAttrs {
  direction?: "row";
  align?: string;
  justify?: string;
  wrap?: boolean;
  gap?: string;
  padding?: string;
  height?: string;
}

function stack(attrs: StackAttrs, ...children: Node[]): HTMLElement {
  const s = document.createElement("zen-stack");
  if (attrs.direction) s.setAttribute("direction", attrs.direction);
  if (attrs.align) s.setAttribute("align", attrs.align);
  if (attrs.justify) s.setAttribute("justify", attrs.justify);
  if (attrs.wrap) s.setAttribute("wrap", "");
  if (attrs.gap) s.setAttribute("gap", attrs.gap);
  if (attrs.padding) s.setAttribute("padding", attrs.padding);
  s.style.display = "grid";
  if (attrs.height) s.style.height = attrs.height;
  s.append(...children);
  return s;
}

/** Filler block so each Stack's layout is visible. Prefixed utilities only. */
const Box = (text: string): HTMLElement => {
  const d = document.createElement("div");
  d.className =
    "zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-muted zen-px-3 zen-py-2 zen-text-sm zen-text-zen-foreground";
  d.textContent = text;
  return d;
};

/** Outlined frame, so `justify`/`align` have a visible box to work against. */
const Frame = (child: Node): HTMLElement => {
  const d = document.createElement("div");
  d.className = "zen-w-full zen-rounded-zen-md zen-border zen-border-zen-border zen-border-dashed";
  d.append(child);
  return d;
};

/** Vertical grid wrapper so a set of Frames stack with even spacing. */
const grid = (children: Node[]): HTMLElement => {
  const d = document.createElement("div");
  d.style.display = "grid";
  d.style.gap = "0.75rem";
  d.style.width = "100%";
  d.append(...children);
  return d;
};

const ALIGN = ["start", "center", "end", "stretch"] as const;
const JUSTIFY = ["start", "center", "end", "between"] as const;

export default function StackDemo(): HTMLElement {
  return DemoPage({
    title: "Stack",
    description:
      "Minimal flexbox layout primitive — a thin div that lays its children out in a row or column with configurable alignment, wrapping, gap and padding. Useful as a generic container / drop-target surface (e.g. in low-code builders) and for everyday form/section layout without hand-writing flex utilities.",
    sections: [
      {
        title: "1. Column (default)",
        codeTitle: "direction defaults to column",
        codeDescription: "gap and padding take any CSS length.",
        code: `<zen-stack gap="8px" padding="12px">
  <div>First</div><div>Second</div><div>Third</div>
</zen-stack>`,
        render: () => Frame(stack({ gap: "8px", padding: "12px" }, Box("First"), Box("Second"), Box("Third"))),
      },
      {
        title: "2. Row",
        codeTitle: 'direction="row"',
        code: `<zen-stack direction="row" gap="8px" padding="12px">
  <div>One</div><div>Two</div><div>Three</div>
</zen-stack>`,
        render: () =>
          Frame(stack({ direction: "row", gap: "8px", padding: "12px" }, Box("One"), Box("Two"), Box("Three"))),
      },
      {
        title: "3. Cross-axis alignment",
        codeTitle: "align: start | center | end | stretch",
        code: `<zen-stack direction="row" align="center" gap="8px" padding="12px">…</zen-stack>`,
        render: () =>
          grid(
            ALIGN.map((align) =>
              Frame(
                stack(
                  { direction: "row", align, gap: "8px", padding: "12px", height: "6rem" },
                  Box(`align="${align}"`),
                  Box("b"),
                  Box("c"),
                ),
              ),
            ),
          ),
      },
      {
        title: "4. Main-axis distribution",
        codeTitle: "justify: start | center | end | between",
        code: `<zen-stack direction="row" justify="between" gap="8px" padding="12px">…</zen-stack>`,
        render: () =>
          grid(
            JUSTIFY.map((justify) =>
              Frame(
                stack(
                  { direction: "row", justify, gap: "8px", padding: "12px" },
                  Box(`justify="${justify}"`),
                  Box("b"),
                  Box("c"),
                ),
              ),
            ),
          ),
      },
      {
        title: "5. Wrapping",
        codeTitle: "wrap lets a row spill onto the next line",
        code: `<zen-stack direction="row" wrap gap="8px" padding="12px">…many items…</zen-stack>`,
        render: () =>
          Frame(
            stack(
              { direction: "row", wrap: true, gap: "8px", padding: "12px" },
              ...Array.from({ length: 14 }, (_, i) => Box(`Item ${i + 1}`)),
            ),
          ),
      },
      {
        title: "6. Nesting + CSS lengths",
        codeTitle: "Stacks compose; gap/padding accept any CSS length",
        code: `<zen-stack gap="1rem" padding="1rem">
  <zen-stack direction="row" justify="between" align="center">…</zen-stack>
  <zen-stack direction="row" gap="0.5rem">…</zen-stack>
</zen-stack>`,
        render: () => {
          const billing = document.createElement("strong");
          billing.className = "zen-text-sm zen-text-zen-foreground";
          billing.textContent = "Billing";
          const badge = document.createElement("span");
          badge.className = "zen-text-xs zen-text-zen-muted-fg";
          badge.textContent = "Active";
          return Frame(
            stack(
              { gap: "1rem", padding: "1rem" },
              stack({ direction: "row", justify: "between", align: "center" }, billing, badge),
              stack({ direction: "row", gap: "0.5rem" }, Box("Save"), Box("Cancel")),
            ),
          );
        },
      },
    ],
  });
}
