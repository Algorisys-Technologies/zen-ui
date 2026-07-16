import { ScrollArea, ScrollBar } from "./scroll-area/scroll-area";
import { DemoPage } from "./demo-helpers";

/** A tall column of numbered rows — enough to overflow vertically. */
function verticalList(): HTMLElement {
  const list = document.createElement("div");
  Object.assign(list.style, {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    fontSize: "0.8125rem",
  });
  for (let i = 0; i < 40; i++) {
    const row = document.createElement("div");
    row.textContent = `Item ${i + 1}`;
    list.appendChild(row);
  }
  return list;
}

/** A wide row of pills — enough to overflow horizontally. */
function wideTags(): HTMLElement {
  const row = document.createElement("div");
  Object.assign(row.style, { display: "flex", gap: "8px", padding: "12px" });
  for (let i = 0; i < 20; i++) {
    const tag = document.createElement("span");
    tag.textContent = `tag-${i + 1}`;
    Object.assign(tag.style, {
      background: "var(--zen-color-primary-soft)",
      color: "var(--zen-color-primary-soft-fg)",
      padding: "0.25rem 0.5rem",
      borderRadius: "9999px",
      fontSize: "0.8125rem",
      whiteSpace: "nowrap",
    });
    row.appendChild(tag);
  }
  return row;
}

/** A block wider than the viewport with several paragraphs — overflows both ways. */
function wideParagraphs(): HTMLElement {
  const block = document.createElement("div");
  Object.assign(block.style, {
    width: "800px",
    padding: "12px",
    fontSize: "0.8125rem",
    lineHeight: "1.8",
  });
  for (let i = 0; i < 12; i++) {
    const p = document.createElement("p");
    p.style.margin = "0 0 0.625rem 0";
    p.textContent =
      `Line ${i + 1}: Lorem ipsum dolor sit amet consectetur adipiscing elit, ` +
      "sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim " +
      "ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip " +
      "ex ea commodo consequat.";
    block.appendChild(p);
  }
  return block;
}

export default function ScrollAreaDemo(): HTMLElement {
  return DemoPage({
    title: "ScrollArea",
    description:
      "Custom scrollbars while preserving native scrolling (mouse, touch, keyboard, screen-reader). Hand-written — no primitive library, so this file is what Radix was doing.",
    sections: [
      {
        title: "1. Vertical (default)",
        codeTitle: "ScrollArea ships a vertical scrollbar by default",
        code: `const area = ScrollArea({
  class: "zen-h-48 zen-w-64 zen-rounded-zen-md zen-border zen-border-zen-border zen-p-3",
  children: longList,
});
document.body.append(area.el);`,
        render: () =>
          ScrollArea({
            class: "zen-h-48 zen-w-64 zen-rounded-zen-md zen-border zen-border-zen-border zen-p-3",
            children: verticalList(),
          }).el,
      },
      {
        title: "2. Horizontal",
        codeTitle: 'Pass ScrollBar({ orientation: "horizontal" }) for X-axis scrolling',
        code: `ScrollArea({
  class: "zen-w-96 zen-rounded-zen-md zen-border zen-border-zen-border zen-whitespace-nowrap",
  children: [wideTags, ScrollBar({ orientation: "horizontal" })],
});`,
        render: () =>
          ScrollArea({
            class: "zen-w-96 zen-rounded-zen-md zen-border zen-border-zen-border zen-whitespace-nowrap",
            children: [wideTags(), ScrollBar({ orientation: "horizontal" })],
          }).el,
      },
      {
        title: "3. Both axes",
        codeTitle: "Mount both vertical (default) and horizontal scrollbars",
        code: `ScrollArea({
  class: "zen-h-64 zen-w-80 zen-rounded-zen-md zen-border zen-border-zen-border",
  children: [wideContent, ScrollBar({ orientation: "horizontal" })],
});`,
        render: () =>
          ScrollArea({
            class: "zen-h-64 zen-w-80 zen-rounded-zen-md zen-border zen-border-zen-border",
            children: [wideParagraphs(), ScrollBar({ orientation: "horizontal" })],
          }).el,
      },
    ],
  });
}
