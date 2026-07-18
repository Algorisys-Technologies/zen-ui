import * as React from "react";
import { Slot, Slottable } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";
import { Icon } from "../icon/icon";

/**
 * Link — a styled anchor.
 *
 *   <Link href="/pricing">Pricing</Link>
 *   <Link href="https://www.algorisys.com" external>Algorisys</Link>
 *   <p>Read the <Link href="/docs" inline>documentation</Link> first.</p>
 *
 * The most surprising thing missing from this library: every app that used it
 * hand-rolled `<a className="text-blue-600 underline">`, which is how a design
 * system ends up with nine shades of link.
 *
 * `asChild` hands the styling to whatever you already have, so a router's Link
 * keeps its own navigation:
 *
 *   <Link asChild><RouterLink to="/pricing">Pricing</RouterLink></Link>
 */

const linkVariants = cva(
  [
    "zen-rounded-zen-sm zen-transition-colors",
    "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
  ].join(" "),
  {
    variants: {
      size: {
        sm: "zen-text-xs",
        md: "zen-text-sm",
        lg: "zen-text-base",
      },
      /**
       * A link in running prose is underlined and takes the sentence's colour
       * and size — colour alone is not an accessible way to say "link" when
       * the link sits inside text.
       */
      inline: {
        true: "zen-text-inherit zen-underline zen-underline-offset-2 hover:zen-text-zen-primary",
        false: "zen-text-zen-primary zen-no-underline hover:zen-underline hover:zen-underline-offset-2",
      },
      disabled: {
        true: "zen-cursor-not-allowed zen-text-zen-muted-fg zen-no-underline hover:zen-no-underline",
        false: "zen-cursor-pointer",
      },
    },
    compoundVariants: [
      // `inline` inherits the surrounding type, so a size would fight it.
      { inline: true, size: ["sm", "md", "lg"], class: "zen-text-inherit" },
    ],
    defaultVariants: { size: "md", inline: false, disabled: false },
  },
);

export interface LinkProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "color">,
    Omit<VariantProps<typeof linkVariants>, "disabled"> {
  /** Opens in a new tab, says so, and renders the mark that means it. */
  external?: boolean;
  /**
   * An anchor cannot be disabled — the attribute does not exist and a
   * pointer-events trick still leaves it in the tab order. A disabled Link
   * renders a <span> instead, so there is nothing to click or focus.
   */
  disabled?: boolean;
  asChild?: boolean;
}

export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  (
    { size, inline, external, disabled, asChild, className, children, href, target, rel, ...props },
    ref,
  ) => {
    const classes = cn(linkVariants({ size, inline, disabled }), "zen-inline-flex zen-items-center zen-gap-1", className);

    if (disabled) {
      return (
        <span ref={ref as React.Ref<HTMLSpanElement>} aria-disabled className={classes} {...props}>
          {children}
        </span>
      );
    }

    const Comp = asChild ? Slot : "a";
    return (
      <Comp
        ref={ref}
        href={href}
        // noreferrer alongside noopener on purpose: noopener closes the
        // window.opener hole, noreferrer stops the referrer leaking. A caller
        // who wants either back passes `rel` and wins.
        target={external ? (target ?? "_blank") : target}
        rel={external ? (rel ?? "noopener noreferrer") : rel}
        className={classes}
        {...props}
      >
        {/* Slottable marks `children` as the Radix Slot target, so the external
         * mark renders as a sibling INSIDE the slotted element instead of
         * tripping React.Children.only(). Without it, asChild throws on every
         * Link — Slot takes exactly one child and this passes two. Button
         * already solved this; the fix is its fix. */}
        <Slottable>{children}</Slottable>
        {external ? (
          <>
            <Icon name="external-link" size={12} aria-hidden className="zen-shrink-0" />
            {/* The icon is decorative, so the fact it leaves the page has to be
                said in words — a screen reader gets no warning otherwise. */}
            <span className="zen-sr-only">(opens in a new tab)</span>
          </>
        ) : null}
      </Comp>
    );
  },
);
Link.displayName = "Link";

export { linkVariants };
