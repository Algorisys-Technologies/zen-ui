import { DemoPage } from "./demo-helpers";

/**
 * FAB demo — the web-components mirror of the vanilla FABDemo. Renders <zen-fab>
 * with a <zen-icon> set as its `iconLeft` property.
 *
 * NOTE: the vanilla demo renders the inline (sections 2–4) FABs with
 * `class: "!zen-static"` to drop them out of the container's fixed positioning.
 * `class` is not a forwarded attribute on <zen-fab>, so instead each inline FAB is
 * placed in a `transform`-based containing block, which pins its position:fixed
 * container to that box rather than the viewport. Section 1 mounts the REAL
 * fixed-position FABs on <body>, exactly as the vanilla demo does.
 */

function el(tag: string, attrs: Record<string, string> = {}): HTMLElement {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  return n;
}

const zenIcon = (name: string, size: number): HTMLElement =>
  el("zen-icon", { name, size: String(size) });

/** A <zen-fab> with a leading icon set as a JS property. */
const fab = (attrs: Record<string, string>, iconName: string, iconSize: number): HTMLElement => {
  const f = el("zen-fab", attrs);
  (f as unknown as { iconLeft: Node }).iconLeft = zenIcon(iconName, iconSize);
  return f;
};

/** A transform-based containing block so a position:fixed FAB stays inside the card. */
const contained = (node: HTMLElement): HTMLElement => {
  const box = document.createElement("div");
  box.style.position = "relative";
  box.style.transform = "translateZ(0)";
  box.style.width = "96px";
  box.style.height = "96px";
  box.append(node);
  return box;
};

export default function FABDemo(): HTMLElement {
  return DemoPage({
    title: "FAB (new — shadcn-style composition)",
    description:
      "Fixed-position floating action button. Wraps the new Button with positioning + elevation. For multi-action speed-dial menus, compose FAB with a menu.",
    sections: [
      {
        title: "1. Inline preview",
        description:
          "The real FABs render fixed-position over the whole page; to keep this docs page tidy they're enabled via the toggle below.",
        codeTitle: "Toggle to mount fixed-position FABs",
        code: `const add = document.createElement("zen-fab");
add.setAttribute("aria-label", "Add");
add.iconLeft = zenIcon("plus", 22);
add.addEventListener("click", () => alert("Primary action"));

const del = document.createElement("zen-fab");
del.setAttribute("position", "bottom-left");
del.setAttribute("color", "error");
del.iconLeft = zenIcon("trash", 20);
del.addEventListener("click", () => alert("Delete action"));

document.body.append(add, del);`,
        render: () => {
          const wrap = document.createElement("div");
          wrap.style.display = "flex";
          wrap.style.flexWrap = "wrap";
          wrap.style.gap = "0.75rem";
          wrap.style.alignItems = "center";

          const toggle = document.createElement("button");
          toggle.type = "button";
          toggle.style.padding = "0.375rem 0.75rem";
          toggle.style.background = "var(--zen-color-primary)";
          toggle.style.color = "white";
          toggle.style.border = "0";
          toggle.style.borderRadius = "6px";
          toggle.style.cursor = "pointer";
          toggle.style.fontSize = "0.8125rem";
          toggle.textContent = "Show fixed FABs";

          let mounted: HTMLElement[] = [];
          toggle.addEventListener("click", () => {
            if (mounted.length) {
              mounted.forEach((n) => n.remove());
              mounted = [];
              toggle.textContent = "Show fixed FABs";
              return;
            }
            const add = fab({ position: "bottom-right", color: "primary", "aria-label": "Add" }, "plus", 22);
            add.addEventListener("click", () => alert("Primary action"));
            const del = fab({ position: "bottom-left", color: "error", "aria-label": "Delete" }, "trash", 20);
            del.addEventListener("click", () => alert("Delete action"));
            mounted = [add, del];
            document.body.append(add, del);
            toggle.textContent = "Hide fixed FABs";
          });

          wrap.append(toggle);
          return wrap;
        },
      },
      {
        title: "2. Speed-dial via a menu",
        codeTitle: "Compose FAB with a menu for multi-action menus",
        codeDescription:
          "The FAB is just the trigger; wrap it in a menu component to build a speed-dial. Shown here as a static trigger.",
        code: `const dd = document.createElement("zen-dropdown-menu");
dd.trigger = fab({ "aria-label": "Quick actions" }, "plus", 22);
dd.items = [
  { label: "New document" },
  { label: "New folder" },
  { label: "Upload file" },
];`,
        render: () => contained(fab({ "aria-label": "Quick actions" }, "plus", 22)),
      },
      {
        title: "3. Sizes",
        codeTitle: "md · lg (default) · xl",
        code: `<zen-fab size="md"></zen-fab>
<zen-fab size="lg"></zen-fab>
<zen-fab size="xl"></zen-fab>`,
        render: () =>
          (["md", "lg", "xl"] as const).map((size) =>
            contained(fab({ size, "aria-label": `Size ${size}` }, "plus", 22)),
          ),
      },
      {
        title: "4. Colors",
        codeTitle: "Any Button color works",
        code: `<zen-fab color="success"></zen-fab>
<zen-fab color="error"></zen-fab>
<zen-fab color="warning"></zen-fab>`,
        render: () => [
          contained(fab({ color: "primary", "aria-label": "Add" }, "plus", 22)),
          contained(fab({ color: "success", "aria-label": "Confirm" }, "check", 20)),
          contained(fab({ color: "error", "aria-label": "Delete" }, "trash", 20)),
          contained(fab({ color: "warning", "aria-label": "Alert" }, "warn", 20)),
        ],
      },
    ],
  });
}
