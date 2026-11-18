import { DemoPage } from "./demo-helpers";

/**
 * Avatar demo — the web-components port. Compound: <zen-avatar> wraps a
 * <zen-avatar-image src alt> and a <zen-avatar-fallback> (initials). The image
 * hides itself on load error so the fallback behind it shows. <zen-avatar-group>
 * stacks avatars and collapses the tail past `max` into a +N chip.
 */

const SIZES = ["xs", "sm", "md", "lg", "xl"] as const;
const STATUSES = ["online", "away", "busy", "offline"] as const;
type Status = (typeof STATUSES)[number];

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

const fallback = (text: string): HTMLElement => el("zen-avatar-fallback", {}, text);
const image = (src: string, alt?: string): HTMLElement =>
  el("zen-avatar-image", alt != null ? { src, alt } : { src });

function withStatus(status: Status): HTMLElement {
  const wrap = document.createElement("div");
  wrap.style.position = "relative";
  wrap.style.display = "inline-block";
  wrap.append(el("zen-avatar", { size: "lg" }, fallback(status[0].toUpperCase())));

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
      "Image-with-fallback primitive. The web-components port keeps the same compound API — zen-avatar, zen-avatar-image, zen-avatar-fallback, zen-avatar-group. The image hides itself on error, so the fallback behind it shows automatically.",
    sections: [
      {
        title: "1. Basic (image + initials fallback)",
        codeTitle: "Compound API",
        code: `<zen-avatar>
  <zen-avatar-image src="/me.jpg" alt="Rajesh Pillai"></zen-avatar-image>
  <zen-avatar-fallback>RP</zen-avatar-fallback>
</zen-avatar>`,
        render: () =>
          el("zen-avatar", {}, [image("https://i.pravatar.cc/96?img=12", "Rajesh Pillai"), fallback("RP")]),
      },
      {
        title: "2. Fallback only",
        codeTitle: "When src is missing or fails to load",
        code: `<zen-avatar><zen-avatar-fallback>AB</zen-avatar-fallback></zen-avatar>

<zen-avatar>
  <zen-avatar-image src="/deliberately-missing.jpg"></zen-avatar-image>
  <zen-avatar-fallback>CD</zen-avatar-fallback>
</zen-avatar>`,
        render: () => [
          el("zen-avatar", {}, fallback("AB")),
          el("zen-avatar", {}, [image("/deliberately-missing.jpg"), fallback("CD")]),
        ],
      },
      {
        title: "3. Sizes",
        codeTitle: "xs · sm · md · lg · xl",
        code: SIZES.map((s) => `<zen-avatar size="${s}"><zen-avatar-fallback>${s.toUpperCase()}</zen-avatar-fallback></zen-avatar>`).join("\n"),
        render: () => SIZES.map((size) => el("zen-avatar", { size }, fallback(size.toUpperCase()))),
      },
      {
        title: "4. AvatarGroup (stacked)",
        codeTitle: "max + spacing collapse the tail into +N",
        code: `<zen-avatar-group max="3" spacing="default">
  <zen-avatar><zen-avatar-fallback>RP</zen-avatar-fallback></zen-avatar>
  <zen-avatar>
    <zen-avatar-image src="…"></zen-avatar-image>
    <zen-avatar-fallback>AB</zen-avatar-fallback>
  </zen-avatar>
  <zen-avatar><zen-avatar-fallback>CD</zen-avatar-fallback></zen-avatar>
  <zen-avatar><zen-avatar-fallback>EF</zen-avatar-fallback></zen-avatar>
  <zen-avatar><zen-avatar-fallback>GH</zen-avatar-fallback></zen-avatar>
</zen-avatar-group>`,
        render: () =>
          el("zen-avatar-group", { max: "3", spacing: "default" }, [
            el("zen-avatar", {}, fallback("RP")),
            el("zen-avatar", {}, [image("https://i.pravatar.cc/96?img=33"), fallback("AB")]),
            el("zen-avatar", {}, fallback("CD")),
            el("zen-avatar", {}, fallback("EF")),
            el("zen-avatar", {}, fallback("GH")),
          ]),
      },
      {
        title: "5. Custom fallback colours",
        codeTitle: "class override on the fallback",
        codeDescription:
          "NOTE: the class currently lands on the <zen-avatar-fallback> host, which wraps the styled circle rather than being it — so the recolour may not fully apply in this binding (the descriptor forwards no `class` prop to the factory).",
        code: `<zen-avatar-fallback class="zen-bg-zen-primary zen-text-zen-primary-fg">RP</zen-avatar-fallback>
<zen-avatar-fallback class="zen-bg-zen-success zen-text-zen-success-fg">OK</zen-avatar-fallback>
<zen-avatar-fallback class="zen-bg-zen-error zen-text-zen-error-fg">!!</zen-avatar-fallback>`,
        render: () => [
          el("zen-avatar", {}, el("zen-avatar-fallback", { class: "zen-bg-zen-primary zen-text-zen-primary-fg" }, "RP")),
          el("zen-avatar", {}, el("zen-avatar-fallback", { class: "zen-bg-zen-success zen-text-zen-success-fg" }, "OK")),
          el("zen-avatar", {}, el("zen-avatar-fallback", { class: "zen-bg-zen-error zen-text-zen-error-fg" }, "!!")),
        ],
      },
      {
        title: "6. With status dot",
        description:
          "The compound API leaves status indicators to composition — drop an absolutely-positioned <span> on top of the avatar.",
        codeTitle: "Position a small dot via absolute positioning",
        code: `const wrap = document.createElement("div");
wrap.style.position = "relative";
wrap.style.display = "inline-block";
wrap.append(avatar);   // <zen-avatar>…</zen-avatar>

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
