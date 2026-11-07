import * as React from "react";
import { type VariantProps } from "class-variance-authority";
/**
 * Card — generic surface primitive. Compound API for the common
 * Header / Content / Footer layout, but every part is opt-in so you
 * can compose freely.
 *
 *   <Card>
 *     <CardHeader>
 *       <CardTitle>Account</CardTitle>
 *       <CardDescription>Your billing + contact info.</CardDescription>
 *     </CardHeader>
 *     <CardContent>…</CardContent>
 *     <CardFooter>
 *       <Button>Save</Button>
 *     </CardFooter>
 *   </Card>
 *
 * For "pick one of these options" / plan picker / goal picker patterns,
 * use the SelectableCard / SelectableCardGroup variant in
 * card.selectable.tsx — those add radio-group semantics + selected
 * styling on top of the base Card surface.
 */
declare const cardVariants: (props?: ({
    variant?: "ghost" | "elevated" | "outlined" | null | undefined;
    padding?: "none" | "sm" | "md" | "lg" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export interface CardProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {
}
export declare const Card: React.ForwardRefExoticComponent<CardProps & React.RefAttributes<HTMLDivElement>>;
export declare const CardHeader: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
export declare const CardTitle: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLHeadingElement> & React.RefAttributes<HTMLHeadingElement>>;
export declare const CardDescription: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLParagraphElement> & React.RefAttributes<HTMLParagraphElement>>;
export declare const CardContent: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
export declare const CardFooter: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
export { cardVariants };
//# sourceMappingURL=card.d.ts.map