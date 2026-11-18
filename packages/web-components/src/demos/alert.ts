import { DemoPage } from "./demo-helpers";

/**
 * Alert demo — the web-components port. Compound: <zen-alert> wraps opt-in
 * <zen-alert-icon>, <zen-alert-content> (holding <zen-alert-title> +
 * <zen-alert-description>) and <zen-alert-actions>. `color` and `variant` are
 * attributes on <zen-alert>; every part slots its children in the light DOM. The
 * close button is a plain styled <button> the caller wires — the element surface
 * deliberately does not ship one.
 */

const COLORS = ["neutral", "primary", "info", "success", "warning", "destructive"] as const;
type AlertColor = (typeof COLORS)[number];

const SVG_NS = "http://www.w3.org/2000/svg";

function el(tag: string, attrs: Record<string, string> = {}, kids?: Node | Node[] | string): HTMLElement {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  if (kids != null) {
    if (typeof kids === "string") n.textContent = kids;
    else if (Array.isArray(kids)) n.append(...kids);
    else n.append(kids);
  }
  return n;
}

function svgIcon(size: number, fill: string, children: Array<[string, Record<string, string>]>): SVGSVGElement {
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
  for (const [childTag, childAttrs] of children) {
    const node = document.createElementNS(SVG_NS, childTag);
    for (const [k, v] of Object.entries(childAttrs)) node.setAttribute(k, v);
    svg.append(node);
  }
  return svg;
}

const InfoIcon = (): SVGSVGElement =>
  svgIcon(18, "none", [
    ["circle", { cx: "12", cy: "12", r: "10" }],
    ["line", { x1: "12", y1: "16", x2: "12", y2: "12" }],
    ["line", { x1: "12", y1: "8", x2: "12", y2: "8" }],
  ]);

const CheckIcon = (): SVGSVGElement => svgIcon(18, "none", [["polyline", { points: "20 6 9 17 4 12" }]]);

const WarnIcon = (): SVGSVGElement =>
  svgIcon(18, "none", [
    ["path", { d: "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" }],
    ["line", { x1: "12", y1: "9", x2: "12", y2: "13" }],
    ["line", { x1: "12", y1: "17", x2: "12", y2: "17" }],
  ]);

const DotIcon = (): SVGSVGElement => svgIcon(10, "currentColor", [["circle", { cx: "12", cy: "12", r: "6" }]]);

