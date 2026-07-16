import { buttonVariants, type ButtonVariantProps } from "@algorisys/zen-ui-core/variants";
import { cn } from "../../lib/cn";
import {
  applyProps,
  Disposer,
  toNodes,
  type BaseProps,
  type Child,
  type ZenComponent,
} from "../../lib/component";

/**
 * Button — the vanilla binding's port of the React reference.
 *
 * Design notes:
 *  - Variants come from @algorisys/zen-ui-core/variants, the SAME object React
 *    and Solid use. Not a copy: a button rendered here is styled by the identical
 *    class string, which is the point of the third binding.
 *  - `as` replaces React's `asChild`. Radix's Slot exists to merge props onto an
 *    unknown child at render time; with no render there is nothing to defer, so
 *    the tag is named up front. Mirrors Solid's polymorphic `as`.
 *  - No business logic (no HTTP, no form-field side effects). Use `onClick`.
 *
 *   const save = Button({ color: "primary", children: "Save", onClick: submit });
 *   form.append(save.el);
 *   save.update({ loading: true });
 */
export interface ButtonProps extends BaseProps, ButtonVariantProps {
  /** Element to render. Defaults to "button". Use "a" for a link-shaped button. */
  as?: keyof HTMLElementTagNameMap;
  /** Shows a spinner and disables the button. */
  loading?: boolean;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  /** Placed before children. Replaced by the spinner while loading. */
  iconLeft?: Child;
  /** Placed after children. Hidden while loading. */
  iconRight?: Child;
  onClick?: (e: MouseEvent) => void;
  /**
   * Anchor attributes, meaningful only with `as: "a"`.
   *
   * Named explicitly rather than inferred from `as`. Solid types this properly
   * with PolymorphicProps<T>, which needs the element's prop map as a type
   * parameter; the equivalent here would make every component generic over its
   * tag to type three attributes on one component. Listing them is the smaller
   * lie, and a wrong one on a <button> is inert rather than harmful.
   */
  href?: string;
  target?: string;
  rel?: string;
}

const SPINNER = `<svg class="zen-animate-spin zen-h-4 zen-w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true"><circle class="zen-opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="zen-opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg>`;

const spinner = (): Node => {
  // Our own trusted markup, never a caller's string — see PORTING.md.
  const t = document.createElement("template");
  t.innerHTML = SPINNER;
  return t.content.firstChild!;
};

export function Button(props: ButtonProps): ZenComponent<ButtonProps> {
  let current: ButtonProps = { ...props };
  const el = document.createElement(current.as ?? "button");
  const disposer = new Disposer();
  let removeProps: (() => void) | undefined;

  const render = () => {
    const {
      as: _as,
      class: className,
      variant,
      color,
      size,
      shape,
      multiline,
      loading = false,
      disabled,
      iconLeft,
      iconRight,
      children,
      type,
      ...rest
    } = current;

    el.className = cn(buttonVariants({ variant, color, size, shape, multiline }), className);

    const isDisabled = disabled || loading;
    const isButton = (current.as ?? "button") === "button";

    // A real <button> defaults to type="button": inside a form, the default is
    // "submit", so an unrelated button submits it. On any other element `type`
    // means nothing and setting it would be noise.
    if (isButton) {
      el.setAttribute("type", type ?? "button");
      (el as HTMLButtonElement).disabled = Boolean(isDisabled);
    } else if (isDisabled) {
      // Only a form control has a `disabled` property. An <a> needs the ARIA
      // equivalent, or it reads as enabled and stays clickable.
      el.setAttribute("aria-disabled", "true");
    } else {
      el.removeAttribute("aria-disabled");
    }

    if (loading) el.setAttribute("aria-busy", "true");
    else el.removeAttribute("aria-busy");
    if (loading) el.setAttribute("data-loading", "");
    else el.removeAttribute("data-loading");

    el.replaceChildren(
      ...(loading ? [spinner()] : toNodes(iconLeft)),
      ...toNodes(children),
      ...(loading ? [] : toNodes(iconRight)),
    );

    // Re-applying props means re-adding listeners, so drop the previous set first
    // or every update() doubles them and onClick fires twice, then three times.
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

export { buttonVariants };
