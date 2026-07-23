import type { ComponentProps, ValidComponent } from "solid-js";
/**
 * Polymorphic helper used by every component that accepts an `as` prop
 * — Solid's equivalent of Radix's `asChild`. Mirrors Kobalte's
 * convention so consumers see a familiar API.
 *
 *   type ButtonProps<T extends ValidComponent = "button"> =
 *     PolymorphicProps<T, ButtonOwnProps>;
 *
 *   <Button as="a" href="#" />   // typechecks <a href> attrs
 *
 * Internally the component renders <Dynamic component={local.as ?? "default"}>
 * and spreads the rest of the props onto it.
 */
export type PolymorphicProps<T extends ValidComponent, Props = Record<never, never>> = Props & Omit<ComponentProps<T>, keyof Props | "as"> & {
    as?: T;
};
//# sourceMappingURL=polymorphic.d.ts.map