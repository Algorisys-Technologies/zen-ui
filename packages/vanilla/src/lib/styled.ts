import { cn } from "./cn";
import {
  applyProps,
  Disposer,
  toNodes,
  type BaseProps,
  type Child,
  type ZenComponent,
} from "./component";

/**
 * `styled` — a factory for the commonest shape in this library: a styled element
 * that takes `children`, a `class`, and forwards the rest as attributes.
 *
 * Written after hand-rolling that exact shape eight times (Button, Badge, the
 * Dialog sub-parts, …). It is NOT a framework — no reactivity, no lifecycle beyond
 * the `{el, update, destroy}` contract every component already returns. It just
 * removes the create-element / cn / setChildren / applyProps boilerplate that is
 * identical across ~50 of the compound-part components (CardHeader, AlertTitle,
 * BreadcrumbItem, …), so those files describe what differs — the tag, the classes,
 * the interpreted props — and nothing else.
 *
 * Components with real behaviour (focus, keyboard, portals, controlled state) do
 * NOT use this; they are written out, because there the interesting part is the
 * behaviour, not the markup.
 */

export interface StyledConfig<P> {
  /** The element to create. */
  tag: keyof HTMLElementTagNameMap;
  /**
   * The className. A string for a fixed class, or a function of props for one that
   * varies (a cva call). `props.class` is merged in LAST by `styled` itself, so
   * this must not append it — the caller's class always wins.
   */
  className?: string | ((props: P) => string | undefined);
  /**
   * Prop keys this component INTERPRETS rather than forwards. `class`, `children`
   * and `style` are always interpreted; list the variant props and any others here
   * so they do not leak onto the element as stray attributes.
   */
  own?: readonly (keyof P)[];
  /** Extra attributes to set, computed from props (role, aria-*, type, …). */
  attrs?: (props: P) => Record<string, unknown>;
  /** A fixed role, shorthand for the common case. */
  role?: string;
}

export function styled<P extends BaseProps = BaseProps>(
  config: StyledConfig<P>,
): (props?: P) => ZenComponent<P> {
  const interpreted = new Set<string>(["class", "children", "style", ...(config.own ?? []).map(String)]);

  return (props?: P) => {
    let current = { ...(props ?? {}) } as P;
    const el = document.createElement(config.tag);
    const disposer = new Disposer();
    let removeProps: (() => void) | undefined;

    const render = () => {
      const cls = typeof config.className === "function" ? config.className(current) : config.className;
      el.className = cn(cls, current.class);

      if (config.role && !el.hasAttribute("role")) el.setAttribute("role", config.role);

      el.replaceChildren(...toNodes(current.children as Child));

      // Everything not interpreted, plus any computed attrs, becomes an attribute
      // or listener. applyProps handles on* -> addEventListener, style objects, and
      // boolean-as-attribute. The extra attrs are applied via the same path so a
      // computed `role`/`aria-*` behaves identically to a forwarded one.
      const rest: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(current)) {
        if (!interpreted.has(k)) rest[k] = v;
      }
      if (config.attrs) Object.assign(rest, config.attrs(current));

      removeProps?.();
      removeProps = applyProps(el, rest);
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
  };
}
