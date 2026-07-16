import {
  Banner,
  BannerIcon,
  BannerContent,
  BannerActions,
  type BannerProps,
} from "./banner/banner";
import { Button } from "./button/button";
import { styled } from "../lib/styled";
import { DemoPage } from "./demo-helpers";

/**
 * BannerDemo — the vanilla mirror of React's NewBannerDemo. Same five sections,
 * same copy.
 *
 * The vanilla Banner ships the frame parts (Banner, BannerIcon, BannerContent,
 * BannerActions); like the vanilla Alert it keeps the text and close parts off
 * the component surface, so this demo builds them locally — BannerTitle /
 * BannerDescription are one-line `styled` spans and the close is a plain <button>
 * carrying the exact classes React's <BannerClose> renders. That keeps the two
 * demos rendering identically without widening the component API.
 */

type BannerColor = NonNullable<BannerProps["color"]>;

const COLORS: readonly BannerColor[] = [
  "info",
  "success",
  "warning",
  "destructive",
  "primary",
  "neutral",
];

const SVG_NS = "http://www.w3.org/2000/svg";

/** Build an inline stroke icon from a list of child SVG primitives. */
function svgIcon(
  size: number,
  children: Array<[string, Record<string, string>]>,
): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("width", String(size));
  svg.setAttribute("height", String(size));
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "2");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  svg.setAttribute("aria-hidden", "true");
  for (const [tag, attrs] of children) {
    const node = document.createElementNS(SVG_NS, tag);
    for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
    svg.append(node);
  }
  return svg;
}

const InfoIcon = () =>
  svgIcon(16, [
    ["circle", { cx: "12", cy: "12", r: "10" }],
    ["line", { x1: "12", y1: "16", x2: "12", y2: "12" }],
    ["line", { x1: "12", y1: "8", x2: "12", y2: "8" }],
  ]);

const WarnIcon = () =>
  svgIcon(16, [
    ["path", { d: "M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" }],
    ["line", { x1: "12", y1: "9", x2: "12", y2: "13" }],
    ["line", { x1: "12", y1: "17", x2: "12", y2: "17" }],
  ]);

/** Title / description — the parts React exports as BannerTitle / BannerDescription. */
const BannerTitle = styled({ tag: "span", className: "zen-font-semibold" });
const BannerDescription = styled({ tag: "span", className: "zen-opacity-90" });

/**
 * The close button. React ships this as <BannerClose>; the vanilla Banner keeps
 * it off the surface, so the demo builds it directly with the same classes and
 * an "✕" glyph.
 */
function bannerClose(onClick?: () => void): HTMLButtonElement {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.setAttribute("aria-label", "Dismiss banner");
  btn.className =
    "zen-flex-shrink-0 zen-inline-flex zen-items-center zen-justify-center zen-h-6 zen-w-6 zen-rounded-zen-sm zen-bg-transparent zen-border-0 zen-cursor-pointer zen-text-current zen-opacity-70 hover:zen-opacity-100 hover:zen-bg-black/10 focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring";
  btn.append(
    svgIcon(14, [
      ["line", { x1: "18", y1: "6", x2: "6", y2: "18" }],
      ["line", { x1: "6", y1: "6", x2: "18", y2: "18" }],
    ]),
  );
  if (onClick) btn.addEventListener("click", onClick);
  return btn;
}

/** A vertical stack wrapper matching the React demo's inline flex-column rows. */
function stack(children: Node[]): HTMLElement {
  const div = document.createElement("div");
  div.style.display = "flex";
  div.style.flexDirection = "column";
  div.style.gap = "8px";
  div.style.width = "100%";
  div.append(...children);
  return div;
}

