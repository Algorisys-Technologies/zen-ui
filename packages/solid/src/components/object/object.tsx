import { type JSX, Show, splitProps } from "solid-js";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";
import { Icon, type IconName } from "../icon/icon";

/**
 * Object atoms — Solid binding. Mirrors packages/react/src/components/object/
 * exactly: same props, same class strings, so both bindings render identically.
 * See that file (and docs/fiori-gap-analysis.md) for the rationale.
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

export type ObjectStatusProps = Omit<JSX.HTMLAttributes<HTMLSpanElement>, "color"> &
  VariantProps<typeof objectStatusVariants> & {
    /** Semantic state. Drives colour and the default icon. */
    state?: ObjectState;
    /** Override the state's default icon, or pass `null` for no icon. */
    icon?: IconName | null;
    /**
     * Screen-reader text naming the state, e.g. "Approved". Colour alone must
     * not carry meaning.
     */
    stateAnnouncement?: string;
  };

export const ObjectStatus = (props: ObjectStatusProps) => {
  const [local, rest] = splitProps(props, [
    "state",
    "icon",
    "inverted",
    "stateAnnouncement",
    "class",
    "children",
  ]);
  const state = () => local.state ?? "none";
  const resolved = () =>
    local.icon === null ? null : (local.icon ?? (state() === "none" ? null : STATE_ICON[state() as Exclude<ObjectState, "none">]));

  return (
    <span
      class={cn(
        objectStatusVariants({ inverted: local.inverted }),
        local.inverted ? STATE_INVERTED[state()] : STATE_TEXT[state()],
        local.class,
      )}
      {...rest}
    >
      <Show when={resolved()}>{(name) => <Icon name={name()} size={14} />}</Show>
      {local.children}
      <Show when={local.stateAnnouncement}>
        <span class="zen-sr-only">{local.stateAnnouncement}</span>
      </Show>
    </span>
  );
};

/* ---------------------------- ObjectNumber ----------------------------- */

export type ObjectNumberProps = Omit<JSX.HTMLAttributes<HTMLSpanElement>, "color"> & {
  /** Pre-formatted for the user's locale — this component does not format. */
  value: JSX.Element;
  unit?: JSX.Element;
  state?: ObjectState;
  /** Larger and bolder — for the headline figure on an object page. */
  emphasized?: boolean;
};

export const ObjectNumber = (props: ObjectNumberProps) => {
  const [local, rest] = splitProps(props, ["value", "unit", "state", "emphasized", "class"]);
  return (
    <span
      class={cn(
        "zen-inline-flex zen-items-baseline zen-gap-1 zen-tabular-nums",
        local.emphasized ? "zen-text-lg zen-font-semibold" : "zen-text-sm zen-font-medium",
        STATE_TEXT[local.state ?? "none"],
        local.class,
      )}
      {...rest}
    >
      <span>{local.value}</span>
      <Show when={local.unit}>
        <span class="zen-text-xs zen-font-normal zen-opacity-80">{local.unit}</span>
      </Show>
    </span>
  );
};

/* -------------------------- ObjectIdentifier --------------------------- */

export type ObjectIdentifierProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "title"> & {
  title: JSX.Element;
  /** Secondary line — an ID, a category, whatever names the object. */
  text?: JSX.Element;
};

export const ObjectIdentifier = (props: ObjectIdentifierProps) => {
  const [local, rest] = splitProps(props, ["title", "text", "class"]);
  return (
    <div class={cn("zen-flex zen-flex-col zen-gap-0.5", local.class)} {...rest}>
      <span class="zen-text-sm zen-font-semibold zen-text-zen-foreground">{local.title}</span>
      <Show when={local.text}>
        <span class="zen-text-xs zen-text-zen-muted-fg">{local.text}</span>
      </Show>
    </div>
  );
};

/* ---------------------------- ObjectMarker ----------------------------- */

export type ObjectMarkerType = "flagged" | "favorite" | "draft" | "locked" | "unsaved";

const MARKER: Record<ObjectMarkerType, { icon: IconName; label: string }> = {
  flagged: { icon: "flag", label: "Flagged" },
  favorite: { icon: "star", label: "Favorite" },
  draft: { icon: "draft", label: "Draft" },
  locked: { icon: "lock", label: "Locked" },
  unsaved: { icon: "edit", label: "Unsaved changes" },
};

export type ObjectMarkerProps = JSX.HTMLAttributes<HTMLSpanElement> & {
  type: ObjectMarkerType;
  /** Show the label next to the icon. Icon-only stays labelled for a11y. */
  showLabel?: boolean;
  /** Override the default label ("Flagged", "Draft", …). */
  label?: string;
};

export const ObjectMarker = (props: ObjectMarkerProps) => {
  const [local, rest] = splitProps(props, ["type", "showLabel", "label", "class"]);
  const marker = () => MARKER[local.type];
  const text = () => local.label ?? marker().label;
  return (
    <span
      class={cn(
        "zen-inline-flex zen-items-center zen-gap-1 zen-text-xs zen-text-zen-muted-fg",
        local.class,
      )}
      {...rest}
    >
      {/* Icon-only markers still need a name — the glyph is the whole message. */}
      <Icon name={marker().icon} size={12} title={local.showLabel ? undefined : text()} />
      <Show when={local.showLabel}>
        <span>{text()}</span>
      </Show>
    </span>
  );
};

export { objectStatusVariants };
