import { Carousel } from "./carousel/carousel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card/card";
import { DemoPage } from "./demo-helpers";

const SLIDES = [
  { title: "Design tokens", body: "Every colour, radius and shadow resolves to a --zen-* custom property." },
  { title: "Two bindings", body: "React over Radix, Solid over Kobalte, one API and one stylesheet." },
  { title: "Prefixed utilities", body: "zen- on every class, so dropping the library into an app collides with nothing." },
  { title: "Accessible by default", body: "The keyboard contract is part of the component, not a prop you remember to pass." },
  { title: "No page-level CSS", body: "The published stylesheet only touches elements zen-ui renders." },
];

const Slide = (title: string, body: string): HTMLElement =>
  Card({
    class: "zen-h-full",
    children: [
      CardHeader({ children: [CardTitle({ children: title }), CardDescription({ children: body })] }),
      CardContent({ children: [makeSurface()] }),
    ],
  }).el;

const makeSurface = (): HTMLElement => {
  const div = document.createElement("div");
  div.className = "zen-h-16 zen-rounded-zen-md zen-bg-zen-muted";
  return div;
};

const slideEls = (): HTMLElement[] => SLIDES.map((s) => Slide(s.title, s.body));

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
        code: `Carousel({
  label: "Features",
  children: [Card({ … }), Card({ … }), Card({ … })],
})`,
        render: () => Carousel({ label: "Features", children: slideEls() }).el,
      },
      {
        title: "2. Several at a time",
        codeTitle: "perView — a strip rather than a stage",
        codeDescription:
          "perView sets how many slides are visible; the arrows stop at the last full page rather than scrolling into empty space. Narrow the window — the slides are a fraction of the scroller, so they shrink with it.",
        code: `Carousel({
  label: "Features",
  perView: 3,
  children: [ … ],
})`,
        render: () => Carousel({ label: "Features, three up", perView: 3, children: slideEls() }).el,
      },
      {
        title: "3. Just the strip",
        codeTitle: "arrows and dots are separable",
        codeDescription:
          "Turn both off and what remains is a snapping scroller, which is often what a touch-first layout actually wants. The keyboard contract survives either way — the strip is still focusable and still arrows.",
        code: `Carousel({
  label: "Gallery",
  perView: 2,
  arrows: false,
  dots: false,
  children: [ … ],
})`,
        render: () =>
          Carousel({ label: "Gallery", perView: 2, arrows: false, dots: false, children: slideEls() }).el,
      },
      {
        title: "4. What it deliberately does not do",
        codeTitle: "No autoplay",
        codeDescription:
          "There is no autoplay prop. Content that moves on its own is a documented accessibility hazard, and there is no version of it that is correct without a pause control — so the caller drives it or nothing does. goTo is reachable by controlling the carousel from outside if you genuinely need it. The smooth scroll is also skipped when the OS asks for reduced motion, since animated horizontal movement is exactly what that setting exists for.",
        code: `// not a thing:
Carousel({ autoplay: true, interval: 3000 })

// the carousel follows the OS instead:
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
