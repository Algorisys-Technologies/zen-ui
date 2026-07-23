import { type JSX } from "solid-js";
import { type VariantProps } from "class-variance-authority";
import { type IconName } from "../icon/icon";
/**
 * Object atoms — Solid binding. Mirrors packages/react/src/components/object/
 * exactly: same props, same class strings, so both bindings render identically.
 * See that file (and docs/fiori-gap-analysis.md) for the rationale.
 */
export type ObjectState = "none" | "success" | "warning" | "error" | "info";
declare const objectStatusVariants: (props?: ({
    inverted?: boolean | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export type ObjectStatusProps = Omit<JSX.HTMLAttributes<HTMLSpanElement>, "color"> & VariantProps<typeof objectStatusVariants> & {
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
export declare const ObjectStatus: (props: ObjectStatusProps) => JSX.Element;
export type ObjectNumberProps = Omit<JSX.HTMLAttributes<HTMLSpanElement>, "color"> & {
    /** Pre-formatted for the user's locale — this component does not format. */
    value: JSX.Element;
    unit?: JSX.Element;
    state?: ObjectState;
    /** Larger and bolder — for the headline figure on an object page. */
    emphasized?: boolean;
};
export declare const ObjectNumber: (props: ObjectNumberProps) => JSX.Element;
export type ObjectIdentifierProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "title"> & {
    title: JSX.Element;
    /** Secondary line — an ID, a category, whatever names the object. */
    text?: JSX.Element;
};
export declare const ObjectIdentifier: (props: ObjectIdentifierProps) => JSX.Element;
export type ObjectMarkerType = "flagged" | "favorite" | "draft" | "locked" | "unsaved";
export type ObjectMarkerProps = JSX.HTMLAttributes<HTMLSpanElement> & {
    type: ObjectMarkerType;
    /** Show the label next to the icon. Icon-only stays labelled for a11y. */
    showLabel?: boolean;
    /** Override the default label ("Flagged", "Draft", …). */
    label?: string;
};
export declare const ObjectMarker: (props: ObjectMarkerProps) => JSX.Element;
export { objectStatusVariants };
//# sourceMappingURL=object.d.ts.map