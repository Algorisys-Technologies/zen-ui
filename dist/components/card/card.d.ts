import { type JSX } from "solid-js";
import { type VariantProps } from "class-variance-authority";
/**
 * Card — generic surface primitive. Compound API for the common
 * Header / Content / Footer layout, every part opt-in.
 *
 *   <Card>
 *     <CardHeader>
 *       <CardTitle>Account</CardTitle>
 *       <CardDescription>Your billing + contact info.</CardDescription>
 *     </CardHeader>
 *     <CardContent>…</CardContent>
 *     <CardFooter><Button>Save</Button></CardFooter>
 *   </Card>
 */
declare const cardVariants: (props?: ({
    variant?: "ghost" | "elevated" | "outlined" | null | undefined;
    padding?: "sm" | "md" | "lg" | "none" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export type CardProps = VariantProps<typeof cardVariants> & Omit<JSX.HTMLAttributes<HTMLDivElement>, "class"> & {
    class?: string;
    children?: JSX.Element;
};
export declare const Card: (props: CardProps) => JSX.Element;
type SectionProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "class"> & {
    class?: string;
    children?: JSX.Element;
};
export declare const CardHeader: (props: SectionProps) => JSX.Element;
type TitleProps = Omit<JSX.HTMLAttributes<HTMLHeadingElement>, "class"> & {
    class?: string;
    children?: JSX.Element;
};
export declare const CardTitle: (props: TitleProps) => JSX.Element;
type ParagraphProps = Omit<JSX.HTMLAttributes<HTMLParagraphElement>, "class"> & {
    class?: string;
    children?: JSX.Element;
};
export declare const CardDescription: (props: ParagraphProps) => JSX.Element;
export declare const CardContent: (props: SectionProps) => JSX.Element;
export declare const CardFooter: (props: SectionProps) => JSX.Element;
export { cardVariants };
//# sourceMappingURL=card.d.ts.map