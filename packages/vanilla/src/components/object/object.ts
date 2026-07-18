import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";
import {
  applyProps,
  Disposer,
  toNodes,
  type BaseProps,
  type Child,
  type ZenComponent,
} from "../../lib/component";
import { Icon, type IconName } from "../icon/icon";

/**
 * Object atoms — the small, semantic display elements object pages, list
 * reports and tables are built out of. Ported from React's object.tsx; same
 * public API, same class strings.
 *
 *   ObjectStatus      state-coloured text + optional icon  ("Approved")
 *   ObjectNumber      a number with its unit, state-coloured ("1,234.56 EUR")
 *   ObjectIdentifier  the title/subtitle pair that names an object
 *   ObjectMarker      flag / favourite / draft / locked indicators
 *
 * `state` maps onto the existing `--zen-color-{success,warning,error,info}`
 * roles rather than introducing a parallel palette, so these retheme with
 * everything else.
 */

/* ------------------------------- shared -------------------------------- */

export type ObjectState = "none" | "success" | "warning" | "error" | "info";

const STATE_TEXT: Record<ObjectState, string> = {
  none: "zen-text-zen-foreground",
  success: "zen-text-zen-success",
  warning: "zen-text-zen-warning",
  error: "zen-text-zen-error",
  info: "zen-text-zen-info",
};

/** Icon used when `icon` is omitted but a state is set. */
const STATE_ICON: Record<Exclude<ObjectState, "none">, IconName> = {
  success: "check-circle",
  warning: "warn",
  error: "error",
  info: "info",
};

/**
 * A tiny factory shell shared by all four atoms: it owns `current`, the
 * disposer and the applyProps lifecycle, and delegates the markup to `paint`.
 * `paint` writes className + children and returns the leftover props to apply.
 *
 * These are pure display, so there is no behaviour to hand-write — only the
 * icon/state resolution that differs per atom. `styled` does not fit: each atom
 * renders internal spans (an sr-only announcement, a value/unit pair) rather
 * than forwarding `children` straight through.
 */
