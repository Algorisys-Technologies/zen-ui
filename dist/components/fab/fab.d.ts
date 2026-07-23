import { type VariantProps } from "class-variance-authority";
import { type ButtonProps } from "../button/button";
/**
 * FAB — fixed-position floating action button. Wraps the Button primitive
 * with positioning + elevation. No Kobalte primitive needed; shadcn's
 * pattern is the same — a styled positioned button.
 *
 *   <FAB onClick={...} iconLeft={<PlusIcon/>} />
 *   <FAB position="bottom-left" color="error" iconLeft={<TrashIcon/>} />
 *
 * For multi-action speed-dial menus, compose FAB inside Kobalte's
 * DropdownMenu trigger — Solid's `as` prop makes this clean.
 */
declare const fabContainer: (props?: ({
    position?: "bottom-right" | "bottom-left" | "top-right" | "top-left" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export type FABProps = Omit<ButtonProps, "shape" | "size"> & VariantProps<typeof fabContainer> & {
    size?: "md" | "lg" | "xl";
};
export declare const FAB: (rawProps: FABProps) => import("solid-js").JSX.Element;
export {};
//# sourceMappingURL=fab.d.ts.map