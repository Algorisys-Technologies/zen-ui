import * as React from "react";
import { type VariantProps } from "class-variance-authority";
/**
 * Banner — page-top persistent callout for app-wide context that needs
 * the user's attention but isn't transient like a Toast or inline like
 * an Alert. Compound API:
 *
 *   <Banner color="warning" sticky>
 *     <BannerIcon><WarningIcon /></BannerIcon>
 *     <BannerContent>
 *       <BannerTitle>Verification required</BannerTitle>
 *       <BannerDescription>
 *         Verify your email before continuing.
 *       </BannerDescription>
 *     </BannerContent>
 *     <BannerActions>
 *       <Button size="sm" variant="outline">Verify now</Button>
 *     </BannerActions>
 *     <BannerClose onClick={() => setShow(false)} />
 *   </Banner>
 *
 * Differs from Alert in three ways:
 *   - Full container width by default (no rounded corners).
 *   - `sticky` opt-in pins the banner to the top of the scroll viewport.
 *   - Centered max-width content area so long lines stay readable on
 *     wide screens.
 *
 * Use cases: "You're impersonating user X · Stop impersonating",
 * "Verify your email · Verify now", "Maintenance window at 22:00 UTC".
 */
export declare const bannerVariants: (props?: ({
    color?: "primary" | "neutral" | "info" | "success" | "warning" | "error" | "destructive" | null | undefined;
    sticky?: boolean | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export interface BannerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "color">, VariantProps<typeof bannerVariants> {
}
export declare const Banner: React.ForwardRefExoticComponent<BannerProps & React.RefAttributes<HTMLDivElement>>;
export declare const BannerIcon: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLSpanElement> & React.RefAttributes<HTMLSpanElement>>;
export declare const BannerContent: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
export declare const BannerTitle: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLSpanElement> & React.RefAttributes<HTMLSpanElement>>;
export declare const BannerDescription: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLSpanElement> & React.RefAttributes<HTMLSpanElement>>;
export declare const BannerActions: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
export type BannerCloseProps = React.ButtonHTMLAttributes<HTMLButtonElement>;
export declare const BannerClose: React.ForwardRefExoticComponent<BannerCloseProps & React.RefAttributes<HTMLButtonElement>>;
//# sourceMappingURL=banner.d.ts.map