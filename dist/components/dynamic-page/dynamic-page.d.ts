import { type JSX, type ComponentProps } from "solid-js";
export type DynamicPageProps = ComponentProps<"div"> & {
    /** Controlled expanded state of the header. */
    headerExpanded?: boolean;
    /** Uncontrolled initial expanded state (default true). */
    defaultHeaderExpanded?: boolean;
    onHeaderExpandedChange?: (expanded: boolean) => void;
    /** Offer the pin toggle that keeps the header expanded while scrolling. */
    headerPinnable?: boolean;
    /** Set false to hide a `<DynamicPageFooter>` without unmounting the page. */
    showFooter?: boolean;
};
export declare const DynamicPage: (props: DynamicPageProps) => JSX.Element;
export type DynamicPageTitleProps = Omit<ComponentProps<"div">, "title"> & {
    heading: JSX.Element;
    subheading?: JSX.Element;
    /** Rendered at the trailing edge; does not collapse. */
    actions?: JSX.Element;
    breadcrumbs?: JSX.Element;
    /** Extra title content shown only while the header is EXPANDED. */
    expandedContent?: JSX.Element;
    /** Extra title content shown only while the header is SNAPPED — the way
     *  to keep the facts you lose to the collapse. */
    snappedContent?: JSX.Element;
};
export declare const DynamicPageTitle: (props: DynamicPageTitleProps) => JSX.Element;
export type DynamicPageHeaderProps = ComponentProps<"div"> & {
    pinLabel?: string;
    unpinLabel?: string;
};
export declare const DynamicPageHeader: (props: DynamicPageHeaderProps) => JSX.Element;
export type DynamicPageFooterProps = ComponentProps<"div">;
export declare const DynamicPageFooter: (props: DynamicPageFooterProps) => JSX.Element;
//# sourceMappingURL=dynamic-page.d.ts.map