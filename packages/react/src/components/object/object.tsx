import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";
import { Icon, type IconName } from "../icon/icon";

/**
 * Object atoms — the small, semantic display elements object pages, list
 * reports and tables are built out of. See docs/fiori-gap-analysis.md; these
 * were rated the best value in the whole gap because they are tiny yet carry
 * most of the "enterprise" feel.
 *
 *   ObjectStatus      state-coloured text + optional icon  ("Approved")
 *   ObjectNumber      a number with its unit, state-coloured ("1,234.56 EUR")
 *   ObjectIdentifier  the title/subtitle pair that names an object
 *   ObjectMarker      flag / favourite / draft / locked indicators
 *
 * `state` maps onto the existing `--zen-color-{success,warning,error,info}`
 * roles rather than introducing a parallel palette, so these retheme with
 * everything else. Fiori's state names are mapped to zen's role names
 * (Fiori "Information" -> `info`, "None" -> `none`) so the API reads like the
 * rest of this library instead of like SAP.
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

/* ---------------------------- ObjectStatus ----------------------------- */

const objectStatusVariants = cva(
  // `relative` is load-bearing, not cosmetic: `stateAnnouncement` renders an
  // `sr-only` span, which is `position: absolute`. Without a positioned
  // ancestor its containing block is the initial containing block, so it
  // escapes any scroll container it sits in and contributes its offset to the
  // document's scrollable overflow. Inside ObjectPageLayout's scroller that
  // grew the page to 3343px and let the whole app shell scroll away.
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
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color">,
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

export const ObjectStatus = React.forwardRef<HTMLSpanElement, ObjectStatusProps>(
  ({ state = "none", icon, inverted, stateAnnouncement, className, children, ...props }, ref) => {
    const resolved = icon === null ? null : (icon ?? (state === "none" ? null : STATE_ICON[state]));
    return (
      <span
        ref={ref}
        className={cn(
          objectStatusVariants({ inverted }),
          inverted ? STATE_INVERTED[state] : STATE_TEXT[state],
          className,
        )}
        {...props}
      >
        {resolved ? <Icon name={resolved} size={14} /> : null}
        {children}
        {stateAnnouncement ? <span className="zen-sr-only">{stateAnnouncement}</span> : null}
      </span>
    );
  },
);
ObjectStatus.displayName = "ObjectStatus";

/* ---------------------------- ObjectNumber ----------------------------- */

export interface ObjectNumberProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color"> {
  /** Pre-formatted for the user's locale — this component does not format. */
  value: React.ReactNode;
  unit?: React.ReactNode;
  state?: ObjectState;
  /** Larger and bolder — for the headline figure on an object page. */
  emphasized?: boolean;
}

export const ObjectNumber = React.forwardRef<HTMLSpanElement, ObjectNumberProps>(
  ({ value, unit, state = "none", emphasized = false, className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "zen-inline-flex zen-items-baseline zen-gap-1 zen-tabular-nums",
        emphasized ? "zen-text-lg zen-font-semibold" : "zen-text-sm zen-font-medium",
        STATE_TEXT[state],
        className,
      )}
      {...props}
    >
      <span>{value}</span>
      {unit ? <span className="zen-text-xs zen-font-normal zen-opacity-80">{unit}</span> : null}
    </span>
  ),
);
ObjectNumber.displayName = "ObjectNumber";

/* -------------------------- ObjectIdentifier --------------------------- */

export interface ObjectIdentifierProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title: React.ReactNode;
  /** Secondary line — an ID, a category, whatever names the object. */
  text?: React.ReactNode;
}

export const ObjectIdentifier = React.forwardRef<HTMLDivElement, ObjectIdentifierProps>(
  ({ title, text, className, ...props }, ref) => (
    <div ref={ref} className={cn("zen-flex zen-flex-col zen-gap-0.5", className)} {...props}>
      <span className="zen-text-sm zen-font-semibold zen-text-zen-foreground">{title}</span>
      {text ? <span className="zen-text-xs zen-text-zen-muted-fg">{text}</span> : null}
    </div>
  ),
);
ObjectIdentifier.displayName = "ObjectIdentifier";

/* ---------------------------- ObjectMarker ----------------------------- */

export type ObjectMarkerType = "flagged" | "favorite" | "draft" | "locked" | "unsaved";

const MARKER: Record<ObjectMarkerType, { icon: IconName; label: string }> = {
  flagged: { icon: "flag", label: "Flagged" },
  favorite: { icon: "star", label: "Favorite" },
  draft: { icon: "draft", label: "Draft" },
  locked: { icon: "lock", label: "Locked" },
  unsaved: { icon: "edit", label: "Unsaved changes" },
};

export interface ObjectMarkerProps extends React.HTMLAttributes<HTMLSpanElement> {
  type: ObjectMarkerType;
  /** Show the label next to the icon. Icon-only stays labelled for a11y. */
  showLabel?: boolean;
  /** Override the default label ("Flagged", "Draft", …). */
  label?: string;
}

export const ObjectMarker = React.forwardRef<HTMLSpanElement, ObjectMarkerProps>(
  ({ type, showLabel = false, label, className, ...props }, ref) => {
    const m = MARKER[type];
    const text = label ?? m.label;
    return (
      <span
        ref={ref}
        className={cn(
          "zen-inline-flex zen-items-center zen-gap-1 zen-text-xs zen-text-zen-muted-fg",
          className,
        )}
        {...props}
      >
        {/* Icon-only markers still need a name — the glyph is the whole message. */}
        <Icon name={m.icon} size={12} title={showLabel ? undefined : text} />
        {showLabel ? <span>{text}</span> : null}
      </span>
    );
  },
);
ObjectMarker.displayName = "ObjectMarker";

export { objectStatusVariants };