function atom<P extends BaseProps, E extends HTMLElement>(
  tag: keyof HTMLElementTagNameMap,
  paint: (el: E, current: P) => Record<string, unknown>,
): (props?: P) => ZenComponent<P, E> {
  return (props?: P) => {
    let current = { ...(props ?? {}) } as P;
    const el = document.createElement(tag) as unknown as E;
    const disposer = new Disposer();
    let removeProps: (() => void) | undefined;

    const render = () => {
      const rest = paint(el, current);
      removeProps?.();
      removeProps = applyProps(el as unknown as HTMLElement, rest);
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

/* ---------------------------- ObjectStatus ----------------------------- */

const objectStatusVariants = cva(
  // `relative` is load-bearing, not cosmetic: `stateAnnouncement` renders an
  // `sr-only` span, which is `position: absolute`. Without a positioned
  // ancestor it escapes any scroll container it sits in and contributes its
  // offset to the document's scrollable overflow.
  "zen-relative zen-inline-flex zen-items-center zen-gap-1 zen-text-sm zen-leading-snug",
  {
    variants: {
      inverted: {
        // The "inverted" status: filled pill rather than coloured text.
        true: "zen-rounded-zen-sm zen-px-2 zen-py-0.5 zen-font-medium",
        false: "",
      },
    },
    defaultVariants: { inverted: false },
  },
);

const STATE_INVERTED: Record<ObjectState, string> = {
  none: "zen-bg-zen-neutral-soft zen-text-zen-neutral-soft-fg",
  success: "zen-bg-zen-success-soft zen-text-zen-success-soft-fg",
  warning: "zen-bg-zen-warning-soft zen-text-zen-warning-soft-fg",
  error: "zen-bg-zen-error-soft zen-text-zen-error-soft-fg",
  info: "zen-bg-zen-info-soft zen-text-zen-info-soft-fg",
};

export interface ObjectStatusProps
  extends BaseProps,
    VariantProps<typeof objectStatusVariants> {
  /** Semantic state. Drives colour and the default icon. */
  state?: ObjectState;
  /** Override the state's default icon, or pass `null` for no icon. */
  icon?: IconName | null;
  /**
   * Screen-reader text naming the state, e.g. "Approved". Colour alone must not
   * carry meaning — without this, a status reads as bare text to assistive tech.
   */
  stateAnnouncement?: string;
}

export const ObjectStatus = atom<ObjectStatusProps, HTMLSpanElement>("span", (el, c) => {
  const { state = "none", icon, inverted, stateAnnouncement, class: className, children, ...rest } = c;
  const resolved = icon === null ? null : (icon ?? (state === "none" ? null : STATE_ICON[state]));

  el.className = cn(
    objectStatusVariants({ inverted }),
    inverted ? STATE_INVERTED[state] : STATE_TEXT[state],
    className,
  );

  const kids: Child[] = [
    resolved ? Icon({ name: resolved, size: 14 }) : null,
    children as Child,
  ];
  if (stateAnnouncement) {
    const sr = document.createElement("span");
    sr.className = "zen-sr-only";
    sr.textContent = stateAnnouncement;
    kids.push(sr);
  }
  el.replaceChildren(...toNodes(kids));

  return rest;
});

/* ---------------------------- ObjectNumber ----------------------------- */

export interface ObjectNumberProps extends Omit<BaseProps, "children"> {
  /** Pre-formatted for the user's locale — this component does not format. */
  value: Child;
  unit?: Child;
  state?: ObjectState;
  /** Larger and bolder — for the headline figure on an object page. */
  emphasized?: boolean;
}

export const ObjectNumber = atom<ObjectNumberProps, HTMLSpanElement>("span", (el, c) => {
  const { value, unit, state = "none", emphasized = false, class: className, ...rest } = c;

  el.className = cn(
    "zen-inline-flex zen-items-baseline zen-gap-1 zen-tabular-nums",
    emphasized ? "zen-text-lg zen-font-semibold" : "zen-text-sm zen-font-medium",
    STATE_TEXT[state],
    className,
  );

  const valueSpan = document.createElement("span");
  valueSpan.replaceChildren(...toNodes(value));
  const kids: Node[] = [valueSpan];
  if (unit !== undefined && unit !== null) {
    const unitSpan = document.createElement("span");
    unitSpan.className = "zen-text-xs zen-font-normal zen-opacity-80";
    unitSpan.replaceChildren(...toNodes(unit));
    kids.push(unitSpan);
  }
  el.replaceChildren(...kids);

  return rest;
});

/* -------------------------- ObjectIdentifier --------------------------- */

export interface ObjectIdentifierProps extends Omit<BaseProps, "children"> {
  title: Child;
  /** Secondary line — an ID, a category, whatever names the object. */
  text?: Child;
}

export const ObjectIdentifier = atom<ObjectIdentifierProps, HTMLDivElement>("div", (el, c) => {
  const { title, text, class: className, ...rest } = c;

  el.className = cn("zen-flex zen-flex-col zen-gap-0.5", className);

  const titleSpan = document.createElement("span");
  titleSpan.className = "zen-text-sm zen-font-semibold zen-text-zen-foreground";
  titleSpan.replaceChildren(...toNodes(title));
  const kids: Node[] = [titleSpan];
  if (text !== undefined && text !== null) {
    const textSpan = document.createElement("span");
    textSpan.className = "zen-text-xs zen-text-zen-muted-fg";
    textSpan.replaceChildren(...toNodes(text));
    kids.push(textSpan);
  }
  el.replaceChildren(...kids);

  return rest;
});

/* ---------------------------- ObjectMarker ----------------------------- */

export type ObjectMarkerType = "flagged" | "favorite" | "draft" | "locked" | "unsaved";

const MARKER: Record<ObjectMarkerType, { icon: IconName; label: string }> = {
  flagged: { icon: "flag", label: "Flagged" },
  favorite: { icon: "star", label: "Favorite" },
  draft: { icon: "draft", label: "Draft" },
  locked: { icon: "lock", label: "Locked" },
  unsaved: { icon: "edit", label: "Unsaved changes" },
};

export interface ObjectMarkerProps extends Omit<BaseProps, "children"> {
  type: ObjectMarkerType;
  /** Show the label next to the icon. Icon-only stays labelled for a11y. */
  showLabel?: boolean;
  /** Override the default label ("Flagged", "Draft", …). */
  label?: string;
}

export const ObjectMarker = atom<ObjectMarkerProps, HTMLSpanElement>("span", (el, c) => {
  const { type, showLabel = false, label, class: className, ...rest } = c;
  const m = MARKER[type];
  const text = label ?? m.label;

  el.className = cn(
    "zen-inline-flex zen-items-center zen-gap-1 zen-text-xs zen-text-zen-muted-fg",
    className,
  );

  // Icon-only markers still need a name — the glyph is the whole message.
  const kids: Child[] = [Icon({ name: m.icon, size: 12, title: showLabel ? undefined : text })];
  if (showLabel) {
    const labelSpan = document.createElement("span");
    labelSpan.textContent = text;
    kids.push(labelSpan);
  }
  el.replaceChildren(...toNodes(kids));

  return rest;
});

export { objectStatusVariants };