const titleFor = (c: AlertColor): string =>
  ({
    neutral: "Heads up",
    primary: "New release",
    info: "FYI",
    success: "All good",
    warning: "Be careful",
    destructive: "Something went wrong",
  })[c];

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
        code: `<zen-alert>
  <zen-alert-icon><!-- info svg --></zen-alert-icon>
  <zen-alert-content>
    <zen-alert-title>Heads up</zen-alert-title>
    <zen-alert-description>Your trial expires in 3 days.</zen-alert-description>
  </zen-alert-content>
  <button aria-label="Dismiss">×</button>
</zen-alert>`,
        render: () =>
          el("zen-alert", {}, [
            el("zen-alert-icon", {}, InfoIcon()),
            el("zen-alert-content", {}, [
              el("zen-alert-title", {}, "Heads up"),
              el("zen-alert-description", {}, "Your trial expires in 3 days."),
            ]),
            dismissButton(() => {}),
          ]),
      },
      {
        title: "2. Colors × soft variant",
        codeTitle: "All six color tokens",
        code: `<zen-alert color="success">…</zen-alert>
<zen-alert color="destructive">…</zen-alert>
<zen-alert color="warning">…</zen-alert>`,
        render: () =>
          stack(
            COLORS.map((c) =>
              el("zen-alert", { color: c }, [
                el("zen-alert-icon", {}, DotIcon()),
                el("zen-alert-content", {}, [
                  el("zen-alert-title", {}, titleFor(c)),
                  el("zen-alert-description", {}, `Alert with color=${c}. Body text demonstrates contrast.`),
                ]),
              ]),
            ),
          ),
      },
      {
        title: "3. Outline variant",
        codeTitle: "White surface with a colored left border",
        codeDescription:
          'The Zen theme "Opaque Bg" style — neutral text on background, ring color via border.',
        code: `<zen-alert variant="outline" color="warning">
  <zen-alert-icon><!-- warn svg --></zen-alert-icon>
  <zen-alert-content>
    <zen-alert-title>Watch out</zen-alert-title>
    <zen-alert-description>Disk usage above 80%.</zen-alert-description>
  </zen-alert-content>
</zen-alert>`,
        render: () =>
          stack(
            COLORS.map((c) =>
              el("zen-alert", { variant: "outline", color: c }, [
                el("zen-alert-icon", {}, DotIcon()),
                el("zen-alert-content", {}, [
                  el("zen-alert-title", {}, titleFor(c)),
                  el("zen-alert-description", {}, `variant="outline" color="${c}"`),
                ]),
              ]),
            ),
          ),
      },
      {
        title: "4. With actions + close",
        codeTitle: "Action 1 + Action 2 + dismiss button",
        code: `<zen-alert color="primary">
  <zen-alert-icon><!-- info svg --></zen-alert-icon>
  <zen-alert-content>
    <zen-alert-title>Update available</zen-alert-title>
    <zen-alert-description>v3.0.0 includes breaking changes — read the migration guide.</zen-alert-description>
  </zen-alert-content>
  <zen-alert-actions>
    <zen-button variant="ghost" size="sm">Skip</zen-button>
    <zen-button size="sm">Read guide</zen-button>
  </zen-alert-actions>
  <button aria-label="Dismiss">×</button>
</zen-alert>`,
        render: () =>
          el("zen-alert", { color: "primary" }, [
            el("zen-alert-icon", {}, InfoIcon()),
            el("zen-alert-content", {}, [
              el("zen-alert-title", {}, "Update available"),
              el("zen-alert-description", {}, "v3.0.0 includes breaking changes — read the migration guide."),
            ]),
            el("zen-alert-actions", {}, [
              el("zen-button", { variant: "ghost", size: "sm", color: "primary" }, "Skip"),
              el("zen-button", { size: "sm" }, "Read guide"),
            ]),
            dismissButton(() => {}),
          ]),
      },
      {
        title: "5. Title only / body only",
        codeTitle: "Every part is opt-in — render whatever you need",
        code: `<zen-alert color="success">
  <zen-alert-icon><!-- check svg --></zen-alert-icon>
  <zen-alert-content><zen-alert-title>Saved</zen-alert-title></zen-alert-content>
</zen-alert>

<zen-alert color="neutral">
  <zen-alert-content>
    <zen-alert-description>System maintenance window: 22:00–23:00 IST.</zen-alert-description>
  </zen-alert-content>
</zen-alert>`,
        render: () =>
          stack([
            el("zen-alert", { color: "success" }, [
              el("zen-alert-icon", {}, CheckIcon()),
              el("zen-alert-content", {}, el("zen-alert-title", {}, "Saved")),
            ]),
            el("zen-alert", { color: "neutral" }, [
              el("zen-alert-content", {}, el("zen-alert-description", {}, "System maintenance window: 22:00–23:00 IST.")),
            ]),
          ]),
      },
      {
        title: "6. Dismissible",
        codeTitle: "Hide on the close button",
        code: `const alert = /* <zen-alert> … <button> */;
closeBtn.addEventListener("click", () => alert.remove());`,
        render: () => {
          const host = stack([]);
          const build = (): void => {
            host.replaceChildren();
            const alertEl = el("zen-alert", { color: "warning" }, [
              el("zen-alert-icon", {}, WarnIcon()),
              el("zen-alert-content", {}, [
                el("zen-alert-title", {}, "Almost out of seats"),
                el("zen-alert-description", {}, "You have 1 seat remaining."),
              ]),
              dismissButton(() => {
                const again = el("zen-button", { size: "sm", variant: "outline", color: "neutral" }, "Show alert again");
                again.addEventListener("click", build);
                host.replaceChildren(again);
              }),
            ]);
            host.append(alertEl);
          };
          build();
          return host;
        },
      },
    ],
  });
}
