import { type JSX, type ValidComponent, Show, mergeProps, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";
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
 * Polymorphic via `as`, mirroring this binding's Button and BreadcrumbLink —
 * React reaches the same place with `asChild`. That is the one deliberate
 * divergence between the bindings, and it predates this component:
 *
 *   <Link as={A} href="/pricing">Pricing</Link>   // @solidjs/router
 *
 * Mirrors the React binding's API otherwise.
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

export type LinkProps<T extends ValidComponent = "a"> = {
  as?: T;
  href?: string;
  target?: string;
  rel?: string;
  /** Opens in a new tab, says so, and renders the mark that means it. */
  external?: boolean;
  /**
   * An anchor cannot be disabled — the attribute does not exist and a
   * pointer-events trick still leaves it in the tab order. A disabled Link
   * renders a <span> instead, so there is nothing to click or focus.
   */
  disabled?: boolean;
  class?: string;
  children?: JSX.Element;
  /**
   * Declared here rather than inherited: a disabled Link renders a <span>, so
   * an anchor-typed ref does not narrow. HTMLElement is the honest signature —
   * the caller cannot know which element they will get either.
   */
  ref?: (el: HTMLElement) => void;
} & Omit<VariantProps<typeof linkVariants>, "disabled"> &
  Omit<
    JSX.AnchorHTMLAttributes<HTMLAnchorElement>,
    "class" | "children" | "href" | "target" | "rel" | "ref"
  >;

export const Link = <T extends ValidComponent = "a">(rawProps: LinkProps<T>) => {
  const props = mergeProps({ as: "a" as ValidComponent }, rawProps);
  const [local, rest] = splitProps(props as LinkProps<"a"> & { as: ValidComponent }, [
    "as",
    "size",
    "inline",
    "external",
    "disabled",
    "class",
    "children",
    "href",
    "target",
    "rel",
  ]);

  const classes = () =>
    cn(
      linkVariants({ size: local.size, inline: local.inline, disabled: local.disabled }),
      "zen-inline-flex zen-items-center zen-gap-1",
      local.class,
    );

  return (
    <Show
      when={!local.disabled}
      fallback={
        // The rest is typed for an anchor and this branch is a span, so every
        // event handler mismatches. The cast is at the one boundary where the
        // element genuinely changes — a disabled Link is not a link — rather
        // than weakening the props type for the case that matters.
        <span
          aria-disabled="true"
          class={classes()}
          {...(rest as JSX.HTMLAttributes<HTMLSpanElement>)}
        >
          {local.children}
        </span>
      }
    >
      <Dynamic
        component={local.as}
        href={local.href}
        // noreferrer alongside noopener on purpose: noopener closes the
        // window.opener hole, noreferrer stops the referrer leaking.
        target={local.external ? (local.target ?? "_blank") : local.target}
        rel={local.external ? (local.rel ?? "noopener noreferrer") : local.rel}
        class={classes()}
        {...rest}
      >
        {local.children}
        <Show when={local.external}>
          <Icon name="external-link" size={12} aria-hidden="true" class="zen-shrink-0" />
          {/* The icon is decorative, so the fact it leaves the page has to be
              said in words — a screen reader gets no warning otherwise. */}
          <span class="zen-sr-only">(opens in a new tab)</span>
        </Show>
      </Dynamic>
    </Show>
  );
};

export { linkVariants };
