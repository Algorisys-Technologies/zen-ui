import {
  type JSX,
  type ValidComponent,
  splitProps,
  mergeProps,
  Show,
} from "solid-js";
import { Dynamic } from "solid-js/web";
import { cn } from "../../lib/cn";
import type { PolymorphicProps } from "../../lib/polymorphic";

/**
 * Breadcrumb — navigation trail primitive. Kobalte has no Breadcrumb, so this
 * is a styled, accessible compound built on semantic <nav>/<ol>/<li> with zen
 * tokens. Every part is opt-in so you can compose freely.
 *
 *   <Breadcrumb>
 *     <BreadcrumbList>
 *       <BreadcrumbItem>
 *         <BreadcrumbLink as={A} href="/">Home</BreadcrumbLink>
 *       </BreadcrumbItem>
 *       <BreadcrumbSeparator />
 *       <BreadcrumbItem>
 *         <BreadcrumbPage>Settings</BreadcrumbPage>
 *       </BreadcrumbItem>
 *     </BreadcrumbList>
 *   </Breadcrumb>
 *
 * Solid port of the React binding. React's `asChild` on BreadcrumbLink maps to
 * this binding's polymorphic `as` prop — the house equivalent (see
 * lib/polymorphic.ts), since Solid has no Radix Slot.
 */

export type BreadcrumbProps = Omit<JSX.HTMLAttributes<HTMLElement>, "class"> & {
  /**
   * Accepted for API parity with the React binding. The trail's separators are
   * rendered by <BreadcrumbSeparator>, so this part does not read it; it is
   * split off the props so it never reaches the DOM as a stray attribute.
   */
  separator?: JSX.Element;
  class?: string;
  children?: JSX.Element;
};

export const Breadcrumb = (props: BreadcrumbProps) => {
  const [local, rest] = splitProps(props, ["separator", "children"]);
  return (
    <nav aria-label="breadcrumb" {...rest}>
      {local.children}
    </nav>
  );
};

export type BreadcrumbListProps = Omit<
  JSX.HTMLAttributes<HTMLOListElement>,
  "class"
> & {
  class?: string;
  children?: JSX.Element;
};

export const BreadcrumbList = (props: BreadcrumbListProps) => {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <ol
      class={cn(
        "zen-flex zen-flex-wrap zen-items-center zen-gap-1.5 zen-break-words zen-text-sm zen-text-zen-muted-fg sm:zen-gap-2.5",
        local.class,
      )}
      {...rest}
    >
      {local.children}
    </ol>
  );
};

export type BreadcrumbItemProps = Omit<
  JSX.LiHTMLAttributes<HTMLLIElement>,
  "class"
> & {
  class?: string;
  children?: JSX.Element;
};

export const BreadcrumbItem = (props: BreadcrumbItemProps) => {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <li
      class={cn("zen-inline-flex zen-items-center zen-gap-1.5", local.class)}
      {...rest}
    >
      {local.children}
    </li>
  );
};

type BreadcrumbLinkOwnProps = {
  class?: string;
  children?: JSX.Element;
};

export type BreadcrumbLinkProps<T extends ValidComponent = "a"> =
  PolymorphicProps<T, BreadcrumbLinkOwnProps>;

export const BreadcrumbLink = <T extends ValidComponent = "a">(
  rawProps: BreadcrumbLinkProps<T>,
) => {
  const props = mergeProps({ as: "a" as ValidComponent }, rawProps);
  const [local, rest] = splitProps(
    props as BreadcrumbLinkProps<"a"> & { as: ValidComponent },
    ["as", "class", "children"],
  );
  return (
    <Dynamic
      component={local.as}
      class={cn(
        "zen-rounded-zen-sm zen-transition-colors hover:zen-text-zen-foreground focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
        local.class,
      )}
      {...rest}
    >
      {local.children}
    </Dynamic>
  );
};

export type BreadcrumbPageProps = Omit<
  JSX.HTMLAttributes<HTMLSpanElement>,
  "class"
> & {
  class?: string;
  children?: JSX.Element;
};

export const BreadcrumbPage = (props: BreadcrumbPageProps) => {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <span
      role="link"
      aria-disabled="true"
      aria-current="page"
      class={cn("zen-font-medium zen-text-zen-foreground", local.class)}
      {...rest}
    >
      {local.children}
    </span>
  );
};

export type BreadcrumbSeparatorProps = Omit<
  JSX.LiHTMLAttributes<HTMLLIElement>,
  "class"
> & {
  class?: string;
  children?: JSX.Element;
};

export const BreadcrumbSeparator = (props: BreadcrumbSeparatorProps) => {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <li
      role="presentation"
      aria-hidden="true"
      class={cn("[&>svg]:zen-size-3.5 zen-text-zen-muted-fg", local.class)}
      {...rest}
    >
      {/* mirrors React's `children ?? <span>/</span>` — only null/undefined
          falls back, so an explicitly-passed falsy child still renders */}
      <Show
        when={local.children !== undefined && local.children !== null}
        fallback={<span aria-hidden="true">/</span>}
      >
        {local.children}
      </Show>
    </li>
  );
};

export type BreadcrumbEllipsisProps = Omit<
  JSX.HTMLAttributes<HTMLSpanElement>,
  "class"
> & {
  class?: string;
};

export const BreadcrumbEllipsis = (props: BreadcrumbEllipsisProps) => {
  // `children` is split off and ignored: React's Ellipsis renders fixed content
  // as JSX children, which always win over a spread `children` prop.
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <span
      role="presentation"
      aria-hidden="true"
      class={cn(
        "zen-flex zen-h-9 zen-w-9 zen-items-center zen-justify-center",
        local.class,
      )}
      {...rest}
    >
      {"…"}
      <span class="zen-sr-only">More</span>
    </span>
  );
};
