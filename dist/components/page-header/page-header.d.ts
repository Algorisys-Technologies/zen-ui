import * as React from "react";
/**
 * PageHeader — a heading with a back affordance and one action.
 *
 *   <PageHeader
 *     title="Assessment results"
 *     subtitle="32 responses"
 *     onBack={() => navigate(-1)}
 *     actions={<Button>Export</Button>}
 *   />
 *
 * The library already has `DynamicPage` and `ObjectPageLayout`, but those are
 * app-frame weight — snapping headers, pinnable title bars, anchored sections.
 * Most screens want none of that and just need a title, somewhere to go back
 * to, and a button on the right. Reaching for DynamicPage to get a heading is
 * how a page ends up with a scroll-linked header it never asked for.
 *
 * Everything except `title` is optional and renders nothing when absent, so
 * the plain case stays a heading and no wrapper divs.
 *
 * Deliberately NOT here: a checkbox. The header this replaces grew one, and a
 * selection control in a page heading has no relationship to the heading — it
 * belongs to whatever it selects. Porting the wart along with the shape is how
 * the next component inherits it.
 *
 * `title` renders as `<h2>`, matching DynamicPage and ObjectPageLayout: the
 * `<h1>` belongs to the application shell, and a page-level component that
 * claims it fights the app it is dropped into.
 */
export interface PageHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
    title: React.ReactNode;
    subtitle?: React.ReactNode;
    /** Renders a back affordance to the left of the title. Without it, none. */
    onBack?: () => void;
    /** Accessible name for the back control — it is icon-only. Default "Back". */
    backLabel?: string;
    /** Right-aligned actions. */
    actions?: React.ReactNode;
    /** Sits beside the title, e.g. an info Tooltip. */
    info?: React.ReactNode;
    /** Sits above the title, e.g. a Breadcrumb. */
    breadcrumb?: React.ReactNode;
    className?: string;
}
export declare const PageHeader: React.ForwardRefExoticComponent<PageHeaderProps & React.RefAttributes<HTMLDivElement>>;
//# sourceMappingURL=page-header.d.ts.map