import type { Child, ZenComponent } from "@algorisys/zen-ui-vanilla";
import { camel, coerce, kebab, type AttrType } from "./coerce";
import { captureChildren } from "./children";

/**
 * The descriptor that turns one vanilla factory into one custom element.
 *
 * The design goal is that a descriptor is small and mostly uniform: name the tag,
 * the factory, and which primitive props are worth exposing as HTML attributes.
 * Everything else — object/array data, callbacks, children — flows through
 * without per-prop wiring, because objects and functions cannot be attributes
 * anyway and are set as JS properties or slotted as light-DOM children.
 */
export interface ElementDef<P> {
  /** Custom element name, e.g. "zen-button". Must contain a hyphen (HTML rule). */
  tag: string;
  /** The vanilla factory. Props in, `{ el, update, destroy }` out. */
  factory: (props: P) => ZenComponent<P, Element>;
  /**
   * Primitive props exposed as HTML attributes, each with how to coerce it.
   * Key is the ATTRIBUTE name (kebab-case, as written in HTML); it maps to the
   * camelCase prop. `json` handles a whole data array/object inline in HTML.
   */
  attrs?: Record<string, AttrType>;
  /**
   * Object / array props that only make sense set as a JS property
   * (`el.tabs = [...]`). Declared so the element defines a real accessor — which
   * is also how framework templates (Angular, Vue) bind non-string inputs.
   */
  props?: string[];
  /**
   * Callback prop -> CustomEvent name. The element dispatches the event AND still
   * calls a directly-assigned `el.onValueChange`, so both the declarative
   * (`@zen-value-change`) and imperative styles work.
   */
  events?: Record<string, string>;
  /**
   * Where the element's light-DOM children go. Defaults to "children". Set to
   * `false` for data-driven elements that render from props and take no slot —
   * their light-DOM content (usually stray whitespace) is discarded.
   */
  childrenProp?: string | false;
}

const BASE_MEMBERS = new Set(["el", "update", "destroy"]);

/** Every custom-element tag registered, in registration order. */
export const registeredTags: string[] = [];

/**
 * Copy a handle's extra members (Dialog's open/close/isOpen, Input's focus/…)
 * onto the element, so `document.querySelector("zen-dialog").open()` works.
 *
 * Methods and getters delegate to the element's CURRENT component, not the one
 * captured at connect time — re-parenting an element destroys and recreates its
 * component, and a stale closure would call a dead handle.
 */
function forwardHandle<P>(host: ZenElementBase<P>, comp: ZenComponent<P, Element>): void {
  for (const [name, desc] of Object.entries(Object.getOwnPropertyDescriptors(comp))) {
    if (BASE_MEMBERS.has(name) || name in host) continue;
    if (typeof desc.value === "function") {
      Object.defineProperty(host, name, {
        configurable: true,
        value: (...args: unknown[]) => {
          const live = host.component as unknown as Record<string, unknown>;
          return (live?.[name] as ((...a: unknown[]) => unknown) | undefined)?.(...args);
        },
      });
    } else if (desc.get) {
      Object.defineProperty(host, name, {
        configurable: true,
        get: () => (host.component as unknown as Record<string, unknown>)?.[name],
      });
    }
  }
}

/** Shared base so forwardHandle can name the element type without a circular ref. */
abstract class ZenElementBase<P> extends HTMLElement {
  abstract get component(): ZenComponent<P, Element> | undefined;
}

