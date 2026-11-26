import type { AttrType } from "./coerce";

/**
 * Forward a host's `aria-label` / `aria-labelledby` to the control inside it.
 *
 * Every <zen-*> host is a `display: contents` wrapper with no role, so an
 * aria-label left on it names nothing a screen reader announces. Measured on
 * 2026-11-26: `<zen-checkbox aria-label="…">`, zen-switch, zen-radio-group,
 * zen-radio-group-item and zen-slider all exposed an UNNAMED control. Declaring
 * the attributes hands them to the vanilla factory, which puts them on the real
 * control (the button, the radiogroup, each slider thumb).
 *
 * The attribute system camel-cases names (`aria-label` -> `ariaLabel`), and the
 * factories take the literal `aria-*` keys, so `withAria` maps them back. Same
 * mechanism <zen-filter-builder> has used for its own aria-label.
 */
export const ARIA_LABEL_ATTRS = {
  "aria-label": "string",
  "aria-labelledby": "string",
} as const satisfies Record<string, AttrType>;

export type AriaLabelProps = { ariaLabel?: string; ariaLabelledby?: string };

export const withAria = <P extends object>(p: P & AriaLabelProps): Omit<P, keyof AriaLabelProps> & Record<string, unknown> => {
  const { ariaLabel, ariaLabelledby, ...rest } = p;
  const out: Record<string, unknown> = { ...rest };
  // `in`, not truthiness: removing the attribute sends `undefined`, which must
  // reach the factory so it clears the label rather than keeping a stale one.
  if ("ariaLabel" in p) out["aria-label"] = ariaLabel;
  if ("ariaLabelledby" in p) out["aria-labelledby"] = ariaLabelledby;
  return out as Omit<P, keyof AriaLabelProps> & Record<string, unknown>;
};
