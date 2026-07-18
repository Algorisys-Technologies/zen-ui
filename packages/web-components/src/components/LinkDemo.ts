import { DemoPage } from "./demo-helpers";

/**
 * Link demo — the web-components port. <zen-link> is always a real <a>; when
 * disabled it drops href/target/rel rather than swapping the tag. The link text
 * is the element's light-DOM children.
 */

function link(attrs: Record<string, string>, text: string): HTMLElement {
  const a = document.createElement("zen-link");
  for (const [k, v] of Object.entries(attrs)) a.setAttribute(k, v);
  a.textContent = text;
  return a;
}

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
  for (const part of parts)
    p.append(typeof part === "string" ? document.createTextNode(part) : part);
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
        code: `<zen-link href="/pricing">Pricing</zen-link>

<!-- inside a sentence: -->
<zen-link href="/docs" inline>documentation</zen-link>`,
        render: () => [
          row(
            link({ href: "#link-demo" }, "Pricing"),
            link({ href: "#link-demo", size: "sm" }, 'size="sm"'),
            link({ href: "#link-demo", size: "lg" }, 'size="lg"'),
          ),
          sentence(
            "zen-m-0 zen-text-sm zen-text-zen-foreground",
            "Read the ",
            link({ href: "#link-demo", inline: "" }, "documentation"),
            " first — an inline link inherits this sentence's size and colour, so it cannot drift away from the prose around it.",
          ),
        ],
      },
      {
        title: "2. Leaving the page",
        codeTitle: "external says so, in the markup and out loud",
        codeDescription:
          "external sets target=_blank and rel='noopener noreferrer' — noopener closes the window.opener hole, noreferrer stops the referrer leaking — and renders the mark that means it. The icon is decorative, so the fact it opens a new tab is also said in words for anyone who cannot see it. Pass your own target or rel and yours wins.",
        code: `<zen-link href="https://www.algorisys.com" external>Algorisys</zen-link>

<!-- renders: target="_blank" rel="noopener noreferrer"
              + an icon, + a visually-hidden "(opens in a new tab)" -->`,
        render: () => [
          row(
            link({ href: "https://www.algorisys.com", external: "" }, "Algorisys"),
            link(
              { href: "https://www.youtube.com/@tekacademylabs", external: "", size: "sm" },
              "Tek Academy Labs",
            ),
          ),
          sentence(
            "zen-m-0 zen-text-sm",
            "Or ",
            link({ href: "https://www.algorisys.com", external: "", inline: "" }, "inline and external"),
            " together.",
          ),
        ],
      },
      {
        title: "3. Disabled",
        codeTitle: "A disabled link is not a link",
        codeDescription:
          "An anchor cannot be disabled — the attribute does not exist, and dropping pointer-events still leaves it in the tab order for keyboard users. So a disabled Link drops its href: nothing to navigate to, nothing to focus, and aria-disabled to say why.",
        code: `<zen-link href="/admin" disabled>Admin (needs permission)</zen-link>
<!-- -> <a aria-disabled="true"> — no href, not focusable -->`,
        render: () =>
          row(
            link({ href: "#link-demo", disabled: "" }, "Admin (needs permission)"),
            link({ href: "#link-demo" }, "…next to a live one"),
          ),
      },
      {
        title: "4. Your router's link",
        codeTitle: "It is already a real anchor",
        codeDescription:
          "The vanilla Link needs no asChild escape hatch, because it IS an <a>. Give it the href your router listens for, or intercept the click and call navigate() yourself — the styling, focus ring and underline come along for free.",
        code: `const link = document.querySelector("zen-link");
link.addEventListener("click", (e) => {
  e.preventDefault();
  router.navigate("/pricing"); // client-side navigation, zen-ui styling
});`,
        render: () => {
          const a = link({ href: "#link-demo" }, "Rendered as a real anchor");
          a.setAttribute("data-demo", "as-child");
          return row(a);
        },
      },
    ],
  });
}
