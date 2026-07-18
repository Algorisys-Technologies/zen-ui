import { cn } from "../../lib/cn";
import {
  applyProps,
  Disposer,
  toNodes,
  type BaseProps,
  type Child,
  type ZenComponent,
} from "../../lib/component";
import { Icon } from "../icon/icon";

/**
 * PageHeader — a heading with a back affordance and one action.
 *
 *   PageHeader({
 *     title: "Assessment results",
 *     subtitle: "32 responses",
 *     onBack: () => history.back(),
 *     actions: Button({ children: "Export" }),
 *   })
 *
 * The library already has `DynamicPage` and `ObjectPageLayout`, but those are
 * app-frame weight — snapping headers, pinnable title bars, anchored sections.
 * Most screens want none of that and just need a title, somewhere to go back
 * to, and a button on the right. Reaching for DynamicPage to get a heading is
 * how a page ends up with a scroll-linked header it never asked for.
 *
 * Everything except `title` is optional and renders nothing when absent, so the
 * plain case stays a heading and no wrapper divs.
 *
 * Deliberately NOT here: a checkbox. A selection control in a page heading has
 * no relationship to the heading — it belongs to whatever it selects.
 *
 * `title` renders as `<h2>`, matching DynamicPage and ObjectPageLayout: the
 * `<h1>` belongs to the application shell, and a page-level component that
 * claims it fights the app it is dropped into.
 *
 * `title`, `subtitle`, `actions`, `info` and `breadcrumb` are slots (any Child),
 * so the header does not need to know what a Breadcrumb, Badge or Tooltip is —
 * the React binding took ReactNode there for the same reason.
 */
export interface PageHeaderProps extends Omit<BaseProps, "children"> {
  title: Child;
  subtitle?: Child;
  /** Renders a back affordance to the left of the title. Without it, none. */
  onBack?: () => void;
  /** Accessible name for the back control — it is icon-only. Default "Back". */
  backLabel?: string;
  /** Right-aligned actions. */
  actions?: Child;
  /** Sits beside the title, e.g. an info Tooltip. */
  info?: Child;
  /** Sits above the title, e.g. a Breadcrumb. */
  breadcrumb?: Child;
  class?: string;
}

const div = (className: string, children?: Child): HTMLDivElement => {
  const el = document.createElement("div");
  el.className = className;
  if (children !== undefined) el.replaceChildren(...toNodes(children));
  return el;
};

export function PageHeader(props: PageHeaderProps): ZenComponent<PageHeaderProps> {
  let current: PageHeaderProps = { ...props };
  const el = document.createElement("div");
  const disposer = new Disposer();
  let removeProps: (() => void) | undefined;

  const render = () => {
    const {
      title,
      subtitle,
      onBack,
      backLabel = "Back",
      actions,
      info,
      breadcrumb,
      class: className,
      ...rest
    } = current;

    el.className = cn("zen-flex zen-flex-col zen-gap-2", className);

    const kids: Node[] = [];

    // breadcrumb sits above the title.
    if (breadcrumb !== undefined && breadcrumb !== null && breadcrumb !== false) {
      kids.push(...toNodes(breadcrumb));
    }

    // items-start, not items-center: a subtitle that wraps to two or three lines
    // would drag a vertically-centred back button and action row down with it,
    // away from the title they belong to.
    const row = div("zen-flex zen-items-start zen-gap-3");

    if (onBack) {
      const back = document.createElement("button");
      back.type = "button";
      back.setAttribute("aria-label", backLabel);
      // h-8 matches the title's line box, so the control sits on the title's line
      // rather than floating above it.
      back.className = cn(
        "zen-inline-flex zen-h-8 zen-w-8 zen-shrink-0 zen-items-center zen-justify-center",
        "zen-cursor-pointer zen-rounded-zen-sm zen-border-0 zen-bg-transparent",
        "zen-text-zen-muted-fg zen-transition-colors",
        "hover:zen-bg-zen-muted hover:zen-text-zen-foreground",
        "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
      );
      back.addEventListener("click", onBack);
      back.append(Icon({ name: "arrow-left", size: 18 }).el);
      row.append(back);
    }

    // min-w-0 is what lets the title truncate instead of shoving the actions off
    // the right edge.
    const titleCol = div("zen-flex zen-min-w-0 zen-flex-1 zen-flex-col zen-gap-0.5");

    const titleRow = div("zen-flex zen-min-w-0 zen-items-center zen-gap-2");
    const h2 = document.createElement("h2");
    h2.className =
      "zen-m-0 zen-min-w-0 zen-truncate zen-text-xl zen-font-semibold zen-leading-8 zen-text-zen-foreground";
    h2.replaceChildren(...toNodes(title));
    titleRow.append(h2);
    if (info !== undefined && info !== null && info !== false) {
      titleRow.append(div("zen-inline-flex zen-shrink-0 zen-items-center", info));
    }
    titleCol.append(titleRow);

    if (subtitle !== undefined && subtitle !== null && subtitle !== false) {
      const p = document.createElement("p");
      p.className = "zen-m-0 zen-text-sm zen-text-zen-muted-fg";
      p.replaceChildren(...toNodes(subtitle));
      titleCol.append(p);
    }
    row.append(titleCol);

    if (actions !== undefined && actions !== null && actions !== false) {
      row.append(div("zen-flex zen-shrink-0 zen-items-center zen-gap-2", actions));
    }

    kids.push(row);
    el.replaceChildren(...kids);

    // Forward the leftover props (id, style, data-*, aria-*) onto the root, the
    // same set React spreads. Re-applying means re-adding listeners, so drop the
    // previous set first.
    removeProps?.();
    removeProps = applyProps(el, rest as Record<string, unknown>);
  };

  render();
  disposer.add(() => removeProps?.());

  return {
    el,
    update(next) {
      current = { ...current, ...next };
      render();
    },
    destroy() {
      disposer.dispose();
      el.remove();
    },
  };
}
