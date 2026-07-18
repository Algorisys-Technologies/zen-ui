/**
 * The contract every zen-ui-vanilla component returns, and the two helpers that
 * do what a framework's render would.
 *
 * There is no render loop here. A factory builds real DOM once, `update()` writes
 * only what changed, and `destroy()` releases what was registered. That is the
 * whole runtime.
 */
import type { IconName } from "@algorisys/zen-ui-core/icons";

/**
 * Props in, handle out.
 *
 * `el` is a plain element — the caller decides where it goes and may hold it,
 * measure it, or move it. It is deliberately not wrapped: `forwardRef` exists in
 * React because the caller CANNOT otherwise reach the node, and here they always
 * can. That is why this binding has no ref concept at all.
 *
 * Generic over the element type because Icon renders an <svg>, and an SVGSVGElement
 * is not an HTMLElement. Hardcoding HTMLElement here made `Icon()` unusable as a
 * child of `Button()` — the first thing anyone would try.
 */
export interface ZenComponent<P = unknown, E extends Element = HTMLElement> {
  readonly el: E;
  /** Re-apply the given props. Omitted keys keep their current value. */
  update(next: Partial<P>): void;
  /** Release listeners, observers and portals. Safe to call twice. */
  destroy(): void;
}

/** Any component, whatever it renders. Use where the element type does not matter. */
export type AnyZenComponent = ZenComponent<never, Element>;

/** Anything a caller may pass as children. */
export type Child = Node | string | number | AnyZenComponent | Child[] | null | undefined | false;

const isComponent = (v: unknown): v is AnyZenComponent =>
  typeof v === "object" && v !== null && "el" in v && (v as AnyZenComponent).el instanceof Element;

/**
 * Flatten children into real nodes.
 *
 * Strings become TEXT nodes, never markup. A component contributes its element,
 * so `Button({ children: Icon({ name: "check" }) })` composes without the caller
 * reaching for `.el`.
 */
export function toNodes(children: Child): Node[] {
  if (children === null || children === undefined || children === false) return [];
  if (Array.isArray(children)) return children.flatMap(toNodes);
  if (typeof children === "string" || typeof children === "number") {
    return [document.createTextNode(String(children))];
  }
  if (isComponent(children)) return [children.el];
  return [children];
}

/** Replace an element's children in one pass. */
export function setChildren(el: HTMLElement, children: Child): void {
  el.replaceChildren(...toNodes(children));
}

/** Props that every component forwards to its root element. */
export interface BaseProps {
  class?: string;
  id?: string;
  style?: Partial<CSSStyleDeclaration> | Record<string, string>;
  children?: Child;
  [key: `data-${string}`]: unknown;
  [key: `aria-${string}`]: unknown;
}

type Cleanup = () => void;

/**
 * Apply the leftover props a component does not interpret itself.
 *
 * Returns a cleanup that removes every listener it added, so a component's
 * `destroy()` can be one call. The DOM has no equivalent of React unmounting a
 * subtree and taking its handlers with it — an element that is removed while a
 * listener still points at a closure keeps that closure alive.
 *
 * Three cases a naive `el.setAttribute(k, v)` gets wrong, all of which produce a
 * silently wrong element rather than an error:
 *  - `on*` must become addEventListener, not an `onclick="..."` attribute.
 *  - A FALSE boolean must REMOVE the attribute. `setAttribute("disabled", "false")`
 *    disables the control — presence is what counts, not the value.
 *  - `style` is an object here (React's shape), not a string.
 */
export function applyProps(el: HTMLElement, props: Record<string, unknown>): Cleanup {
  const listeners: Array<[string, EventListener]> = [];

  for (const [key, value] of Object.entries(props)) {
    if (value === undefined || value === null) continue;

    if (key.startsWith("on") && typeof value === "function") {
      // onClick -> click, onPointerDown -> pointerdown
      const type = key.slice(2).toLowerCase();
      el.addEventListener(type, value as EventListener);
      listeners.push([type, value as EventListener]);
      continue;
    }

    if (key === "style" && typeof value === "object") {
      for (const [prop, v] of Object.entries(value as Record<string, string>)) {
        // A custom property must go through setProperty; assigning it to .style
        // does nothing and says nothing.
        if (prop.startsWith("--")) el.style.setProperty(prop, String(v));
        else el.style.setProperty(camelToKebab(prop), String(v));
      }
      continue;
    }

    if (typeof value === "boolean") {
      if (value) el.setAttribute(key, "");
      else el.removeAttribute(key);
      continue;
    }

    el.setAttribute(key, String(value));
  }

  return () => {
    for (const [type, fn] of listeners) el.removeEventListener(type, fn);
    listeners.length = 0;
  };
}

const camelToKebab = (s: string) => s.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);

/**
 * Collects cleanups so a component's `destroy()` is one call and cannot half-run.
 * Every listener, observer, timer and portal a factory registers goes here.
 */
export class Disposer {
  private fns: Cleanup[] = [];
  private done = false;

  add(fn: Cleanup | void): void {
    if (typeof fn === "function") this.fns.push(fn);
  }

  dispose(): void {
    if (this.done) return;
    this.done = true;
    // Reverse order: a later cleanup may depend on something an earlier one set up.
    for (const fn of this.fns.reverse()) fn();
    this.fns.length = 0;
  }
}

/** Re-exported so component files can name an icon without importing core directly. */
export type { IconName };
