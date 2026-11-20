import * as React from "react";
export interface DynamicPageProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Controlled expanded state of the header. */
    headerExpanded?: boolean;
    /** Uncontrolled initial expanded state (default true). */
    defaultHeaderExpanded?: boolean;
    onHeaderExpandedChange?: (expanded: boolean) => void;
    /** Offer the pin toggle that keeps the header expanded while scrolling. */
    headerPinnable?: boolean;
    /** Set false to hide a `<DynamicPageFooter>` without unmounting the page. */
    showFooter?: boolean;
}
export declare const DynamicPage: React.ForwardRefExoticComponent<DynamicPageProps & React.RefAttributes<HTMLDivElement>>;
export interface DynamicPageTitleProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
    heading: React.ReactNode;
    subheading?: React.ReactNode;
    /** Rendered at the trailing edge; does not collapse. */
    actions?: React.ReactNode;
    breadcrumbs?: React.ReactNode;
    /** Extra title content shown only while the header is EXPANDED. */
    expandedContent?: React.ReactNode;
    /** Extra title content shown only while the header is SNAPPED — the way
     *  to keep the facts you lose to the collapse. */
    snappedContent?: React.ReactNode;
}
export declare const DynamicPageTitle: React.ForwardRefExoticComponent<DynamicPageTitleProps & React.RefAttributes<HTMLDivElement>>;
export interface DynamicPageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Names the header region. */
    "aria-label"?: string;
    pinLabel?: string;
    unpinLabel?: string;
}
export declare const DynamicPageHeader: React.ForwardRefExoticComponent<DynamicPageHeaderProps & React.RefAttributes<HTMLDivElement>>;
export type DynamicPageFooterProps = React.HTMLAttributes<HTMLDivElement>;
export declare const DynamicPageFooter: React.ForwardRefExoticComponent<DynamicPageFooterProps & React.RefAttributes<HTMLDivElement>>;
//# sourceMappingURL=dynamic-page.d.ts.map