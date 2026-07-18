import { type JSX, splitProps } from "solid-js";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";

/**
 * Banner — page-top persistent callout. Compound API mirroring the
 * React binding: BannerIcon · BannerContent (Title + Description) ·
 * BannerActions · BannerClose. Differs from Alert in three ways:
 *  - Full container width (no rounded corners).
 *  - Optional `sticky` pins to top of the scroll viewport.
 *  - Inner row centers content within a max-width for wide screens.
 */

const bannerVariants = cva(
  "zen-w-full zen-flex zen-items-center zen-gap-3 zen-px-4 zen-py-3 zen-text-sm zen-border-y",
  {
    variants: {
      color: {
        neutral: "zen-bg-zen-muted zen-text-zen-foreground zen-border-zen-border",
        primary: "zen-bg-zen-primary-soft zen-text-zen-primary-soft-fg zen-border-zen-primary-soft",
        info: "zen-bg-zen-info-soft zen-text-zen-info-soft-fg zen-border-zen-info-soft",
        success: "zen-bg-zen-success-soft zen-text-zen-success-soft-fg zen-border-zen-success-soft",
        warning: "zen-bg-zen-warning-soft zen-text-zen-warning-soft-fg zen-border-zen-warning-soft",
        destructive: "zen-bg-zen-error-soft zen-text-zen-error-soft-fg zen-border-zen-error-soft",
      },
      sticky: {
        true: "zen-sticky zen-top-0 zen-z-30",
        false: "",
      },
    },
    defaultVariants: {
      color: "info",
      sticky: false,
    },
  },
);

export type BannerProps = VariantProps<typeof bannerVariants> &
  Omit<JSX.HTMLAttributes<HTMLDivElement>, "color" | "class"> & {
    class?: string;
    children?: JSX.Element;
  };

export const Banner = (props: BannerProps) => {
  const [local, rest] = splitProps(props, ["class", "color", "sticky", "children"]);
  return (
    <div
      role="status"
      aria-live="polite"
      class={cn(bannerVariants({ color: local.color, sticky: local.sticky }), local.class)}
      {...rest}
    >
      <div class="zen-flex zen-items-center zen-gap-3 zen-w-full zen-max-w-[100rem] zen-mx-auto">
        {local.children}
      </div>
    </div>
  );
};

type DivProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "class"> & {
  class?: string;
  children?: JSX.Element;
};
type SpanProps = Omit<JSX.HTMLAttributes<HTMLSpanElement>, "class"> & {
  class?: string;
  children?: JSX.Element;
};

export const BannerIcon = (props: SpanProps) => {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <span
      aria-hidden="true"
      class={cn("zen-flex-shrink-0 zen-inline-flex zen-items-center", local.class)}
      {...rest}
    >
      {local.children}
    </span>
  );
};

export const BannerContent = (props: DivProps) => {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <div
      class={cn("zen-flex-1 zen-min-w-0 zen-inline-flex zen-flex-wrap zen-items-baseline zen-gap-x-2", local.class)}
      {...rest}
    >
      {local.children}
    </div>
  );
};

export const BannerTitle = (props: SpanProps) => {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <span class={cn("zen-font-semibold", local.class)} {...rest}>
      {local.children}
    </span>
  );
};

export const BannerDescription = (props: SpanProps) => {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <span class={cn("zen-opacity-90", local.class)} {...rest}>
      {local.children}
    </span>
  );
};

export const BannerActions = (props: DivProps) => {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <div
      class={cn("zen-flex-shrink-0 zen-flex zen-items-center zen-gap-2", local.class)}
      {...rest}
    >
      {local.children}
    </div>
  );
};

export type BannerCloseProps = Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, "class"> & {
  class?: string;
};

export const BannerClose = (props: BannerCloseProps) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <button
      type="button"
      aria-label="Dismiss banner"
      class={cn(
        "zen-flex-shrink-0 zen-inline-flex zen-items-center zen-justify-center",
        "zen-h-6 zen-w-6 zen-rounded-zen-sm zen-bg-transparent zen-border-0 zen-cursor-pointer",
        "zen-text-current zen-opacity-70 hover:zen-opacity-100 hover:zen-bg-black/10",
        "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
        local.class,
      )}
      {...rest}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </button>
  );
};

export { bannerVariants };
