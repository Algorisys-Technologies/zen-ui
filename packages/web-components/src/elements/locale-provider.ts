import { provideLocale, type ZenMessages } from "@algorisys/zen-ui-vanilla";
import { REBUILD, registeredTags } from "../lib/define";

/**
 * <zen-locale-provider locale="hi-IN" currency="INR"> — the words, locale and
 * currency of every zen element inside it. The element twin of vanilla's
 * LocaleProvider factory:
 *
 *   <zen-locale-provider locale="hi-IN" currency="INR" id="app">
 *     <zen-combobox …></zen-combobox>
 *   </zen-locale-provider>
 *   <script>document.getElementById("app").messages = { "combobox.placeholder": "चुनें…" };</script>
 *
 * `messages` is a property (an object cannot be an attribute): any subset of
 * the catalogue in @algorisys/zen-ui-core/messages; what it leaves out stays
 * English, and a nested provider takes what it does not set from the one
 * around it. Nothing changes without one.
 *
 * Not built on defineZenElement: there is no factory to wrap, and it renders
 * nothing of its own, only scopes what is inside it. Each zen element builds
 * its component inside the provider found around it (define.ts, tryCreate). A
 * factory reads its words once, when it is built, so changing `locale`,
 * `currency` or `messages` here rebuilds the zen elements inside, the same as
 * vanilla's LocaleProvider rebuilding its `children` function.
 */
class ZenLocaleProvider extends HTMLElement {
  static get observedAttributes(): string[] {
    return ["locale", "currency"];
  }

  private _messages: Partial<ZenMessages> | undefined;
  private _connected = false;

  get messages(): Partial<ZenMessages> | undefined {
    return this._messages;
  }

  set messages(value: Partial<ZenMessages> | undefined) {
    this._messages = value ?? undefined;
    if (this._connected) this.refresh();
  }

  get locale(): string | undefined {
    return this.getAttribute("locale") ?? undefined;
  }

  set locale(value: string | undefined) {
    if (value) this.setAttribute("locale", value);
    else this.removeAttribute("locale");
  }

  get currency(): string | undefined {
    return this.getAttribute("currency") ?? undefined;
  }

  set currency(value: string | undefined) {
    if (value) this.setAttribute("currency", value);
    else this.removeAttribute("currency");
  }

  connectedCallback(): void {
    this._connected = true;
    // Scopes the words; not a box. What is inside stays in the parent's flow.
    if (!this.style.display) this.style.display = "contents";
    // `el.messages = …` before the element upgraded landed as an own property
    // that shadows the accessor: put it through the accessor.
    if (Object.prototype.hasOwnProperty.call(this, "messages")) {
      const value = (this as { messages?: Partial<ZenMessages> }).messages;
      delete (this as { messages?: Partial<ZenMessages> }).messages;
      this._messages = value;
    }
    // Also rebuilds anything inside that was built before this element upgraded.
    this.refresh();
  }

  disconnectedCallback(): void {
    this._connected = false;
    provideLocale(this, undefined);
  }

  attributeChangedCallback(): void {
    if (this._connected) this.refresh();
  }

  /** Take the settings (and the provider around this one) again, and rebuild what is inside with them. */
  refresh(): void {
    provideLocale(this, { locale: this.locale, currency: this.currency, messages: this._messages });
    for (const el of outermost(this)) {
      if (el instanceof ZenLocaleProvider) el.refresh();
      else (el as unknown as { [REBUILD]: () => void })[REBUILD]();
    }
  }
}

/**
 * The zen elements and providers inside `root` that are not inside another one.
 * Those inside a zen element are re-connected when it rebuilds, and rebuild
 * themselves; a nested provider refreshes its own.
 */
function outermost(root: Element): Element[] {
  const found: Element[] = [];
  const walk = (parent: Element) => {
    for (const child of Array.from(parent.children)) {
      if (child instanceof ZenLocaleProvider || REBUILD in child) found.push(child);
      else walk(child);
    }
  };
  walk(root);
  return found;
}

if (typeof customElements !== "undefined" && !customElements.get("zen-locale-provider")) {
  customElements.define("zen-locale-provider", ZenLocaleProvider);
  registeredTags.push("zen-locale-provider");
}