export default function BannerDemo(): HTMLElement {
  return DemoPage({
    title: "Banner",
    description:
      "Page-top persistent callout for app-wide context — onboarding reminders, maintenance windows, role impersonation, missing verification. Compound API mirrors Alert but the banner spans its container's full width and can sticky to the viewport top.",
    sections: [
      {
        title: "1. Default",
        codeTitle: "Title + description + close",
        code: `Banner({ children: [
  BannerIcon({ children: infoIcon() }),
  BannerContent({ children: [
    BannerTitle({ children: "New feature." }),
    BannerDescription({ children: "You can now schedule reports from the dashboard." }),
  ] }),
  bannerClose(),
] });`,
        render: () =>
          Banner({
            children: [
              BannerIcon({ children: InfoIcon() }),
              BannerContent({
                children: [
                  BannerTitle({ children: "New feature." }),
                  BannerDescription({
                    children: "You can now schedule reports from the dashboard.",
                  }),
                ],
              }),
              bannerClose(),
            ],
          }).el,
      },
      {
        title: "2. Colors",
        codeTitle: "All six color tokens",
        code: `Banner({ color: "warning", children: […] });
Banner({ color: "destructive", children: […] });`,
        render: () =>
          stack(
            COLORS.map(
              (c) =>
                Banner({
                  color: c,
                  children: [
                    BannerIcon({ children: InfoIcon() }),
                    BannerContent({
                      children: [
                        BannerTitle({ children: `${c}.` }),
                        BannerDescription({ children: `Banner with color=${c}.` }),
                      ],
                    }),
                  ],
                }).el,
            ),
          ),
      },
      {
        title: "3. With action",
        codeTitle: "Call-to-action button in the trailing slot",
        code: `Banner({ color: "warning", children: [
  BannerIcon({ children: warnIcon() }),
  BannerContent({ children: [
    BannerTitle({ children: "Verification required." }),
    BannerDescription({ children: "Verify your email before continuing." }),
  ] }),
  BannerActions({ children:
    Button({ size: "sm", variant: "outline", color: "warning", children: "Verify now" }),
  }),
  bannerClose(),
] });`,
        render: () =>
          Banner({
            color: "warning",
            children: [
              BannerIcon({ children: WarnIcon() }),
              BannerContent({
                children: [
                  BannerTitle({ children: "Verification required." }),
                  BannerDescription({
                    children: "Verify your email before continuing.",
                  }),
                ],
              }),
              BannerActions({
                children: Button({
                  size: "sm",
                  variant: "outline",
                  color: "warning",
                  children: "Verify now",
                }),
              }),
              bannerClose(),
            ],
          }).el,
      },
      {
        title: "4. Dismissible",
        codeTitle: "Hide the banner from caller-managed state",
        codeDescription:
          "bannerClose() just renders a styled ✕ button — wire its onClick to your own visibility.",
        code: `const banner = Banner({ color: "info", children: [
  BannerContent({ children: [
    BannerTitle({ children: "Reminder." }),
    BannerDescription({ children: "Click ✕ to dismiss this." }),
  ] }),
  bannerClose(() => banner.el.remove()),
] });`,
        render: () => {
          const host = stack([]);
          const build = () => {
            const banner = Banner({
              color: "info",
              children: [
                BannerContent({
                  children: [
                    BannerTitle({ children: "Reminder." }),
                    BannerDescription({
                      children: "Click ✕ on the right to dismiss this banner.",
                    }),
                  ],
                }),
                bannerClose(() => {
                  const again = Button({ size: "sm", children: "Show banner again" });
                  again.el.addEventListener("click", build);
                  host.replaceChildren(again.el);
                }),
              ],
            });
            host.replaceChildren(banner.el);
          };
          build();
          return host;
        },
      },
      {
        title: "5. Sticky to viewport top",
        codeTitle: "sticky pins the banner to the top of the scroll viewport",
        codeDescription:
          "Use for app-wide context that should remain in view as the user scrolls. Pair with a tall page below to feel the effect.",
        code: `Banner({ color: "destructive", sticky: true, children: [
  BannerIcon({ children: warnIcon() }),
  BannerContent({ children:
    BannerTitle({ children: "Impersonating ada@algorisys.com." }),
  }),
  BannerActions({ children:
    Button({ size: "sm", variant: "outline", children: "Stop" }),
  }),
] });`,
        render: () => {
          const note = document.createElement("p");
          note.className = "zen-text-xs zen-text-zen-muted-fg";
          note.textContent =
            "(Wired in the page chrome of real apps via Banner({ sticky: true }) at the layout root — the sticky offset is relative to the scroll viewport, so it belongs above the app shell rather than inside this preview.)";
          return note;
        },
      },
    ],
  });
}
