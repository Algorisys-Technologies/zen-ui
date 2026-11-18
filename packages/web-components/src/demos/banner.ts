import { DemoPage } from "./demo-helpers";

/**
 * Banner demo — the web-components port. Compound mirrors Alert: <zen-banner>
 * wraps <zen-banner-icon>, <zen-banner-content> and <zen-banner-actions>. `color`
 * is an attribute; `sticky` is a boolean attribute that pins the banner to the
 * scroll viewport top. Title / description are plain styled spans and the close is
 * a plain <button>, exactly as the other bindings' demos build them.
 */

const COLORS = ["info", "success", "warning", "destructive", "primary", "neutral"] as const;
type BannerColor = (typeof COLORS)[number];

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

function svgIcon(size: number, children: Array<[string, Record<string, string>]>): SVGSVGElement {
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
  for (const [childTag, childAttrs] of children) {
    const node = document.createElementNS(SVG_NS, childTag);
    for (const [k, v] of Object.entries(childAttrs)) node.setAttribute(k, v);
    svg.append(node);
  }
  return svg;
}

const InfoIcon = (): SVGSVGElement =>
  svgIcon(16, [
    ["circle", { cx: "12", cy: "12", r: "10" }],
    ["line", { x1: "12", y1: "16", x2: "12", y2: "12" }],
    ["line", { x1: "12", y1: "8", x2: "12", y2: "8" }],
  ]);

const WarnIcon = (): SVGSVGElement =>
  svgIcon(16, [
    ["path", { d: "M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" }],
    ["line", { x1: "12", y1: "9", x2: "12", y2: "13" }],
    ["line", { x1: "12", y1: "17", x2: "12", y2: "17" }],
  ]);

const bannerTitle = (text: string): HTMLElement => el("span", { class: "zen-font-semibold" }, text);
const bannerDescription = (text: string): HTMLElement => el("span", { class: "zen-opacity-90" }, text);

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
        code: `<zen-banner>
  <zen-banner-icon><!-- info svg --></zen-banner-icon>
  <zen-banner-content>
    <span class="zen-font-semibold">New feature.</span>
    <span class="zen-opacity-90">You can now schedule reports from the dashboard.</span>
  </zen-banner-content>
  <button aria-label="Dismiss banner">×</button>
</zen-banner>`,
        render: () =>
          el("zen-banner", {}, [
            el("zen-banner-icon", {}, InfoIcon()),
            el("zen-banner-content", {}, [
              bannerTitle("New feature."),
              bannerDescription("You can now schedule reports from the dashboard."),
            ]),
            bannerClose(),
          ]),
      },
      {
        title: "2. Colors",
        codeTitle: "All six color tokens",
        code: `<zen-banner color="warning">…</zen-banner>
<zen-banner color="destructive">…</zen-banner>`,
        render: () =>
          stack(
            COLORS.map((c: BannerColor) =>
              el("zen-banner", { color: c }, [
                el("zen-banner-icon", {}, InfoIcon()),
                el("zen-banner-content", {}, [bannerTitle(`${c}.`), bannerDescription(`Banner with color=${c}.`)]),
              ]),
            ),
          ),
      },
      {
        title: "3. With action",
        codeTitle: "Call-to-action button in the trailing slot",
        code: `<zen-banner color="warning">
  <zen-banner-icon><!-- warn svg --></zen-banner-icon>
  <zen-banner-content>
    <span class="zen-font-semibold">Verification required.</span>
    <span class="zen-opacity-90">Verify your email before continuing.</span>
  </zen-banner-content>
  <zen-banner-actions>
    <zen-button size="sm" variant="outline" color="warning">Verify now</zen-button>
  </zen-banner-actions>
  <button aria-label="Dismiss banner">×</button>
</zen-banner>`,
        render: () =>
          el("zen-banner", { color: "warning" }, [
            el("zen-banner-icon", {}, WarnIcon()),
            el("zen-banner-content", {}, [
              bannerTitle("Verification required."),
              bannerDescription("Verify your email before continuing."),
            ]),
            el("zen-banner-actions", {}, el("zen-button", { size: "sm", variant: "outline", color: "warning" }, "Verify now")),
            bannerClose(),
          ]),
      },
      {
        title: "4. Dismissible",
        codeTitle: "Hide the banner from caller-managed state",
        codeDescription:
          "The close button just renders a styled ✕ — wire its click to your own visibility.",
        code: `const banner = /* <zen-banner> … */;
closeBtn.addEventListener("click", () => banner.remove());`,
        render: () => {
          const host = stack([]);
          const build = (): void => {
            const banner = el("zen-banner", { color: "info" }, [
              el("zen-banner-content", {}, [
                bannerTitle("Reminder."),
                bannerDescription("Click ✕ on the right to dismiss this banner."),
              ]),
              bannerClose(() => {
                const again = el("zen-button", { size: "sm" }, "Show banner again");
                again.addEventListener("click", build);
                host.replaceChildren(again);
              }),
            ]);
            host.replaceChildren(banner);
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
        code: `<zen-banner color="destructive" sticky>
  <zen-banner-icon><!-- warn svg --></zen-banner-icon>
  <zen-banner-content>
    <span class="zen-font-semibold">Impersonating ada@algorisys.com.</span>
  </zen-banner-content>
  <zen-banner-actions>
    <zen-button size="sm" variant="outline">Stop</zen-button>
  </zen-banner-actions>
</zen-banner>`,
        render: () => {
          const note = document.createElement("p");
          note.className = "zen-text-xs zen-text-zen-muted-fg";
          note.textContent =
            "(Wired in the page chrome of real apps via <zen-banner sticky> at the layout root — the sticky offset is relative to the scroll viewport, so it belongs above the app shell rather than inside this preview.)";
          return note;
        },
      },
    ],
  });
}
