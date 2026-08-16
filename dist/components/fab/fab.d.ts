import * as React from "react";
import { type VariantProps } from "class-variance-authority";
import { type ButtonProps } from "../button/button";
/**
 * FAB — fixed-position floating action button. Wraps the new Button with
 * positioning + elevation. No Radix primitive needed (none exists);
 * shadcn's pattern is the same — a styled positioned button.
 *
 *   <FAB onClick={...} iconLeft={<PlusIcon/>} />
 *   <FAB position="bottom-left" color="error" iconLeft={<TrashIcon/>} />
 *
 * For multi-action speed-dial menus, compose FAB with DropdownMenu —
 * <DropdownMenu><DropdownMenuTrigger asChild><FAB/></...>.
 */
declare const fabContainer: (props?: ({
    position?: "bottom-right" | "bottom-left" | "top-right" | "top-left" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export interface FABProps extends Omit<ButtonProps, "shape" | "size">, VariantProps<typeof fabContainer> {
    size?: "md" | "lg" | "xl";
}
declare const FAB: React.ForwardRefExoticComponent<FABProps & React.RefAttributes<HTMLButtonElement>>;
export { FAB };
//# sourceMappingURL=fab.d.ts.map