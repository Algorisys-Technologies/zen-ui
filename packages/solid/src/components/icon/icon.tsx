import { type JSX, splitProps } from "solid-js";
import { ZEN_ICONS, type IconName } from "@algorisys/zen-ui-core/icons";
import { cn } from "../../lib/cn";

/**
 * Icon — renders a glyph from the zen-ui icon set. Mirrors the React binding.
 *
 *   <Icon name="check" />
 *   <Icon name="bell" size={20} class="zen-text-zen-primary" />
 *
 * Geometry lives in @algorisys/zen-ui-core/icons so both bindings render the
 * same set. Stroke-based with `stroke="currentColor"`, so icons inherit text
 * colour and need no colour prop.
 *
 * Decorative by default (`aria-hidden`). Pass `title` when the icon alone
 * carries the meaning; that promotes it to `role="img"` with a name.
 */

/** `title` is caller-supplied and lands inside markup, so escape it. */
const escapeXml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export type IconProps = Omit<JSX.SvgSVGAttributes<SVGSVGElement>, "name"> & {
  name: IconName;
  /** Width and height in px. Default 16 — matches the inline SVGs this replaces. */
  size?: number;
  /** Accessible name. Omit for decorative icons. */
  title?: string;
};

export const Icon = (props: IconProps) => {
  // `rest` is forwarded so callers keep every native SVG attribute. Splitting a
  // fixed list and dropping the remainder is how this repo's Solid components
  // have silently swallowed `style` and `id` before now.
  const [local, rest] = splitProps(props, ["name", "size", "title", "class"]);
  const size = () => local.size ?? 16;
  const body = () =>
    local.title
      ? `<title>${escapeXml(local.title)}</title>${ZEN_ICONS[local.name]}`
      : ZEN_ICONS[local.name];

  return (
    <svg
      width={size()}
      height={size()}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width={2}
      stroke-linecap="round"
      stroke-linejoin="round"
      class={cn("zen-inline-block zen-shrink-0", local.class)}
      role={local.title ? "img" : undefined}
      aria-hidden={local.title ? undefined : true}
      aria-label={local.title}
      // Path data is a compile-time constant from core/src/icons.ts: `name` is
      // typed to IconName and indexes a frozen literal, so no caller markup
      // reaches here. `title` is the one caller-supplied value and is escaped.
      // eslint-disable-next-line solid/no-innerhtml
      innerHTML={body()}
      {...rest}
    />
  );
};

export type { IconName };
export { ZEN_ICON_NAMES } from "@algorisys/zen-ui-core/icons";
