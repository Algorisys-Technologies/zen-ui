import { Stack } from "./stack/stack";
import { DemoPage } from "./demo-helpers";

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
        codeDescription: "gap and padding take a number (px) or any CSS length.",
        code: `Stack({
  gap: 8,
  children: [Box("First"), Box("Second"), Box("Third")],
});`,
        render: () =>
          Frame(
            Stack({ gap: 8, padding: 12, children: [Box("First"), Box("Second"), Box("Third")] }).el,
          ),
      },
      {
        title: "2. Row",
        codeTitle: 'direction: "row"',
        code: `Stack({
  direction: "row",
  gap: 8,
  children: [Box("One"), Box("Two"), Box("Three")],
});`,
        render: () =>
          Frame(
            Stack({
              direction: "row",
              gap: 8,
              padding: 12,
              children: [Box("One"), Box("Two"), Box("Three")],
            }).el,
          ),
      },
      {
        title: "3. Cross-axis alignment",
        codeTitle: "align: start | center | end | stretch",
        code: `Stack({ direction: "row", align: "center", gap: 8, children: [...] });`,
        render: () =>
          grid(
            ALIGN.map((align) =>
              Frame(
                Stack({
                  direction: "row",
                  align,
                  gap: 8,
                  padding: 12,
                  class: "zen-h-24",
                  children: [Box(`align="${align}"`), Box("b"), Box("c")],
                }).el,
              ),
            ),
          ),
      },
      {
        title: "4. Main-axis distribution",
        codeTitle: "justify: start | center | end | between",
        code: `Stack({ direction: "row", justify: "between", gap: 8, children: [...] });`,
        render: () =>
          grid(
            JUSTIFY.map((justify) =>
              Frame(
                Stack({
                  direction: "row",
                  justify,
                  gap: 8,
                  padding: 12,
                  children: [Box(`justify="${justify}"`), Box("b"), Box("c")],
                }).el,
              ),
            ),
          ),
      },
      {
        title: "5. Wrapping",
        codeTitle: "wrap lets a row spill onto the next line",
        code: `Stack({
  direction: "row",
  wrap: true,
  gap: 8,
  children: items.map((i) => Box(i)),
});`,
        render: () =>
          Frame(
            Stack({
              direction: "row",
              wrap: true,
              gap: 8,
              padding: 12,
              children: Array.from({ length: 14 }, (_, i) => Box(`Item ${i + 1}`)),
            }).el,
          ),
      },
      {
        title: "6. Nesting + CSS lengths",
        codeTitle: "Stacks compose; gap/padding accept any CSS length",
        code: `Stack({
  gap: "1rem",
  padding: "1rem",
  children: [
    Stack({
      direction: "row",
      justify: "between",
      align: "center",
      children: [billing, badge],
    }).el,
    Stack({
      direction: "row",
      gap: "0.5rem",
      children: [save, cancel],
    }).el,
  ],
});`,
        render: () => {
          const billing = document.createElement("strong");
          billing.className = "zen-text-sm zen-text-zen-foreground";
          billing.textContent = "Billing";
          const badge = document.createElement("span");
          badge.className = "zen-text-xs zen-text-zen-muted-fg";
          badge.textContent = "Active";
          return Frame(
            Stack({
              gap: "1rem",
              padding: "1rem",
              children: [
                Stack({
                  direction: "row",
                  justify: "between",
                  align: "center",
                  children: [billing, badge],
                }).el,
                Stack({
                  direction: "row",
                  gap: "0.5rem",
                  children: [Box("Save"), Box("Cancel")],
                }).el,
              ],
            }).el,
          );
        },
      },
    ],
  });
}
