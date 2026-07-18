import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";
import { applyProps, Disposer, toNodes, type BaseProps, type Child, type ZenComponent } from "../../lib/component";
import { Icon } from "../icon/icon";

const linkVariants = cva(
  "zen-rounded-zen-sm zen-transition-colors focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
  {
    variants: {
      size: { sm: "zen-text-xs", md: "zen-text-sm", lg: "zen-text-base" },
      inline: {
        true: "zen-text-inherit zen-underline zen-underline-offset-2 hover:zen-text-zen-primary",
        false: "zen-text-zen-primary zen-no-underline hover:zen-underline hover:zen-underline-offset-2",
      },
      disabled: {
        true: "zen-cursor-not-allowed zen-text-zen-muted-fg zen-no-underline hover:zen-no-underline",
        false: "zen-cursor-pointer",
      },
    },
    compoundVariants: [{ inline: true, size: ["sm", "md", "lg"], class: "zen-text-inherit" }],
    defaultVariants: { size: "md", inline: false, disabled: false },
  },
);

export type LinkProps = BaseProps &
  Omit<VariantProps<typeof linkVariants>, "disabled"> & {
    href?: string;
    target?: string;
    rel?: string;
    /** Opens in a new tab, says so, and renders the mark that means it. */
    external?: boolean;
    disabled?: boolean;
    onClick?: (e: MouseEvent) => void;
  };

export function Link(props: LinkProps = {}): ZenComponent<LinkProps> {
  let current = { ...props };
  // Always an <a>, so the handle's `el` is stable. React swaps to <span> when
  // disabled; here removing href already makes the anchor non-navigable and
  // unfocusable, and aria-disabled carries the meaning — same result, stable node.
  const el = document.createElement("a");
  const disposer = new Disposer();
  let remove: (() => void) | undefined;

  const render = () => {
    const { class: className, size, inline, external, disabled, href, target, rel, children, ...rest } = current;
    el.className = cn(linkVariants({ size, inline, disabled }), "zen-inline-flex zen-items-center zen-gap-1", className);

    if (disabled) {
      el.setAttribute("aria-disabled", "true");
      el.removeAttribute("href");
      el.removeAttribute("target");
      el.removeAttribute("rel");
    } else {
      el.removeAttribute("aria-disabled");
      if (href) el.href = href;
      else el.removeAttribute("href");
      const t = external ? (target ?? "_blank") : target;
      const r = external ? (rel ?? "noopener noreferrer") : rel;
      if (t) el.target = t;
      else el.removeAttribute("target");
      if (r) el.rel = r;
      else el.removeAttribute("rel");
    }

    const kids: Node[] = toNodes(children as Child);
    if (external && !disabled) {
      kids.push(Icon({ name: "external-link", size: 12, class: "zen-shrink-0" }).el);
      const sr = document.createElement("span");
      sr.className = "zen-sr-only";
      // The icon is decorative, so "leaves the page" has to be said in words.
      sr.textContent = "(opens in a new tab)";
      kids.push(sr);
    }
    el.replaceChildren(...kids);

    remove?.();
    remove = applyProps(el, rest as Record<string, unknown>);
  };

  render();
  disposer.add(() => remove?.());
  return { el, update(n) { current = { ...current, ...n }; render(); }, destroy() { disposer.dispose(); el.remove(); } };
}
export { linkVariants };
