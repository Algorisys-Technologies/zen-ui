import { type JSX, type ValidComponent } from "solid-js";
import type { PolymorphicProps } from "../../lib/polymorphic";
/**
 * Breadcrumb — navigation trail primitive. Kobalte has no Breadcrumb, so this
 * is a styled, accessible compound built on semantic <nav>/<ol>/<li> with zen
 * tokens. Every part is opt-in so you can compose freely.
 *
 *   <Breadcrumb>
 *     <BreadcrumbList>
 *       <BreadcrumbItem>
 *         <BreadcrumbLink as={A} href="/">Home</BreadcrumbLink>
 *       </BreadcrumbItem>
 *       <BreadcrumbSeparator />
 *       <BreadcrumbItem>
 *         <BreadcrumbPage>Settings</BreadcrumbPage>
 *       </BreadcrumbItem>
 *     </BreadcrumbList>
 *   </Breadcrumb>
 *
 * Solid port of the React binding. React's `asChild` on BreadcrumbLink maps to
 * this binding's polymorphic `as` prop — the house equivalent (see
 * lib/polymorphic.ts), since Solid has no Radix Slot.
 */
export type BreadcrumbProps = Omit<JSX.HTMLAttributes<HTMLElement>, "class"> & {
    /**
     * Accepted for API parity with the React binding. The trail's separators are
     * rendered by <BreadcrumbSeparator>, so this part does not read it; it is
     * split off the props so it never reaches the DOM as a stray attribute.
     */
    separator?: JSX.Element;
    class?: string;
    children?: JSX.Element;
};
export declare const Breadcrumb: (props: BreadcrumbProps) => JSX.Element;
export type BreadcrumbListProps = Omit<JSX.HTMLAttributes<HTMLOListElement>, "class"> & {
    class?: string;
    children?: JSX.Element;
};
export declare const BreadcrumbList: (props: BreadcrumbListProps) => JSX.Element;
export type BreadcrumbItemProps = Omit<JSX.LiHTMLAttributes<HTMLLIElement>, "class"> & {
    class?: string;
    children?: JSX.Element;
};
export declare const BreadcrumbItem: (props: BreadcrumbItemProps) => JSX.Element;
type BreadcrumbLinkOwnProps = {
    class?: string;
    children?: JSX.Element;
};
export type BreadcrumbLinkProps<T extends ValidComponent = "a"> = PolymorphicProps<T, BreadcrumbLinkOwnProps>;
export declare const BreadcrumbLink: <T extends ValidComponent = "a">(rawProps: BreadcrumbLinkProps<T>) => JSX.Element;
export type BreadcrumbPageProps = Omit<JSX.HTMLAttributes<HTMLSpanElement>, "class"> & {
    class?: string;
    children?: JSX.Element;
};
export declare const BreadcrumbPage: (props: BreadcrumbPageProps) => JSX.Element;
export type BreadcrumbSeparatorProps = Omit<JSX.LiHTMLAttributes<HTMLLIElement>, "class"> & {
    class?: string;
    children?: JSX.Element;
};
export declare const BreadcrumbSeparator: (props: BreadcrumbSeparatorProps) => JSX.Element;
export type BreadcrumbEllipsisProps = Omit<JSX.HTMLAttributes<HTMLSpanElement>, "class"> & {
    class?: string;
};
export declare const BreadcrumbEllipsis: (props: BreadcrumbEllipsisProps) => JSX.Element;
export {};
//# sourceMappingURL=breadcrumb.d.ts.map