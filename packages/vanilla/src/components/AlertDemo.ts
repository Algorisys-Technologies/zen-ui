import {
  Alert,
  AlertActions,
  AlertContent,
  AlertDescription,
  AlertIcon,
  AlertTitle,
} from "./alert/alert";
import { Button } from "./button/button";
import { DemoPage } from "./demo-helpers";

/**
 * AlertDemo — the vanilla mirror of React's NewAlertDemo. Same six sections,
 * same copy. The compound parts (Alert, AlertIcon, AlertContent, AlertTitle,
 * AlertDescription, AlertActions) are the exports of alert/alert.ts; children
 * compose by passing the sub-part handles straight in — toNodes unwraps them.
 *
 * The Zen theme icons here are inline <svg> built the same way React's demo
 * builds InfoIcon/CheckIcon/WarnIcon/DotIcon, so the two demos render identically.
 */

const COLORS = ["neutral", "primary", "info", "success", "warning", "destructive"] as const;
type AlertColor = (typeof COLORS)[number];

const SVG_NS = "http://www.w3.org/2000/svg";

/** Build an inline stroke icon from a list of child SVG primitives. */
function svgIcon(
  size: number,
  fill: string,
  children: Array<[string, Record<string, string>]>,
): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("width", String(size));
  svg.setAttribute("height", String(size));
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("fill", fill);
  if (fill === "none") {
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "2");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
  }
  svg.setAttribute("aria-hidden", "true");
  for (const [tag, attrs] of children) {
    const node = document.createElementNS(SVG_NS, tag);
    for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
    svg.append(node);
  }
  return svg;
}

const InfoIcon = () =>
  svgIcon(18, "none", [
    ["circle", { cx: "12", cy: "12", r: "10" }],
    ["line", { x1: "12", y1: "16", x2: "12", y2: "12" }],
    ["line", { x1: "12", y1: "8", x2: "12", y2: "8" }],
  ]);

const CheckIcon = () =>
  svgIcon(18, "none", [["polyline", { points: "20 6 9 17 4 12" }]]);

const WarnIcon = () =>
  svgIcon(18, "none", [
    ["path", { d: "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" }],
    ["line", { x1: "12", y1: "9", x2: "12", y2: "13" }],
    ["line", { x1: "12", y1: "17", x2: "12", y2: "17" }],
  ]);

const DotIcon = () =>
  svgIcon(10, "currentColor", [["circle", { cx: "12", cy: "12", r: "6" }]]);

const titleFor = (c: AlertColor) =>
  ({
    neutral: "Heads up",
    primary: "New release",
    info: "FYI",
    success: "All good",
    warning: "Be careful",
    destructive: "Something went wrong",
  })[c];

/**
 * A dismiss button. The React binding ships an AlertClose part; the vanilla
 * Alert keeps the close button out of the component surface, so the demo builds
 * it directly — a plain <button> carrying the same classes and an "×" glyph.
 */
function dismissButton(onClick: () => void): HTMLButtonElement {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.setAttribute("aria-label", "Dismiss");
  btn.className =
    "zen-shrink-0 zen-inline-flex zen-items-center zen-justify-center zen-h-6 zen-w-6 zen-rounded-zen-sm zen-bg-transparent zen-border-0 zen-cursor-pointer zen-text-current zen-opacity-70 hover:zen-opacity-100 focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring";
  btn.append(
    svgIcon(14, "none", [
      ["line", { x1: "18", y1: "6", x2: "6", y2: "18" }],
      ["line", { x1: "6", y1: "6", x2: "18", y2: "18" }],
    ]),
  );
  btn.addEventListener("click", onClick);
  return btn;
}

/** A vertical stack wrapper matching the React demo's inline flex-column rows. */
function stack(children: Node[]): HTMLElement {
  const div = document.createElement("div");
  div.style.display = "flex";
  div.style.flexDirection = "column";
  div.style.gap = "12px";
  div.style.width = "100%";
  div.append(...children);
  return div;
}

