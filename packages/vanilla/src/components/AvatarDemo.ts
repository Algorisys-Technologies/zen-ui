import { Avatar, AvatarFallback, AvatarGroup, AvatarImage } from "./avatar/avatar";
import { DemoPage } from "./demo-helpers";

const SIZES = ["xs", "sm", "md", "lg", "xl"] as const;
const STATUSES = ["online", "away", "busy", "offline"] as const;

/** A relative wrapper with an absolutely-positioned status dot on top of an avatar. */
function withStatus(status: (typeof STATUSES)[number]): HTMLElement {
  const wrap = document.createElement("div");
  wrap.style.position = "relative";
  wrap.style.display = "inline-block";
  wrap.append(Avatar({ size: "lg", children: AvatarFallback({ children: status[0].toUpperCase() }) }).el);

  const dot = document.createElement("span");
  dot.style.position = "absolute";
  dot.style.right = "0";
  dot.style.bottom = "0";
  dot.style.width = "12px";
  dot.style.height = "12px";
  dot.style.borderRadius = "999px";
  dot.style.background = `var(--zen-status-${status})`;
  dot.style.border = "2px solid var(--zen-color-background)";
  dot.setAttribute("aria-label", status);
  wrap.append(dot);
  return wrap;
}

export default function AvatarDemo(): HTMLElement {
  return DemoPage({
    title: "Avatar",
    description:
      "Image-with-fallback primitive. The vanilla port keeps the same compound API — Avatar, AvatarImage, AvatarFallback, AvatarGroup. AvatarImage hides itself on error, so the fallback behind it shows automatically.",
    sections: [
      {
        title: "1. Basic (image + initials fallback)",
        codeTitle: "Compound API",
        code: `Avatar({
  children: [
    AvatarImage({ src: "/me.jpg", alt: "Rajesh Pillai" }),
    AvatarFallback({ children: "RP" }),
  ],
})`,
        render: () =>
          Avatar({
            children: [
              AvatarImage({ src: "https://i.pravatar.cc/96?img=12", alt: "Rajesh Pillai" }),
              AvatarFallback({ children: "RP" }),
            ],
          }).el,
      },
      {
        title: "2. Fallback only",
        codeTitle: "When src is missing or fails to load",
        code: `Avatar({ children: AvatarFallback({ children: "AB" }) });

Avatar({
  children: [
    AvatarImage({ src: "/broken.jpg" }),
    AvatarFallback({ children: "CD" }),
  ],
});`,
        render: () => [
          Avatar({ children: AvatarFallback({ children: "AB" }) }).el,
          Avatar({
            children: [AvatarImage({ src: "/broken-link.jpg" }), AvatarFallback({ children: "CD" })],
          }).el,
        ],
      },
      {
        title: "3. Sizes",
        codeTitle: "xs · sm · md · lg · xl",
        code: SIZES.map(
          (s) => `Avatar({ size: "${s}", children: AvatarFallback({ children: "${s.toUpperCase()}" }) })`,
        ).join("\n"),
        render: () =>
          SIZES.map((size) => Avatar({ size, children: AvatarFallback({ children: size.toUpperCase() }) }).el),
      },
      {
        title: "4. AvatarGroup (stacked)",
        codeTitle: "max + spacing collapse the tail into +N",
        code: `AvatarGroup({
  max: 3,
  spacing: "default",
  children: [
    Avatar({ children: AvatarFallback({ children: "RP" }) }),
    Avatar({ children: [AvatarImage({ src: "…" }), AvatarFallback({ children: "AB" })] }),
    Avatar({ children: AvatarFallback({ children: "CD" }) }),
    Avatar({ children: AvatarFallback({ children: "EF" }) }),
    Avatar({ children: AvatarFallback({ children: "GH" }) }),
  ],
})`,
        render: () =>
          AvatarGroup({
            max: 3,
            spacing: "default",
            children: [
              Avatar({ children: AvatarFallback({ children: "RP" }) }),
              Avatar({
                children: [AvatarImage({ src: "https://i.pravatar.cc/96?img=33" }), AvatarFallback({ children: "AB" })],
              }),
              Avatar({ children: AvatarFallback({ children: "CD" }) }),
              Avatar({ children: AvatarFallback({ children: "EF" }) }),
              Avatar({ children: AvatarFallback({ children: "GH" }) }),
            ],
          }).el,
      },
      {
        title: "5. Custom fallback colours",
        codeTitle: "class override on AvatarFallback",
        code: `AvatarFallback({ class: "zen-bg-zen-primary zen-text-zen-primary-fg", children: "RP" });
AvatarFallback({ class: "zen-bg-zen-success zen-text-zen-success-fg", children: "OK" });
AvatarFallback({ class: "zen-bg-zen-error zen-text-zen-error-fg", children: "!!" });`,
        render: () => [
          Avatar({
            children: AvatarFallback({ class: "zen-bg-zen-primary zen-text-zen-primary-fg", children: "RP" }),
          }).el,
          Avatar({
            children: AvatarFallback({ class: "zen-bg-zen-success zen-text-zen-success-fg", children: "OK" }),
          }).el,
          Avatar({
            children: AvatarFallback({ class: "zen-bg-zen-error zen-text-zen-error-fg", children: "!!" }),
          }).el,
        ],
      },
      {
        title: "6. With status dot",
        description:
          "The compound API leaves status indicators to composition — drop an absolutely-positioned <span> on top of the Avatar.",
        codeTitle: "Position a small dot via absolute positioning",
        code: `const wrap = document.createElement("div");
wrap.style.position = "relative";
wrap.style.display = "inline-block";
wrap.append(Avatar({ children: AvatarFallback({ children: "RP" }) }).el);

const dot = document.createElement("span");
Object.assign(dot.style, {
  position: "absolute", right: "0", bottom: "0",
  width: "10px", height: "10px", borderRadius: "999px",
  background: "var(--zen-status-online)",
  border: "2px solid var(--zen-color-background)",
});
wrap.append(dot);`,
        render: () => STATUSES.map(withStatus),
      },
    ],
  });
}
