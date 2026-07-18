import { Page, Bar } from "./page/page";
import { Button } from "./button/button";
import { Icon } from "./icon/icon";
import { DemoPage } from "./demo-helpers";

/**
 * PageDemo — the Page + Bar structural frame. The React binding ships no demo
 * page for this family; this exercises both pieces the way the frame components
 * (ShellBar, DynamicPage) assume them: Page as the header/content/footer scroll
 * container, Bar as the three-slot (start / middle / end) row.
 */

const el = (tag: string, className: string, text?: string): HTMLElement => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};

const title = (text: string): HTMLElement => el("span", "zen-text-sm zen-font-semibold", text);

/** A short block of filler paragraphs so the content pane has something to scroll. */
const filler = (n: number): HTMLElement => {
  const wrap = el("div", "zen-flex zen-flex-col zen-gap-3");
  for (let i = 0; i < n; i += 1) {
    wrap.append(
      el(
        "p",
        "zen-text-sm zen-text-zen-muted-fg zen-m-0",
        `Row ${i + 1}. Only the content pane scrolls — the header and footer stay put.`,
      ),
    );
  }
  return wrap;
};

/** A fixed-height frame so the Page's internal scroll is visible inside the demo. */
const frame = (child: Node): HTMLElement => {
  const box = el(
    "div",
    "zen-h-80 zen-w-full zen-overflow-hidden zen-rounded-zen-md zen-border zen-border-zen-border",
  );
  box.append(child);
  return box;
};

export default function PageDemo(): HTMLElement {
  return DemoPage({
    title: "Page + Bar",
    description:
      "The two small structural pieces of the frame. Page is a whole-screen container — header / content / footer, where ONLY the content scrolls. Bar is the three-slot (start / middle / end) row used for headers, subheaders and footers; the middle stays optically centred no matter how wide the sides are.",
    sections: [
      {
        title: "1. Page — header, scrolling content, footer",
        codeTitle: "Page({ header, footer, children })",
        codeDescription:
          "h-full, not min-h-full: the content pane is the only scroller, so the header and footer never move.",
        code: `Page({
  header: Bar({
    design: "header",
    startContent: title("Invoices"),
    endContent: Button({ size: "sm", children: "New" }),
  }),
  footer: Bar({
    design: "footer",
    startContent: span("128 items"),
    endContent: Button({ size: "sm", variant: "outline", color: "neutral", children: "Export" }),
  }),
  children: filler(12),
});`,
        render: () =>
          frame(
            Page({
              header: Bar({
                design: "header",
                startContent: title("Invoices"),
                endContent: Button({ size: "sm", children: "New" }),
              }),
              footer: Bar({
                design: "footer",
                startContent: el("span", "zen-text-sm zen-text-zen-muted-fg", "128 items"),
                endContent: Button({
                  size: "sm",
                  variant: "outline",
                  color: "neutral",
                  children: "Export",
                }),
              }),
              children: filler(12),
            }).el,
          ),
      },
      {
        title: "2. Page — flush content",
        codeTitle: 'flush removes the content padding',
        codeDescription: "For a full-bleed table or map, where the content owns its own edges.",
        code: `Page({
  flush: true,
  header: Bar({ design: "header", startContent: title("Full-bleed") }),
  children: fullBleedRows(),
});`,
        render: () =>
          frame(
            Page({
              flush: true,
              header: Bar({ design: "header", startContent: title("Full-bleed") }),
              children: (() => {
                const list = el("div", "");
                for (let i = 0; i < 12; i += 1) {
                  list.append(
                    el(
                      "div",
                      "zen-border-b zen-border-zen-border zen-px-4 zen-py-3 zen-text-sm",
                      `Edge-to-edge row ${i + 1}`,
                    ),
                  );
                }
                return list;
              })(),
            }).el,
          ),
      },
      {
        title: "3. Bar — the three designs",
        codeTitle: 'design="header" · "subheader" · "footer"',
        codeDescription:
          "Header and subheader carry a bottom border; footer a top border. Subheader sits on the muted surface.",
        code: `Bar({ design: "header",    startContent: title("Header"),    endContent: Button({ size: "sm", children: "Action" }) });
Bar({ design: "subheader", startContent: title("Subheader"), endContent: Button({ size: "sm", variant: "outline", color: "neutral", children: "Filter" }) });
Bar({ design: "footer",    startContent: span("Footer"),      endContent: Button({ size: "sm", children: "Save" }) });`,
        render: () => {
          const stack = el("div", "zen-flex zen-flex-col zen-w-full zen-rounded-zen-md zen-overflow-hidden zen-border zen-border-zen-border");
          stack.append(
            Bar({
              design: "header",
              startContent: title("Header"),
              endContent: Button({ size: "sm", children: "Action" }),
            }).el,
            Bar({
              design: "subheader",
              startContent: title("Subheader"),
              endContent: Button({
                size: "sm",
                variant: "outline",
                color: "neutral",
                children: "Filter",
              }),
            }).el,
            Bar({
              design: "footer",
              startContent: el("span", "zen-text-sm zen-text-zen-muted-fg", "Footer"),
              endContent: Button({ size: "sm", children: "Save" }),
            }).el,
          );
          return stack;
        },
      },
      {
        title: "4. Bar — the middle stays centred",
        codeTitle: "start / middle / end",
        codeDescription:
          "Equal flex-1 on the outer slots keeps the middle optically centred even when the two sides differ in width.",
        code: `Bar({
  design: "header",
  startContent: Button({ size: "sm", variant: "ghost", children: Icon({ name: "menu" }) }),
  middleContent: title("Dashboard"),
  endContent: [
    Button({ size: "sm", variant: "ghost", children: Icon({ name: "search" }) }),
    Button({ size: "sm", variant: "ghost", children: Icon({ name: "bell" }) }),
  ],
});`,
        render: () => {
          const wrap = el("div", "zen-w-full zen-rounded-zen-md zen-overflow-hidden zen-border zen-border-zen-border");
          wrap.append(
            Bar({
              design: "header",
              startContent: Button({
                size: "sm",
                variant: "ghost",
                children: Icon({ name: "menu", title: "Menu" }),
              }),
              middleContent: title("Dashboard"),
              endContent: [
                Button({
                  size: "sm",
                  variant: "ghost",
                  children: Icon({ name: "search", title: "Search" }),
                }),
                Button({
                  size: "sm",
                  variant: "ghost",
                  children: Icon({ name: "bell", title: "Notifications" }),
                }),
              ],
            }).el,
          );
          return wrap;
        },
      },
    ],
  });
}