export default function AlertDemo(): HTMLElement {
  return DemoPage({
    title: "Alert",
    description:
      "Banner / inline feedback. Compound API — every part (icon, title, description, actions) is opt-in. Soft and outline visual styles per the Zen theme alert artifact.",
    sections: [
      {
        title: "1. Default",
        codeTitle: "Soft + info — title + description + close",
        code: `Alert({ children: [
  AlertIcon({ children: infoIcon() }),
  AlertContent({ children: [
    AlertTitle({ children: "Heads up" }),
    AlertDescription({ children: "Your trial expires in 3 days." }),
  ] }),
  dismissButton(() => { /* hide it */ }),
] });`,
        render: () =>
          Alert({
            children: [
              AlertIcon({ children: InfoIcon() }),
              AlertContent({
                children: [
                  AlertTitle({ children: "Heads up" }),
                  AlertDescription({ children: "Your trial expires in 3 days." }),
                ],
              }),
              dismissButton(() => {}),
            ],
          }).el,
      },
      {
        title: "2. Colors × soft variant",
        codeTitle: "All six color tokens",
        code: `Alert({ color: "success", children: […] });
Alert({ color: "destructive", children: […] });
Alert({ color: "warning", children: […] });`,
        render: () =>
          stack(
            COLORS.map(
              (c) =>
                Alert({
                  color: c,
                  children: [
                    AlertIcon({ children: DotIcon() }),
                    AlertContent({
                      children: [
                        AlertTitle({ children: titleFor(c) }),
                        AlertDescription({
                          children: `Alert with color=${c}. Body text demonstrates contrast.`,
                        }),
                      ],
                    }),
                  ],
                }).el,
            ),
          ),
      },
      {
        title: "3. Outline variant",
        codeTitle: "White surface with a colored left border",
        codeDescription:
          'The Zen theme "Opaque Bg" style — neutral text on background, ring color via border.',
        code: `Alert({ variant: "outline", color: "warning", children: [
  AlertIcon({ children: warnIcon() }),
  AlertContent({ children: [
    AlertTitle({ children: "Watch out" }),
    AlertDescription({ children: "Disk usage above 80%." }),
  ] }),
] });`,
        render: () =>
          stack(
            COLORS.map(
              (c) =>
                Alert({
                  variant: "outline",
                  color: c,
                  children: [
                    AlertIcon({ children: DotIcon() }),
                    AlertContent({
                      children: [
                        AlertTitle({ children: titleFor(c) }),
                        AlertDescription({ children: `variant="outline" color="${c}"` }),
                      ],
                    }),
                  ],
                }).el,
            ),
          ),
      },
      {
        title: "4. With actions + close",
        codeTitle: "Action 1 + Action 2 + dismiss button",
        code: `Alert({ color: "primary", children: [
  AlertIcon({ children: infoIcon() }),
  AlertContent({ children: [
    AlertTitle({ children: "Update available" }),
    AlertDescription({ children: "v3.0.0 includes breaking changes — read the migration guide." }),
  ] }),
  AlertActions({ children: [
    Button({ variant: "ghost", size: "sm", children: "Skip" }),
    Button({ size: "sm", children: "Read guide" }),
  ] }),
  dismissButton(() => { /* hide it */ }),
] });`,
        render: () =>
          Alert({
            color: "primary",
            children: [
              AlertIcon({ children: InfoIcon() }),
              AlertContent({
                children: [
                  AlertTitle({ children: "Update available" }),
                  AlertDescription({
                    children: "v3.0.0 includes breaking changes — read the migration guide.",
                  }),
                ],
              }),
              AlertActions({
                children: [
                  Button({ variant: "ghost", size: "sm", color: "primary", children: "Skip" }),
                  Button({ size: "sm", children: "Read guide" }),
                ],
              }),
              dismissButton(() => {}),
            ],
          }).el,
      },
      {
        title: "5. Title only / body only",
        codeTitle: "Every part is opt-in — render whatever you need",
        code: `Alert({ children: [
  AlertIcon({ children: checkIcon() }),
  AlertContent({ children: AlertTitle({ children: "Saved" }) }),
] });

Alert({ color: "neutral", children:
  AlertContent({ children:
    AlertDescription({ children: "System maintenance window: 22:00–23:00 IST." }),
  }),
});`,
        render: () =>
          stack([
            Alert({
              color: "success",
              children: [
                AlertIcon({ children: CheckIcon() }),
                AlertContent({ children: AlertTitle({ children: "Saved" }) }),
              ],
            }).el,
            Alert({
              color: "neutral",
              children: AlertContent({
                children: AlertDescription({
                  children: "System maintenance window: 22:00–23:00 IST.",
                }),
              }),
            }).el,
          ]),
      },
      {
        title: "6. Dismissible",
        codeTitle: "Hide on the close button",
        code: `const alert = Alert({ color: "warning", children: [
  AlertIcon({ children: warnIcon() }),
  AlertContent({ children: [
    AlertTitle({ children: "Almost out of seats" }),
    AlertDescription({ children: "You have 1 seat remaining." }),
  ] }),
  dismissButton(() => alert.el.remove()),
] });`,
        render: () => {
          const host = stack([]);
          const build = () => {
            host.replaceChildren();
            const alert = Alert({
              color: "warning",
              children: [
                AlertIcon({ children: WarnIcon() }),
                AlertContent({
                  children: [
                    AlertTitle({ children: "Almost out of seats" }),
                    AlertDescription({ children: "You have 1 seat remaining." }),
                  ],
                }),
                dismissButton(() => {
                  const again = Button({
                    size: "sm",
                    variant: "outline",
                    color: "neutral",
                    children: "Show alert again",
                  });
                  again.el.addEventListener("click", build);
                  host.replaceChildren(again.el);
                }),
              ],
            });
            host.append(alert.el);
          };
          build();
          return host;
        },
      },
    ],
  });
}
