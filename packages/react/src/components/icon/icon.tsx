import * as React from "react";
import { ZEN_ICONS, type IconName } from "@algorisys/zen-ui-core/icons";
import { cn } from "../../lib/cn";

/**
 * Icon — renders a glyph from the zen-ui icon set.
 *
 *   <Icon name="check" />
 *   <Icon name="bell" size={20} className="zen-text-zen-primary" />
 *
 * Geometry lives in @algorisys/zen-ui-core/icons so React and Solid render the
 * same set. Icons are stroke-based with `stroke="currentColor"`, so they inherit
 * text colour — `zen-text-zen-error` on the icon (or a parent) just works, with
 * no colour prop.
 *
 * Decorative by default (`aria-hidden`). Pass `title` when the icon is the only
 * thing conveying meaning; that promotes it to `role="img"` with an accessible
 * name.
 */

/** `title` is caller-supplied and lands inside markup, so escape it. */
const escapeXml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export interface IconProps extends Omit<React.SVGProps<SVGSVGElement>, "name"> {
  name: IconName;
  /** Width and height in px. Default 16 — matches the inline SVGs this replaces. */
  size?: number;
  /** Accessible name. Omit for decorative icons. */
  title?: string;
}

export const Icon = React.forwardRef<SVGSVGElement, IconProps>(
  ({ name, size = 16, title, className, ...props }, ref) => (
    <svg
      ref={ref}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("zen-inline-block zen-shrink-0", className)}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      // Path data is a compile-time constant from core/src/icons.ts; `name` is
      // typed to IconName and indexes a frozen literal. `title` is the one
      // caller-supplied value and is escaped.
      dangerouslySetInnerHTML={{
        __html: title
          ? `<title>${escapeXml(title)}</title>${ZEN_ICONS[name]}`
          : ZEN_ICONS[name],
      }}
      {...props}
    />
  ),
);
Icon.displayName = "Icon";

export type { IconName };
export { ZEN_ICON_NAMES } from "@algorisys/zen-ui-core/icons";
