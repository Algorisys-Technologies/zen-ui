import { FAB } from "./fab/fab";
import { Icon } from "./icon/icon";
import { DemoPage } from "./demo-helpers";

/**
 * FABDemo — mirrors React's NewFABDemo. Same four sections. The React demo's
 * speed-dial section composes FAB with DropdownMenu; the vanilla binding has no
 * DropdownMenu yet, so that section keeps the composition snippet as
 * documentation and renders the trigger FAB statically.
 */
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
        code: `const add = FAB({ iconLeft: Icon({ name: "plus", size: 22 }), "aria-label": "Add" });
add.el.addEventListener("click", () => alert("Primary action"));

const del = FAB({ position: "bottom-left", color: "error", iconLeft: Icon({ name: "trash", size: 20 }), "aria-label": "Delete" });
del.el.addEventListener("click", () => alert("Delete action"));

document.body.append(add.el, del.el);`,
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
            const add = FAB({
              position: "bottom-right",
              color: "primary",
              "aria-label": "Add",
              iconLeft: Icon({ name: "plus", size: 22 }),
            });
            add.el.addEventListener("click", () => alert("Primary action"));
            const del = FAB({
              position: "bottom-left",
              color: "error",
              "aria-label": "Delete",
              iconLeft: Icon({ name: "trash", size: 20 }),
            });
            del.el.addEventListener("click", () => alert("Delete action"));
            mounted = [add.el, del.el];
            document.body.append(add.el, del.el);
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
        code: `<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <FAB iconLeft={<PlusIcon />} aria-label="Quick actions" />
  </DropdownMenuTrigger>
  <DropdownMenuContent side="top" align="end">
    <DropdownMenuItem>New document</DropdownMenuItem>
    <DropdownMenuItem>New folder</DropdownMenuItem>
    <DropdownMenuItem>Upload file</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>`,
        render: () =>
          FAB({
            class: "!zen-static",
            "aria-label": "Quick actions",
            iconLeft: Icon({ name: "plus", size: 22 }),
          }).el,
      },
      {
        title: "3. Sizes",
        codeTitle: "md · lg (default) · xl",
        code: `FAB({ size: "md", iconLeft: Icon({ name: "plus" }) });
FAB({ size: "lg", iconLeft: Icon({ name: "plus" }) });
FAB({ size: "xl", iconLeft: Icon({ name: "plus" }) });`,
        render: () =>
          (["md", "lg", "xl"] as const).map(
            (size) =>
              FAB({
                size,
                class: "!zen-static",
                "aria-label": `Size ${size}`,
                iconLeft: Icon({ name: "plus", size: 22 }),
              }).el,
          ),
      },
      {
        title: "4. Colors",
        codeTitle: "Any Button color works",
        code: `FAB({ color: "success", iconLeft: Icon({ name: "check" }) });
FAB({ color: "error", iconLeft: Icon({ name: "trash" }) });
FAB({ color: "warning", iconLeft: Icon({ name: "warn" }) });`,
        render: () => [
          FAB({ color: "primary", class: "!zen-static", iconLeft: Icon({ name: "plus", size: 22 }), "aria-label": "Add" }).el,
          FAB({ color: "success", class: "!zen-static", iconLeft: Icon({ name: "check", size: 20 }), "aria-label": "Confirm" }).el,
          FAB({ color: "error", class: "!zen-static", iconLeft: Icon({ name: "trash", size: 20 }), "aria-label": "Delete" }).el,
          FAB({ color: "warning", class: "!zen-static", iconLeft: Icon({ name: "warn", size: 20 }), "aria-label": "Alert" }).el,
        ],
      },
    ],
  });
}
