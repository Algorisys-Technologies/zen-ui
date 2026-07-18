import { cn } from "../../lib/cn";
import { styled } from "../../lib/styled";
import {
  applyProps,
  Disposer,
  toNodes,
  type BaseProps,
  type Child,
  type ZenComponent,
} from "../../lib/component";

/**
 * Breadcrumb — navigation trail primitive. Radix/Kobalte have no Breadcrumb, so
 * this is a styled, accessible compound built on semantic <nav>/<ol>/<li> with zen
 * tokens. Every part is opt-in so you can compose freely.
 *
 *   Breadcrumb({ children:
 *     BreadcrumbList({ children: [
 *       BreadcrumbItem({ children: BreadcrumbLink({ href: "/", children: "Home" }) }),
 *       BreadcrumbSeparator(),
 *       BreadcrumbItem({ children: BreadcrumbPage({ children: "Settings" }) }),
 *     ]}),
 *   })
 *
 * The pure-display parts use `styled`; BreadcrumbLink (polymorphic `as`),
 * BreadcrumbSeparator (default "/" fallback) and BreadcrumbEllipsis (fixed inner
 * markup) are written out because they do more than set a class.
 */

export type BreadcrumbProps = BaseProps & {
  /** Accepted for API parity with React; the trail's separators are BreadcrumbSeparator. */
  separator?: Child;
};

export const Breadcrumb = styled<BreadcrumbProps>({
  tag: "nav",
  own: ["separator"],
  attrs: () => ({ "aria-label": "breadcrumb" }),
}) as (props?: BreadcrumbProps) => ZenComponent<BreadcrumbProps>;

export const BreadcrumbList = styled({
  tag: "ol",
  className:
    "zen-flex zen-flex-wrap zen-items-center zen-gap-1.5 zen-break-words zen-text-sm zen-text-zen-muted-fg sm:zen-gap-2.5",
});

export const BreadcrumbItem = styled({
  tag: "li",
  className: "zen-inline-flex zen-items-center zen-gap-1.5",
});

export const BreadcrumbPage = styled({
  tag: "span",
  className: "zen-font-medium zen-text-zen-foreground",
  attrs: () => ({ role: "link", "aria-disabled": "true", "aria-current": "page" }),
});

const LINK_CLASS =
  "zen-rounded-zen-sm zen-transition-colors hover:zen-text-zen-foreground focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2";

export interface BreadcrumbLinkProps extends BaseProps {
  /**
   * Element to render. Defaults to "a". Vanilla's answer to React's `asChild`:
   * name the tag up front so a router's own anchor can carry the link styles.
   */
  as?: keyof HTMLElementTagNameMap;
  href?: string;
  target?: string;
  rel?: string;
  onClick?: (e: MouseEvent) => void;
}

export function BreadcrumbLink(props: BreadcrumbLinkProps = {}): ZenComponent<BreadcrumbLinkProps> {
  let current: BreadcrumbLinkProps = { ...props };
  const el = document.createElement(current.as ?? "a");
  const disposer = new Disposer();
  let removeProps: (() => void) | undefined;

  const render = () => {
    const { as: _as, class: className, children, ...rest } = current;
    el.className = cn(LINK_CLASS, className);
    el.replaceChildren(...toNodes(children as Child));
    // Re-applying props re-adds listeners, so drop the previous set first or
    // every update() doubles them.
    removeProps?.();
    removeProps = applyProps(el, rest as Record<string, unknown>);
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

const defaultSeparator = (): Node => {
  const span = document.createElement("span");
  span.setAttribute("aria-hidden", "true");
  span.textContent = "/";
  return span;
};

export type BreadcrumbSeparatorProps = BaseProps;

export function BreadcrumbSeparator(
  props: BreadcrumbSeparatorProps = {},
): ZenComponent<BreadcrumbSeparatorProps> {
  let current: BreadcrumbSeparatorProps = { ...props };
  const el = document.createElement("li");
  el.setAttribute("role", "presentation");
  el.setAttribute("aria-hidden", "true");
  const disposer = new Disposer();
  let removeProps: (() => void) | undefined;

  const render = () => {
    const { class: className, children, ...rest } = current;
    el.className = cn("[&>svg]:zen-size-3.5 zen-text-zen-muted-fg", className);
    const kids = toNodes(children as Child);
    el.replaceChildren(...(kids.length ? kids : [defaultSeparator()]));
    removeProps?.();
    removeProps = applyProps(el, rest as Record<string, unknown>);
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

export type BreadcrumbEllipsisProps = BaseProps;

export function BreadcrumbEllipsis(
  props: BreadcrumbEllipsisProps = {},
): ZenComponent<BreadcrumbEllipsisProps> {
  let current: BreadcrumbEllipsisProps = { ...props };
  const el = document.createElement("span");
  el.setAttribute("role", "presentation");
  el.setAttribute("aria-hidden", "true");
  const disposer = new Disposer();
  let removeProps: (() => void) | undefined;

  const render = () => {
    const { class: className, children: _children, ...rest } = current;
    el.className = cn(
      "zen-flex zen-h-9 zen-w-9 zen-items-center zen-justify-center",
      className,
    );
    const sr = document.createElement("span");
    sr.className = "zen-sr-only";
    sr.textContent = "More";
    el.replaceChildren(document.createTextNode("…"), sr);
    removeProps?.();
    removeProps = applyProps(el, rest as Record<string, unknown>);
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
