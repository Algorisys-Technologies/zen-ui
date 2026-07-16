import { Icon, ZEN_ICON_NAMES } from "./icon/icon";
import { DemoPage } from "./demo-helpers";

export default function IconDemo(): HTMLElement {
  return DemoPage({
    title: "Icon",
    description:
      "Geometry comes straight from @algorisys/zen-ui-core/icons — the same path data React and Solid draw. Nothing was redrawn for this binding.",
    sections: [
      {
        title: "1. The whole set",
        description: `${ZEN_ICON_NAMES.length} icons, one source, three bindings.`,
        codeTitle: "Icon({ name })",
        code: `Icon({ name: "check" })
Icon({ name: "bell", size: 20 })`,
        render: () =>
          ZEN_ICON_NAMES.map((name) => {
            const cell = document.createElement("span");
            cell.title = name;
            cell.style.display = "inline-flex";
            cell.style.padding = "0.35rem";
            cell.append(Icon({ name, size: 20 }).el);
            return cell;
          }),
      },
      {
        title: "2. Colour is text colour",
        description: "stroke=currentColor, so zen-text-* is the whole colour API — no colour prop.",
        codeTitle: "inherits currentColor",
        code: `Icon({ name: "x-circle", size: 24, class: "zen-text-zen-error" })`,
        render: () =>
          (
            [
              ["check-circle", "zen-text-zen-success"],
              ["warn", "zen-text-zen-warning"],
              ["x-circle", "zen-text-zen-error"],
              ["info", "zen-text-zen-info"],
            ] as const
          ).map(([name, cls]) => Icon({ name, size: 24, class: cls }).el),
      },
      {
        title: "3. Accessible name",
        description: "Decorative by default. Pass `title` when the icon alone carries the meaning.",
        codeTitle: "title promotes it to role=img",
        code: `Icon({ name: "trash", title: "Delete" })`,
        render: () => Icon({ name: "trash", size: 24, title: "Delete" }).el,
      },
    ],
  });
}
