import * as React from "react";
import { cn } from "../../lib/cn";
import { Button, type ButtonProps } from "../button/button";
import { Icon, type IconName } from "../icon/icon";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "../dropdown-menu/dropdown-menu";

/**
 * Toolbar — a row of actions that collapses into an overflow menu when it runs
 * out of room. The overflow is the point; a row of buttons needs no component.
 *
 * See docs/fiori-gap-analysis.md (Tier 2). Fiori's OverflowToolbar physically
 * MOVES controls into a popover when they don't fit.
 *
 *   <Toolbar actions={actions} aria-label="Order actions">
 *     <h2>Orders</h2>
 *   </Toolbar>
 *
 * `actions` is DATA, not children — the one deliberate departure from this
 * library's usual composition, and the reason is structural rather than
 * stylistic: an overflowed action has to re-render as a *menu item*, which is a
 * different element than the button it was. The same React element cannot be in
 * two places, so the toolbar has to know the action's intent (label, icon,
 * onSelect) to render it either way. Compound children could only be shown or
 * hidden, never moved — which is precisely the behaviour that makes a toolbar
 * worth having. `children` covers leading content (a title) that never overflows.
 */

export interface ToolbarAction {
  id: string;
  label: React.ReactNode;
  icon?: IconName;
  onSelect?: () => void;
  disabled?: boolean;
  variant?: ButtonProps["variant"];
  color?: ButtonProps["color"];
  /** `never` pins the action to the bar; anything else collapses when needed. */
  overflow?: "never" | "auto";
  /** Renders a divider before this action, in the bar and in the menu. */
  separatorBefore?: boolean;
}

export interface ToolbarProps extends React.HTMLAttributes<HTMLDivElement> {
  actions: ToolbarAction[];
  /** Accessible name — a toolbar needs one. */
  "aria-label"?: string;
  overflowLabel?: string;
  size?: ButtonProps["size"];
}

export const Toolbar = React.forwardRef<HTMLDivElement, ToolbarProps>(
  ({ actions, overflowLabel = "More actions", size = "sm", className, children, ...props }, ref) => {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const leadingRef = React.useRef<HTMLDivElement>(null);
    const measureRef = React.useRef<HTMLDivElement>(null);
    const overflowRef = React.useRef<HTMLDivElement>(null);

    // How many `auto` actions currently fit. Starts at "all" so the first paint
    // is the common case (everything fits) rather than an empty bar.
    const [visibleCount, setVisibleCount] = React.useState(actions.length);

    const pinned = React.useMemo(() => actions.filter((a) => a.overflow === "never"), [actions]);
    const collapsible = React.useMemo(() => actions.filter((a) => a.overflow !== "never"), [actions]);

    React.useLayoutEffect(() => {
      const container = containerRef.current;
      if (!container || typeof ResizeObserver === "undefined") return;

      const recompute = () => {
        const measure = measureRef.current;
        if (!measure) return;
        // Widths come from a hidden row holding every action at full size.
        // Measuring the VISIBLE row instead would be circular: hiding an action
        // changes the row's width, which changes what fits, which changes what
        // is hidden — a loop that settles on the wrong answer or oscillates.
        const widths = Array.from(measure.children).map((el) => (el as HTMLElement).offsetWidth);
        const GAP = 8; // zen-gap-2
        const pinnedWidth = pinned.reduce(
          (sum, a) => sum + (widths[actions.indexOf(a)] ?? 0) + GAP,
          0,
        );
        const overflowWidth = (overflowRef.current?.offsetWidth ?? 36) + GAP;
        const leadingWidth = leadingRef.current?.offsetWidth ?? 0;

        let budget = container.offsetWidth - leadingWidth - pinnedWidth;
        let fit = 0;
        for (const a of collapsible) {
          const w = (widths[actions.indexOf(a)] ?? 0) + GAP;
          // Once anything is going to overflow, the trigger needs room too.
          const needsTrigger = fit < collapsible.length - 1;
          if (budget - w < (needsTrigger ? overflowWidth : 0)) break;
          budget -= w;
          fit++;
        }
        setVisibleCount(fit);
      };

      recompute();
      const ro = new ResizeObserver(recompute);
      ro.observe(container);
      return () => ro.disconnect();
    }, [actions, pinned, collapsible]);

    const shown = collapsible.slice(0, visibleCount);
    const hidden = collapsible.slice(visibleCount);

    const renderButton = (a: ToolbarAction, key?: string) => (
      <Button
        key={key ?? a.id}
        type="button"
        size={size}
        variant={a.variant ?? "ghost"}
        color={a.color}
        disabled={a.disabled}
        onClick={a.onSelect}
        iconLeft={a.icon ? <Icon name={a.icon} size={14} /> : undefined}
      >
        {a.label}
      </Button>
    );

    return (
      <div
        ref={(node) => {
          containerRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        role="toolbar"
        className={cn(
          "zen-relative zen-flex zen-w-full zen-items-center zen-gap-2 zen-overflow-hidden",
          className,
        )}
        {...props}
      >
        {children ? (
          <div ref={leadingRef} className="zen-flex zen-min-w-0 zen-items-center zen-gap-2">
            {children}
          </div>
        ) : null}

        <div className="zen-ml-auto zen-flex zen-items-center zen-gap-2">
          {pinned.map((a) => (
            <React.Fragment key={a.id}>
              {a.separatorBefore ? (
                <span className="zen-h-5 zen-w-px zen-shrink-0 zen-bg-zen-border" />
              ) : null}
              {renderButton(a)}
            </React.Fragment>
          ))}
          {shown.map((a) => (
            <React.Fragment key={a.id}>
              {a.separatorBefore ? (
                <span className="zen-h-5 zen-w-px zen-shrink-0 zen-bg-zen-border" />
              ) : null}
              {renderButton(a)}
            </React.Fragment>
          ))}

          {hidden.length > 0 ? (
            <div ref={overflowRef}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button type="button" size={size} variant="ghost" aria-label={overflowLabel}>
                    <Icon name="more" size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {hidden.map((a) => (
                    <React.Fragment key={a.id}>
                      {a.separatorBefore ? <DropdownMenuSeparator /> : null}
                      <DropdownMenuItem disabled={a.disabled} onSelect={a.onSelect}>
                        {a.icon ? <Icon name={a.icon} size={14} className="zen-mr-2" /> : null}
                        {a.label}
                      </DropdownMenuItem>
                    </React.Fragment>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : null}
        </div>

        {/*
          Hidden measurement row: every action at full width, out of flow so it
          cannot affect layout. `visibility: hidden` is doing the real work here —
          it removes the subtree from the tab order, which I verified in a browser
          rather than assumed (an `inert` attribute I tried first never rendered
          at all, and would have been taking credit for this). aria-hidden keeps
          it out of the accessibility tree. This is the price of measuring without
          the circular dependency described above.
        */}
        <div
          ref={measureRef}
          aria-hidden
          className="zen-pointer-events-none zen-absolute zen-left-0 zen-top-0 zen-flex zen-gap-2 zen-opacity-0"
          style={{ visibility: "hidden" }}
        >
          {actions.map((a) => renderButton(a, `measure-${a.id}`))}
        </div>
      </div>
    );
  },
);
Toolbar.displayName = "Toolbar";
