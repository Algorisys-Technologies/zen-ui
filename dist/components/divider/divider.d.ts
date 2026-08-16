import * as React from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";
/**
 * Separator (formerly "Divider") — built on @radix-ui/react-separator.
 *
 * Horizontal or vertical line that semantically separates content.
 * Decorative by default (decorative=true) so screen readers skip it; pass
 * decorative={false} when the separation is meaningful for assistive tech.
 */
export type SeparatorProps = React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>;
declare const Separator: React.ForwardRefExoticComponent<Omit<SeparatorPrimitive.SeparatorProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
export { Separator };
//# sourceMappingURL=divider.d.ts.map