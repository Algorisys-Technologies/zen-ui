import { DemoPage } from "./demo-helpers";

/**
 * ScrollArea demo — the web-components port. A consumer writes the sizing as
 * classes on the host: <zen-scroll-area class="zen-h-48 zen-w-64 …">. The
 * horizontal axis is added by slotting a <zen-scroll-bar orientation="horizontal">
 * child, mirroring the vanilla ScrollBar child.
 */

function scrollArea(cls: string, ...children: Node[]): HTMLElement {
  const a = document.createElement("zen-scroll-area");
  a.setAttribute("class", cls);
  a.append(...children);
  return a;
}

function horizontalBar(): HTMLElement {
  const b = document.createElement("zen-scroll-bar");
  b.setAttribute("orientation", "horizontal");
  return b;
}

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
    const el = document.createElement("div");
    el.textContent = `Item ${i + 1}`;
    list.appendChild(el);
  }
  return list;
}

/** A wide row of pills — enough to overflow horizontally. */
function wideTags(): HTMLElement {
  const rowEl = document.createElement("div");
  Object.assign(rowEl.style, { display: "flex", gap: "8px", padding: "12px" });
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
    rowEl.appendChild(tag);
  }
  return rowEl;
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
      "Custom scrollbars while preserving native scrolling (mouse, touch, keyboard, screen-reader). Hand-written — no primitive library, so this is what Radix was doing.",
    sections: [
      {
        title: "1. Vertical (default)",
        codeTitle: "zen-scroll-area ships a vertical scrollbar by default",
        code: `<zen-scroll-area class="zen-h-48 zen-w-64 zen-rounded-zen-md zen-border zen-border-zen-border zen-p-3">
  <!-- long list -->
</zen-scroll-area>`,
        render: () =>
          scrollArea(
            "zen-h-48 zen-w-64 zen-rounded-zen-md zen-border zen-border-zen-border zen-p-3",
            verticalList(),
          ),
      },
      {
        title: "2. Horizontal",
        codeTitle: 'Slot a <zen-scroll-bar orientation="horizontal"> for X-axis scrolling',
        code: `<zen-scroll-area class="zen-w-96 zen-rounded-zen-md zen-border zen-border-zen-border zen-whitespace-nowrap">
  <!-- wide tags -->
  <zen-scroll-bar orientation="horizontal"></zen-scroll-bar>
</zen-scroll-area>`,
        render: () =>
          scrollArea(
            "zen-w-96 zen-rounded-zen-md zen-border zen-border-zen-border zen-whitespace-nowrap",
            wideTags(),
            horizontalBar(),
          ),
      },
      {
        title: "3. Both axes",
        codeTitle: "Mount both vertical (default) and horizontal scrollbars",
        code: `<zen-scroll-area class="zen-h-64 zen-w-80 zen-rounded-zen-md zen-border zen-border-zen-border">
  <!-- wide content -->
  <zen-scroll-bar orientation="horizontal"></zen-scroll-bar>
</zen-scroll-area>`,
        render: () =>
          scrollArea(
            "zen-h-64 zen-w-80 zen-rounded-zen-md zen-border zen-border-zen-border",
            wideParagraphs(),
            horizontalBar(),
          ),
      },
    ],
  });
}
