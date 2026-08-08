import * as React from "react";
import { type VariantProps } from "class-variance-authority";
import { type IconName } from "../icon/icon";
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
export type ObjectState = "none" | "success" | "warning" | "error" | "info";
declare const objectStatusVariants: (props?: ({
    inverted?: boolean | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export interface ObjectStatusProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color">, VariantProps<typeof objectStatusVariants> {
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
export declare const ObjectStatus: React.ForwardRefExoticComponent<ObjectStatusProps & React.RefAttributes<HTMLSpanElement>>;
export interface ObjectNumberProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color"> {
    /** Pre-formatted for the user's locale — this component does not format. */
    value: React.ReactNode;
    unit?: React.ReactNode;
    state?: ObjectState;
    /** Larger and bolder — for the headline figure on an object page. */
    emphasized?: boolean;
}
export declare const ObjectNumber: React.ForwardRefExoticComponent<ObjectNumberProps & React.RefAttributes<HTMLSpanElement>>;
export interface ObjectIdentifierProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
    title: React.ReactNode;
    /** Secondary line — an ID, a category, whatever names the object. */
    text?: React.ReactNode;
}
export declare const ObjectIdentifier: React.ForwardRefExoticComponent<ObjectIdentifierProps & React.RefAttributes<HTMLDivElement>>;
export type ObjectMarkerType = "flagged" | "favorite" | "draft" | "locked" | "unsaved";
export interface ObjectMarkerProps extends React.HTMLAttributes<HTMLSpanElement> {
    type: ObjectMarkerType;
    /** Show the label next to the icon. Icon-only stays labelled for a11y. */
    showLabel?: boolean;
    /** Override the default label ("Flagged", "Draft", …). */
    label?: string;
}
export declare const ObjectMarker: React.ForwardRefExoticComponent<ObjectMarkerProps & React.RefAttributes<HTMLSpanElement>>;
export { objectStatusVariants };
//# sourceMappingURL=object.d.ts.map