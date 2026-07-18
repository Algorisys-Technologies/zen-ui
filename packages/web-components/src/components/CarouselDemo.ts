import { DemoPage } from "./demo-helpers";

/**
 * Carousel demo — the web-components port. Every light-DOM child of
 * <zen-carousel> becomes a slide; the component wraps each one itself. `label`
 * and `per-view` are attributes, while `arrows` and `dots` default TRUE and so
 * are JS properties (a boolean attribute could only ever add presence, never turn
 * them off). Movement is CSS scroll-snap.
 */

interface SlideSpec {
  title: string;
  body: string;
}

const SLIDES: SlideSpec[] = [
  { title: "Design tokens", body: "Every colour, radius and shadow resolves to a --zen-* custom property." },
  { title: "Two bindings", body: "React over Radix, Solid over Kobalte, one API and one stylesheet." },
  { title: "Prefixed utilities", body: "zen- on every class, so dropping the library into an app collides with nothing." },
  { title: "Accessible by default", body: "The keyboard contract is part of the component, not a prop you remember to pass." },
  { title: "No page-level CSS", body: "The published stylesheet only touches elements zen-ui renders." },
];

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

function makeSurface(): HTMLElement {
  const div = document.createElement("div");
  div.className = "zen-h-16 zen-rounded-zen-md zen-bg-zen-muted";
  return div;
}

const slide = (s: SlideSpec): HTMLElement =>
  el("zen-card", { class: "zen-h-full" }, [
    el("zen-card-header", {}, [
      el("zen-card-title", {}, s.title),
      el("zen-card-description", {}, s.body),
    ]),
    el("zen-card-content", {}, makeSurface()),
  ]);

const slideEls = (): HTMLElement[] => SLIDES.map(slide);

function carousel(opts: { label: string; perView?: number; arrows?: boolean; dots?: boolean }): HTMLElement {
  const c = document.createElement("zen-carousel") as HTMLElement & {
    arrows: boolean;
    dots: boolean;
  };
  c.setAttribute("label", opts.label);
  if (opts.perView != null) c.setAttribute("per-view", String(opts.perView));
  if (opts.arrows === false) c.arrows = false;
  if (opts.dots === false) c.dots = false;
  c.append(...slideEls());
  return c;
}

export default function CarouselDemo(): HTMLElement {
  return DemoPage({
    title: "Carousel",
    description:
      "A swipeable strip of slides. Every child becomes a slide — there is no CarouselItem to import, because the component wraps each child itself. Movement is CSS scroll-snap rather than a drag implementation, so touch swipe, momentum and the rubber-band edge come from the platform and behave the way each platform's users already expect.",
    sections: [
      {
        title: "1. One at a time",
        codeTitle: "Children in, slides out",
        codeDescription:
          "Arrows, dots and the keyboard all drive the same scroll position, and the scroll position drives them back — a swipe never presses a button, but the dots still have to follow it. Focus the strip and try ← → Home End.",
        code: `<zen-carousel label="Features">
  <zen-card>…</zen-card>
  <zen-card>…</zen-card>
  <zen-card>…</zen-card>
</zen-carousel>`,
        render: () => carousel({ label: "Features" }),
      },
      {
        title: "2. Several at a time",
        codeTitle: "per-view — a strip rather than a stage",
        codeDescription:
          "per-view sets how many slides are visible; the arrows stop at the last full page rather than scrolling into empty space. Narrow the window — the slides are a fraction of the scroller, so they shrink with it.",
        code: `<zen-carousel label="Features" per-view="3">
  …
</zen-carousel>`,
        render: () => carousel({ label: "Features, three up", perView: 3 }),
      },
      {
        title: "3. Just the strip",
        codeTitle: "arrows and dots are separable",
        codeDescription:
          "Turn both off and what remains is a snapping scroller, which is often what a touch-first layout actually wants. The keyboard contract survives either way — the strip is still focusable and still arrows.",
        code: `<zen-carousel label="Gallery" per-view="2"></zen-carousel>

const c = document.querySelector("zen-carousel");
c.arrows = false;   // defaults true, so turn off via the property
c.dots = false;`,
        render: () => carousel({ label: "Gallery", perView: 2, arrows: false, dots: false }),
      },
      {
        title: "4. What it deliberately does not do",
        codeTitle: "No autoplay",
        codeDescription:
          "There is no autoplay prop. Content that moves on its own is a documented accessibility hazard, and there is no version of it that is correct without a pause control — so the caller drives it or nothing does. goTo is reachable by controlling the carousel from outside if you genuinely need it. The smooth scroll is also skipped when the OS asks for reduced motion, since animated horizontal movement is exactly what that setting exists for.",
        code: `<!-- not a thing: -->
<zen-carousel autoplay interval="3000"></zen-carousel>

<!-- the carousel follows the OS instead: -->
prefers-reduced-motion: reduce  →  behavior: "auto"`,
        render: () => {
          const p = document.createElement("p");
          p.className = "zen-m-0 zen-text-sm zen-text-zen-muted-fg";
          p.textContent =
            "Set Reduce motion in your OS accessibility settings and the arrows above jump rather than glide, with no code change.";
          return p;
        },
      },
    ],
  });
}
