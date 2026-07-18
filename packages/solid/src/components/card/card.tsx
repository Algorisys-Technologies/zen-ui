import { type JSX, splitProps } from "solid-js";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";

/**
 * Card — generic surface primitive. Compound API for the common
 * Header / Content / Footer layout, every part opt-in.
 *
 *   <Card>
 *     <CardHeader>
 *       <CardTitle>Account</CardTitle>
 *       <CardDescription>Your billing + contact info.</CardDescription>
 *     </CardHeader>
 *     <CardContent>…</CardContent>
 *     <CardFooter><Button>Save</Button></CardFooter>
 *   </Card>
 */

const cardVariants = cva(
  "zen-rounded-zen-md zen-border zen-bg-zen-background zen-text-zen-foreground",
  {
    variants: {
      variant: {
        elevated: "zen-border-zen-border zen-shadow-zen-sm",
        outlined: "zen-border-zen-border",
        ghost: "zen-border-transparent",
      },
      padding: {
        none: "",
        sm: "zen-p-3",
        md: "zen-p-5",
        lg: "zen-p-6",
      },
    },
    defaultVariants: {
      variant: "outlined",
      padding: "none",
    },
  },
);

export type CardProps = VariantProps<typeof cardVariants> &
  Omit<JSX.HTMLAttributes<HTMLDivElement>, "class"> & {
    class?: string;
    children?: JSX.Element;
  };

export const Card = (props: CardProps) => {
  const [local, rest] = splitProps(props, ["class", "variant", "padding", "children"]);
  return (
    <div
      class={cn(cardVariants({ variant: local.variant, padding: local.padding }), local.class)}
      {...rest}
    >
      {local.children}
    </div>
  );
};

type SectionProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "class"> & {
  class?: string;
  children?: JSX.Element;
};

export const CardHeader = (props: SectionProps) => {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <div class={cn("zen-flex zen-flex-col zen-gap-1 zen-p-5 zen-pb-3", local.class)} {...rest}>
      {local.children}
    </div>
  );
};

type TitleProps = Omit<JSX.HTMLAttributes<HTMLHeadingElement>, "class"> & {
  class?: string;
  children?: JSX.Element;
};

export const CardTitle = (props: TitleProps) => {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <h3
      class={cn("zen-text-base zen-font-semibold zen-leading-tight zen-m-0 zen-text-zen-foreground", local.class)}
      {...rest}
    >
      {local.children}
    </h3>
  );
};

type ParagraphProps = Omit<JSX.HTMLAttributes<HTMLParagraphElement>, "class"> & {
  class?: string;
  children?: JSX.Element;
};

export const CardDescription = (props: ParagraphProps) => {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <p class={cn("zen-text-sm zen-text-zen-muted-fg zen-m-0", local.class)} {...rest}>
      {local.children}
    </p>
  );
};

export const CardContent = (props: SectionProps) => {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <div class={cn("zen-p-5 zen-pt-0", local.class)} {...rest}>
      {local.children}
    </div>
  );
};

export const CardFooter = (props: SectionProps) => {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <div
      class={cn("zen-flex zen-items-center zen-gap-2 zen-p-5 zen-pt-3 zen-border-t zen-border-zen-border", local.class)}
      {...rest}
    >
      {local.children}
    </div>
  );
};

export { cardVariants };
