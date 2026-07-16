import { Link } from "./link/link";
import { DemoPage } from "./demo-helpers";

/** A row of centred, wrapping, gapped children. */
function row(...kids: Node[]): HTMLElement {
  const d = document.createElement("div");
  d.style.display = "flex";
  d.style.flexWrap = "wrap";
  d.style.gap = "1rem";
  d.style.alignItems = "center";
  d.append(...kids);
  return d;
}

/** A sentence with inline links spliced into plain text. */
function sentence(className: string, ...parts: (string | Node)[]): HTMLElement {
  const p = document.createElement("p");
  p.className = className;
  for (const part of parts) p.append(typeof part === "string" ? document.createTextNode(part) : part);
  return p;
}

export default function LinkDemo(): HTMLElement {
  return DemoPage({
    title: "Link",
    description:
      "A styled anchor. The most surprising thing this library was missing: every app that used it hand-rolled <a class=\"text-blue-600 underline\">, which is how a design system ends up with nine shades of link. Always a real <a>; the vanilla port drops href/target/rel when disabled instead of swapping the tag.",
    sections: [
      {
        title: "1. Standalone and inline",
        codeTitle: "Two jobs, and they do not look the same",
        codeDescription:
          "A standalone link is coloured and underlines on hover. A link inside a sentence is underlined always and takes the sentence's colour and size — colour alone is not an accessible way to say 'link' when the link sits inside text, because it fails for anyone who cannot see the colour.",
        code: `Link({ href: "/pricing", children: "Pricing" });

// inside a sentence:
Link({ href: "/docs", inline: true, children: "documentation" });`,
        render: () => [
          row(
            Link({ href: "#link-demo", children: "Pricing" }).el,
            Link({ href: "#link-demo", size: "sm", children: 'size="sm"' }).el,
            Link({ href: "#link-demo", size: "lg", children: 'size="lg"' }).el,
          ),
          sentence(
            "zen-m-0 zen-text-sm zen-text-zen-foreground",
            "Read the ",
            Link({ href: "#link-demo", inline: true, children: "documentation" }).el,
            " first — an inline link inherits this sentence's size and colour, so it cannot drift away from the prose around it.",
          ),
        ],
      },
      {
        title: "2. Leaving the page",
        codeTitle: "external says so, in the markup and out loud",
        codeDescription:
          "external sets target=_blank and rel='noopener noreferrer' — noopener closes the window.opener hole, noreferrer stops the referrer leaking — and renders the mark that means it. The icon is decorative, so the fact it opens a new tab is also said in words for anyone who cannot see it. Pass your own target or rel and yours wins.",
        code: `Link({ href: "https://www.algorisys.com", external: true, children: "Algorisys" });

// renders: target="_blank" rel="noopener noreferrer"
//          + an icon, + a visually-hidden "(opens in a new tab)"`,
        render: () => [
          row(
            Link({ href: "https://www.algorisys.com", external: true, children: "Algorisys" }).el,
            Link({
              href: "https://www.youtube.com/@tekacademylabs",
              external: true,
              size: "sm",
              children: "Tek Academy Labs",
            }).el,
          ),
          sentence(
            "zen-m-0 zen-text-sm",
            "Or ",
            Link({ href: "https://www.algorisys.com", external: true, inline: true, children: "inline and external" }).el,
            " together.",
          ),
        ],
      },
      {
        title: "3. Disabled",
        codeTitle: "A disabled link is not a link",
        codeDescription:
          "An anchor cannot be disabled — the attribute does not exist, and dropping pointer-events still leaves it in the tab order for keyboard users. So a disabled Link drops its href: nothing to navigate to, nothing to focus, and aria-disabled to say why.",
        code: `Link({ href: "/admin", disabled: true, children: "Admin (needs permission)" });
// -> <a aria-disabled="true"> — no href, not focusable`,
        render: () =>
          row(
            Link({ href: "#link-demo", disabled: true, children: "Admin (needs permission)" }).el,
            Link({ href: "#link-demo", children: "…next to a live one" }).el,
          ),
      },
      {
        title: "4. Your router's link",
        codeTitle: "It is already a real anchor",
        codeDescription:
          "React's binding merges styling onto a router's Link with asChild; the vanilla Link needs no such escape hatch, because it IS an <a>. Give it the href your router listens for, or intercept the click with onClick and call navigate() yourself — the styling, focus ring and underline come along for free.",
        code: `const link = Link({ href: "/pricing", children: "Pricing" });
link.el.addEventListener("click", (e) => {
  e.preventDefault();
  router.navigate("/pricing"); // client-side navigation, zen-ui styling
});`,
        render: () => {
          const link = Link({ href: "#link-demo", children: "Rendered as a real anchor" });
          link.el.setAttribute("data-demo", "as-child");
          return row(link.el);
        },
      },
    ],
  });
}