export function defineZenElement<P>(def: ElementDef<P>): void {
  if (typeof customElements === "undefined" || customElements.get(def.tag)) return;

  const attrEntries = Object.entries(def.attrs ?? {});
  const attrNames = attrEntries.map(([name]) => name);
  const propNames = def.props ?? [];
  const events = def.events ?? {};
  const eventNames = Object.keys(events);
  const eventValues = new Set<string>(Object.values(events));
  const childrenProp = def.childrenProp === undefined ? "children" : def.childrenProp;

  class ZenElement extends ZenElementBase<P> {
    static get observedAttributes(): string[] {
      return attrNames;
    }

    private _comp?: ZenComponent<P, Element>;
    private _bag: Record<string, unknown> = {};
    private _children: Child[] = [];
    private _connected = false;
    private _listened = new Set<string>();

    // Track which mapped CustomEvents actually have a listener, so buildProps only
    // wires the corresponding callback when someone is listening (see the events
    // note there). Adding the first listener for a mapped event re-renders, so a
    // presence-gated affordance appears the moment a caller subscribes.
    override addEventListener(
      type: string,
      listener: EventListenerOrEventListenerObject | null,
      options?: boolean | AddEventListenerOptions,
    ): void {
      const firstForType = !this._listened.has(type);
      this._listened.add(type);
      super.addEventListener(type, listener as EventListenerOrEventListenerObject, options);
      if (firstForType && this._comp && eventValues.has(type)) {
        this._comp.update(this.buildProps());
      }
    }

    get component(): ZenComponent<P, Element> | undefined {
      return this._comp;
    }

    connectedCallback(): void {
      // Re-parenting fires disconnected then connected; the guard keeps a stray
      // double-connect from building a second component over the first.
      if (this._connected) return;
      this._connected = true;

      // The host is a transparent wrapper: `display: contents` drops its own box
      // from layout so the element the factory renders participates directly in
      // the parent's flex/grid/flow, exactly as if there were no wrapper. Only set
      // when the author has not chosen a display themselves.
      if (!this.style.display) this.style.display = "contents";

      // A property set before the element upgraded (framework binding, or a plain
      // `el.tabs = […]` before define ran) landed as an own value that shadows the
      // prototype accessor. Re-assign it THROUGH the accessor so it reaches _bag.
      for (const name of [...propNames, ...eventNames]) this.upgradeProperty(name);

      this._children = childrenProp ? captureChildren(this) : (this.replaceChildren(), []);
      this.tryCreate();
    }

    disconnectedCallback(): void {
      this._connected = false;
      this._comp?.destroy();
      this._comp = undefined;
    }

    attributeChangedCallback(): void {
      if (this._comp) this._comp.update(this.buildProps());
      else if (this._connected) this.tryCreate();
    }

    /**
     * Build the component, tolerating a factory that throws because a required
     * data prop is not set yet. `el.options = [...]` frequently lands AFTER the
     * element is appended, and a data-driven factory throws with nothing to render
     * — a throw here would surface as an uncaught lifecycle error and leave the
     * element permanently dead. Instead: stay empty, and retry on the next prop or
     * attribute (setProp / attributeChangedCallback), which is when the data
     * arrives. Once built, `_comp` sticks and updates flow normally.
     */
    private tryCreate(): void {
      if (this._comp) return;
      let comp: ZenComponent<P, Element>;
      try {
        comp = def.factory(this.buildProps());
      } catch {
        return;
      }
      this._comp = comp;
      forwardHandle(this, comp);
      this.appendChild(comp.el);
    }

    private upgradeProperty(name: string): void {
      if (Object.prototype.hasOwnProperty.call(this, name)) {
        const value = (this as Record<string, unknown>)[name];
        delete (this as Record<string, unknown>)[name];
        (this as Record<string, unknown>)[name] = value;
      }
    }

    private buildProps(): P {
      const props: Record<string, unknown> = {};

      // Every declared attribute is sent on every build, present or not, so that
      // REMOVING an attribute resets the prop — vanilla's update() merges, so an
      // omitted key would keep its old value and a disabled button would never
      // re-enable. Absent boolean -> false (a default-false flag; default-true and
      // controlled booleans are declared as `props`, not attrs, so absence there
      // reads as "unset" -> the factory's own default). Absent string/number/json
      // -> undefined, which the factory treats as its default.
      for (const [name, type] of attrEntries) {
        const prop = camel(name);
        if (this.hasAttribute(name)) props[prop] = coerce(this.getAttribute(name), type);
        else props[prop] = type === "boolean" ? false : undefined;
      }

      Object.assign(props, this._bag);

      // The host's own class reaches the STYLED element the factory renders, not
      // the transparent (display:contents) wrapper. `<zen-button class="zen-mt-4">`
      // applies to the <button>, matching Button({ class: "zen-mt-4" }). Every zen
      // factory takes `class` as the caller-wins last cn() argument (PORTING.md).
      const cls = this.getAttribute("class");
      if (cls) props.class = cls;

      // Wrap declared callbacks so the element fires a CustomEvent. OPT-IN: a
      // callback is only passed to the factory when the caller actually listens for
      // its event (addEventListener, tracked in _listened) or assigned the property
      // (in _bag). Otherwise a component that renders an affordance based on
      // callback PRESENCE — PageHeader's back button when `onBack` is set — would
      // always show it. Opt-in also means a framework `@zen-value-change` binding
      // (which is addEventListener under the hood) wires the callback correctly.
      for (const [prop, evt] of Object.entries(events)) {
        if (!this._listened.has(evt) && !(prop in this._bag)) continue;
        const user = this._bag[prop] as ((...a: unknown[]) => void) | undefined;
        props[prop] = (...args: unknown[]) => {
          this.dispatchEvent(
            new CustomEvent(evt, { detail: args.length <= 1 ? args[0] : args, bubbles: true }),
          );
          user?.(...args);
        };
      }

      if (childrenProp && this._children.length) props[childrenProp] = this._children;
      return props as P;
    }

    /** Internal: set a JS-property prop and push it to the live component. */
    setProp(name: string, value: unknown): void {
      this._bag[name] = value;
      if (this._comp) this._comp.update(this.buildProps());
      else if (this._connected) this.tryCreate();
    }

    getProp(name: string): unknown {
      return this._bag[name];
    }
  }

  // Attribute-backed props: `el.color = "primary"` reflects to the attribute,
  // which triggers attributeChangedCallback -> update. Gives framework templates
  // a property to bind while keeping HTML authoring working.
  for (const [attr, type] of attrEntries) {
    const prop = camel(attr);
    Object.defineProperty(ZenElement.prototype, prop, {
      configurable: true,
      get(this: ZenElement) {
        return coerce(this.getAttribute(attr), type);
      },
      set(this: ZenElement, value: unknown) {
        if (value === null || value === undefined || value === false) this.removeAttribute(attr);
        else if (value === true) this.setAttribute(attr, "");
        else this.setAttribute(attr, type === "json" ? JSON.stringify(value) : String(value));
      },
    });
  }

  // Object/array/callback props live in _bag behind an accessor.
  for (const prop of [...propNames, ...eventNames]) {
    Object.defineProperty(ZenElement.prototype, prop, {
      configurable: true,
      get(this: ZenElement) {
        return this.getProp(prop);
      },
      set(this: ZenElement, value: unknown) {
        this.setProp(prop, value);
      },
    });
  }

  customElements.define(def.tag, ZenElement);
  registeredTags.push(def.tag);
}

// Re-export so descriptor files and consumers can name the child shape.
export { kebab };
export type { AttrType };
