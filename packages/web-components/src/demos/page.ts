import { DemoPage } from "./demo-helpers";

/**
 * PageDemo — the Page + Bar structural frame, ported to the custom elements.
 * <zen-page> carries `header`/`footer` as JS properties (Bar nodes) and content
 * as its children slot; <zen-bar> carries `start`/`middle`/`end` content as JS
 * properties (it renders no children slot) and `design` as an attribute.
 *
 * The host is set to fill its frame (display:block; height:100%) so the Page's
 * internal h-full scroller has a definite height to resolve against.
 */

const el = (tag: string, className: string, text?: string): HTMLElement => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};

const title = (text: string): HTMLElement => el("span", "zen-text-sm zen-font-semibold", text);

function btn(attrs: Record<string, string>, ...children: (string | Node)[]): HTMLElement {
  const b = document.createElement("zen-button");
  for (const [k, v] of Object.entries(attrs)) b.setAttribute(k, v);
  b.append(...children);
  return b;
}

function icon(name: string, iconTitle: string): HTMLElement {
  const i = document.createElement("zen-icon");
  i.setAttribute("name", name);
  i.setAttribute("title", iconTitle);
  return i;
}

interface BarSlots {
  start?: Node;
  middle?: Node;
  end?: Node | Node[];
}

function bar(design: string, slots: BarSlots): HTMLElement {
  const b = document.createElement("zen-bar");
  b.setAttribute("design", design);
  if (slots.start) (b as unknown as { startContent: Node }).startContent = slots.start;
  if (slots.middle) (b as unknown as { middleContent: Node }).middleContent = slots.middle;
  if (slots.end) (b as unknown as { endContent: Node | Node[] }).endContent = slots.end;
  return b;
}

interface PageOpts {
  flush?: boolean;
  header?: Node;
  footer?: Node;
  children: Node;
}

function page(opts: PageOpts): HTMLElement {
  const p = document.createElement("zen-page");
  if (opts.flush) p.setAttribute("flush", "");
  if (opts.header) (p as unknown as { header: Node }).header = opts.header;
  if (opts.footer) (p as unknown as { footer: Node }).footer = opts.footer;
  p.append(opts.children);
  p.style.display = "block";
  p.style.height = "100%";
  return p;
}

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
        codeTitle: "zen-page with header / footer / content",
        codeDescription:
          "h-full, not min-h-full: the content pane is the only scroller, so the header and footer never move.",
        code: `const p = document.createElement("zen-page");
p.header = bar("header", { start: title("Invoices"), end: newButton });
p.footer = bar("footer", { start: span("128 items"), end: exportButton });
p.append(content);`,
        render: () =>
          frame(
            page({
              header: bar("header", {
                start: title("Invoices"),
                end: btn({ size: "sm" }, "New"),
              }),
              footer: bar("footer", {
                start: el("span", "zen-text-sm zen-text-zen-muted-fg", "128 items"),
                end: btn({ size: "sm", variant: "outline", color: "neutral" }, "Export"),
              }),
              children: filler(12),
            }),
          ),
      },
      {
        title: "2. Page — flush content",
        codeTitle: "flush removes the content padding",
        codeDescription: "For a full-bleed table or map, where the content owns its own edges.",
        code: `<zen-page flush>…</zen-page>
p.header = bar("header", { start: title("Full-bleed") });`,
        render: () =>
          frame(
            page({
              flush: true,
              header: bar("header", { start: title("Full-bleed") }),
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
            }),
          ),
      },
      {
        title: "3. Bar — the three designs",
        codeTitle: 'design="header" · "subheader" · "footer"',
        codeDescription:
          "Header and subheader carry a bottom border; footer a top border. Subheader sits on the muted surface.",
        code: `<zen-bar design="header"></zen-bar>
<zen-bar design="subheader"></zen-bar>
<zen-bar design="footer"></zen-bar>
<!-- start/middle/end content set via el.startContent = … -->`,
        render: () => {
          const stack = el(
            "div",
            "zen-flex zen-flex-col zen-w-full zen-rounded-zen-md zen-overflow-hidden zen-border zen-border-zen-border",
          );
          stack.append(
            bar("header", { start: title("Header"), end: btn({ size: "sm" }, "Action") }),
            bar("subheader", {
              start: title("Subheader"),
              end: btn({ size: "sm", variant: "outline", color: "neutral" }, "Filter"),
            }),
            bar("footer", {
              start: el("span", "zen-text-sm zen-text-zen-muted-fg", "Footer"),
              end: btn({ size: "sm" }, "Save"),
            }),
          );
          return stack;
        },
      },
      {
        title: "4. Bar — the middle stays centred",
        codeTitle: "start / middle / end",
        codeDescription:
          "Equal flex-1 on the outer slots keeps the middle optically centred even when the two sides differ in width.",
        code: `const b = document.createElement("zen-bar");
b.setAttribute("design", "header");
b.startContent = menuButton;
b.middleContent = title("Dashboard");
b.endContent = [searchButton, bellButton];`,
        render: () => {
          const wrap = el(
            "div",
            "zen-w-full zen-rounded-zen-md zen-overflow-hidden zen-border zen-border-zen-border",
          );
          wrap.append(
            bar("header", {
              start: btn({ size: "sm", variant: "ghost" }, icon("menu", "Menu")),
              middle: title("Dashboard"),
              end: [
                btn({ size: "sm", variant: "ghost" }, icon("search", "Search")),
                btn({ size: "sm", variant: "ghost" }, icon("bell", "Notifications")),
              ],
            }),
          );
          return wrap;
        },
      },
    ],
  });
}
