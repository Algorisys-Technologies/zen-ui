import { type JSX } from "solid-js";
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
 * to, and a button on the right.
 *
 * Deliberately NOT here: a checkbox. The header this replaces grew one, and a
 * selection control in a page heading has no relationship to the heading.
 *
 * `title` renders as `<h2>`, matching DynamicPage and ObjectPageLayout: the
 * `<h1>` belongs to the application shell.
 *
 * Mirrors the React binding's API.
 */
export interface PageHeaderProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, "title"> {
    title: JSX.Element;
    subtitle?: JSX.Element;
    /** Renders a back affordance to the left of the title. Without it, none. */
    onBack?: () => void;
    /** Accessible name for the back control — it is icon-only. Default "Back". */
    backLabel?: string;
    /** Right-aligned actions. */
    actions?: JSX.Element;
    /** Sits beside the title, e.g. an info Tooltip. */
    info?: JSX.Element;
    /** Sits above the title, e.g. a Breadcrumb. */
    breadcrumb?: JSX.Element;
    class?: string;
}
export declare const PageHeader: (props: PageHeaderProps) => JSX.Element;
//# sourceMappingURL=page-header.d.ts.map