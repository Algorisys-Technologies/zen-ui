import { ZEN_ICONS, type IconName } from "@algorisys/zen-ui-core/icons";
import { cn } from "../../lib/cn";
import { applyProps, Disposer, type ZenComponent } from "../../lib/component";

/**
 * Icon — renders a glyph from the zen-ui icon set.
 *
 *   Icon({ name: "check" })
 *   Icon({ name: "bell", size: 20, class: "zen-text-zen-primary" })
 *
 * Geometry lives in @algorisys/zen-ui-core/icons, so every binding renders the
 * same set from one source. Icons are stroke-based with `stroke="currentColor"`,
 * so they inherit text colour — `zen-text-zen-error` on the icon (or a parent)
 * just works, with no colour prop.
 *
 * Decorative by default (`aria-hidden`). Pass `title` when the icon is the only
 * thing conveying meaning; that promotes it to `role="img"` with an accessible
 * name.
 */

const SVG_NS = "http://www.w3.org/2000/svg";

export interface IconProps {
  name: IconName;
  /** Width and height in px. Default 16 — matches the React reference. */
  size?: number;
  /** Accessible name. Omit for decorative icons. */
  title?: string;
  class?: string;
  [key: `data-${string}`]: unknown;
}

/** An <svg>, not an HTMLElement — hence the second type argument. */
export type IconHandle = ZenComponent<IconProps, SVGSVGElement>;

export function Icon(props: IconProps): IconHandle {
  let current: IconProps = { ...props };
  const el = document.createElementNS(SVG_NS, "svg");
  const disposer = new Disposer();
  let removeProps: (() => void) | undefined;

  const render = () => {
    const { name, size = 16, title, class: className, ...rest } = current;

    el.setAttribute("width", String(size));
    el.setAttribute("height", String(size));
    el.setAttribute("viewBox", "0 0 24 24");
    el.setAttribute("fill", "none");
    el.setAttribute("stroke", "currentColor");
    el.setAttribute("stroke-width", "2");
    el.setAttribute("stroke-linecap", "round");
    el.setAttribute("stroke-linejoin", "round");
    el.setAttribute("class", cn("zen-inline-block zen-shrink-0", className));

    if (title) {
      el.setAttribute("role", "img");
      el.removeAttribute("aria-hidden");
      el.setAttribute("aria-label", title);
    } else {
      el.removeAttribute("role");
      el.removeAttribute("aria-label");
      el.setAttribute("aria-hidden", "true");
    }

    // innerHTML is safe here and ONLY here: ZEN_ICONS is a frozen compile-time
    // literal in core and `name` is typed to its keys. The caller's `title` never
    // reaches markup — it goes through setAttribute above, which does not parse.
    // That is why this needs no escaping where the React binding needed some: it
    // interpolates title INTO an html string, and we do not.
    el.innerHTML = ZEN_ICONS[name];

    removeProps?.();
    removeProps = applyProps(el as unknown as HTMLElement, rest as Record<string, unknown>);
  };

  render();
  disposer.add(() => removeProps?.());

  return {
    el,
    update(next) {
      current = { ...current, ...next };
      render();
    },
    destroy() {
      disposer.dispose();
      el.remove();
    },
  };
}

export type { IconName };
export { ZEN_ICON_NAMES } from "@algorisys/zen-ui-core/icons";
